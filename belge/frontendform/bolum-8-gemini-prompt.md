# BarterBorsa Frontend — Bölüm 8: Chat + Bildirimler

## SİSTEM TALİMATLARI

Bölüm 1-7 tamamlandı. Bu bölümde **real-time mesajlaşma** (Socket.IO) ve **bildirim sistemi** yazılacak.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK**
- `<script setup lang="ts">` zorunlu
- SSR-safe: Socket.IO sadece client-side (`onMounted` veya `import.meta.client`)
- Bölüm 1-7'deki composable/component'leri kullan
- `brand-*` ve `surface-*` Tailwind renk paleti
- `lodash-es` import yerine `@vueuse/core` debounce kullan (lodash bağımlılığı yok)

### ÖNEMLİ MİMARİ BİLGİ

**Socket.IO yapısı (backend):**
- Ana socket: `http://localhost:3001` (path: `/socket.io`)
- Chat namespace: `/chat` — mesajlaşma için
- Tracking namespace: `/tracking` — kargo takibi (ileride)

**Chat akışı:**
1. Socket bağlantısı kur (token ile auth)
2. `joinTradeRoom` emit → tradeOfferId ile odaya katıl → geçmiş mesajlar gelir
3. `sendMessage` emit → mesaj gönder → `newMessage` event ile tüm oda üyelerine broadcast
4. `typing` emit → yazıyor durumu
5. `markAsRead` emit → okundu bilgisi
6. `leaveTradeRoom` emit → odadan ayrıl

**Chat odaları:** Her oda bir `tradeOfferId` veya `orderId` ile ilişkili. Backend ChatRoom entity'si oluşturur.

### BACKEND API ENDPOINTLERİ

```
# Chat (REST — geçmiş yükleme ve oda listesi)
GET  /chat/rooms                       → { success, data: ChatRoom[] }
GET  /chat/rooms/:id/messages          → { success, data: ChatMessage[], meta }  query: page, limit
POST /chat/rooms/:id/messages          → { success, data: ChatMessage }  (REST fallback)

# Chat (Socket.IO — real-time)
# Client → Server events:
  joinTradeRoom { tradeOfferId }       → callback({ status, data: Message[] })
  sendMessage { tradeOfferId, content, tempId } → callback({ status, message? })
  typing { tradeOfferId, isTyping }
  markAsRead { tradeOfferId }
  leaveTradeRoom { tradeOfferId }

# Server → Client events:
  newMessage (Message)
  userTyping ({ userId, username, isTyping })
  userJoined ({ userId })
  userLeft ({ userId })
  messagesRead ({ messageIds, readAt })

# Bildirimler
GET  /notifications                    → { success, data: Notification[], meta }  query: page, limit, isRead
PATCH /notifications/:id/read          → { success }
PATCH /notifications/read-all          → { success }
GET  /notifications/unread-count       → { success, data: { count } }

# Global Socket Events (ana namespace):
  notification ({ type, from?, message?, status? })
  tier_upgrade ({ previousTier, newTier, xpTotal })
  xp_earned ({ amount, source, newTotal })
  milestone_reward ({ type, xpEarned, description? })
```

---

## 1. TİP TANIMLARI — `types/chat.ts`

```typescript
import type { BaseEntity } from '~/types/common'

/** Chat odası */
export interface ChatRoom extends BaseEntity {
  type: 'TRADE' | 'ORDER' | 'SUPPORT'
  tradeOfferId: string | null
  orderId: string | null
  participantIds: string[]
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  otherParticipant?: {
    name: string
    avatar: string | null
    isOnline: boolean
  }
}

/** Chat mesajı */
export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'SYSTEM'
  createdAt: string
  readAt: string | null
  // Client-side ek alanlar
  tempId?: string
  status?: MessageStatus
  isFromMe?: boolean
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'error' | 'warning'

/** Bildirim */
export interface AppNotification extends BaseEntity {
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  link: string | null
  data: Record<string, unknown> | null
}

export type NotificationType =
  | 'ORDER_STATUS'
  | 'BARTER_OFFER'
  | 'AUCTION_BID'
  | 'CAMPAIGN'
  | 'SYSTEM'
  | 'CHAT_MESSAGE'

/** Socket event tipleri */
export interface SocketNotificationEvent {
  type: string
  from?: string
  message?: string
  by?: string
  status?: string
}

export interface SocketTierUpgradeEvent {
  previousTier: string
  newTier: string
  xpTotal: number
}

export interface SocketXpEarnedEvent {
  amount: number
  source: string
  newTotal: number
  tier?: string
}

export interface SocketMilestoneEvent {
  type: 'WEEKLY' | 'MONTHLY' | 'SPECIAL'
  xpEarned: number
  description?: string
}
```

---

## 2. COMPOSABLE'LAR ve STORE'LAR

### 2.1 `composables/useSocket.ts`

Global socket bağlantısı — layout'ta bir kez başlatılır, tüm uygulamada kullanılır.

```typescript
import { io, type Socket } from 'socket.io-client'
import type { SocketNotificationEvent, SocketTierUpgradeEvent, SocketXpEarnedEvent, SocketMilestoneEvent } from '~/types/chat'

/** Global Socket.IO bağlantısı */
export function useSocket() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const toast = useToast()

  // Singleton socket — useState ile SSR-safe
  const socket = useState<Socket | null>('global_socket', () => null)

  function connect(companyId?: string) {
    if (!import.meta.client) return
    if (socket.value?.connected) {
      if (companyId) socket.value.emit('join_company', companyId)
      return
    }

    // Backend URL (proxy değil, doğrudan)
    const backendUrl = (config.public.apiBase as string || 'http://localhost:3001/api/v1')
      .replace(/\/api\/v1\/?$/, '') || 'http://localhost:3001'

    socket.value = io(backendUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      auth: { token: authStore.token || useCookie('access_token').value },
    })

    socket.value.on('connect', () => {
      if (companyId) socket.value?.emit('join_company', companyId)
      // Kullanıcının kişisel room'una katıl
      const userId = authStore.user?.id
      if (userId) socket.value?.emit('join_user', { userId: String(userId) })
    })

    // Bildirim event'leri
    socket.value.on('notification', (data: SocketNotificationEvent) => {
      if (data.type === 'new_offer') {
        toast.info(`Yeni Teklif: ${data.from || 'Firma'} — ${data.message || ''}`)
      } else if (data.type === 'offer_update') {
        const statusMap: Record<string, string> = { accepted: 'Kabul Edildi', rejected: 'Reddedildi' }
        toast.success(`Teklif: ${data.by || 'Firma'} — ${statusMap[data.status || ''] || data.status}`)
      } else if (data.type === 'trade_completed') {
        toast.success('Takas tamamlandı!')
      }
    })

    // Loyalty event'leri
    socket.value.on('tier_upgrade', (data: SocketTierUpgradeEvent) => {
      toast.success(`Tebrikler! ${data.previousTier} → ${data.newTier} seviyesine yükseldiniz!`)
      authStore.fetchUser(true).catch(() => {})
    })

    socket.value.on('xp_earned', (data: SocketXpEarnedEvent) => {
      // Sessiz güncelleme — toast gösterme (spam olur)
      if (authStore.user?.userLevel) {
        (authStore.user.userLevel as { currentXP: number }).currentXP = data.newTotal
      }
    })

    socket.value.on('milestone_reward', (data: SocketMilestoneEvent) => {
      const label = data.type === 'WEEKLY' ? 'Haftalık' : data.type === 'MONTHLY' ? 'Aylık' : 'Özel'
      toast.success(`${label} milestone tamamlandı! +${data.xpEarned} XP`)
    })

    socket.value.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  return { socket, connect, disconnect }
}
```

### 2.2 `stores/chat.ts`

Chat store — Socket.IO `/chat` namespace üzerinden mesajlaşma.

```typescript
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'
import type { ChatMessage, MessageStatus } from '~/types/chat'

export const useChatStore = defineStore('chat', () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // State
  const socket = ref<Socket | null>(null)
  const messages = ref<ChatMessage[]>([])
  const isConnected = ref(false)
  const activeRoomId = ref<string | null>(null)
  const roomOnlineCount = ref(0)
  const typingUsers = ref<Map<string, string>>(new Map())

  // Getters
  const typingList = computed(() => Array.from(typingUsers.value.values()))
  const typingText = computed(() => {
    const users = typingList.value
    if (users.length === 0) return ''
    if (users.length === 1) return `${users[0]} yazıyor...`
    return 'Birkaç kişi yazıyor...'
  })

  // Actions
  function connect() {
    if (socket.value) return
    if (!import.meta.client) return

    const backendUrl = (config.public.apiBase as string || 'http://localhost:3001/api/v1')
      .replace(/\/api\/v1\/?$/, '') || 'http://localhost:3001'

    socket.value = io(`${backendUrl}/chat`, {
      transports: ['polling', 'websocket'],
      auth: { token: authStore.token || useCookie('access_token').value },
    })

    socket.value.on('connect', () => { isConnected.value = true })
    socket.value.on('disconnect', () => { isConnected.value = false })

    socket.value.on('newMessage', (msg: ChatMessage) => {
      addMessage({ ...msg, isFromMe: msg.senderId === authStore.user?.id })
    })

    socket.value.on('userTyping', ({ userId, username, isTyping: typing }: { userId: string; username: string; isTyping: boolean }) => {
      if (typing) typingUsers.value.set(userId, username)
      else typingUsers.value.delete(userId)
    })

    socket.value.on('userJoined', () => { roomOnlineCount.value++ })
    socket.value.on('userLeft', () => { roomOnlineCount.value = Math.max(0, roomOnlineCount.value - 1) })

    socket.value.on('messagesRead', ({ messageIds, readAt }: { messageIds: string[]; readAt: string }) => {
      messages.value.forEach((m) => {
        if (messageIds.length === 0 || messageIds.includes(m.id)) {
          m.readAt = readAt
        }
      })
    })
  }

  function disconnect() {
    socket.value?.disconnect()
    socket.value = null
    isConnected.value = false
    messages.value = []
    activeRoomId.value = null
  }

  async function joinRoom(tradeOfferId: string): Promise<ChatMessage[]> {
    if (!socket.value) connect()

    // Bağlantıyı bekle
    if (socket.value && !socket.value.connected) {
      await new Promise<void>((resolve) => {
        socket.value?.once('connect', () => resolve())
        setTimeout(() => resolve(), 5000)
      })
    }

    activeRoomId.value = tradeOfferId
    messages.value = []

    return new Promise((resolve, reject) => {
      socket.value?.emit('joinTradeRoom', { tradeOfferId }, (response: { status: string; data?: ChatMessage[]; message?: string }) => {
        if (response.status === 'ok') {
          if (response.data) {
            messages.value = response.data.map((msg) => ({
              ...msg,
              isFromMe: msg.senderId === authStore.user?.id,
            }))
          }
          resolve(response.data || [])
        } else {
          reject(new Error(response.message || 'Odaya katılınamadı'))
        }
      })
    })
  }

  function addMessage(message: ChatMessage) {
    // Optimistic UI: tempId ile zaten eklenmişse güncelle
    if (message.tempId) {
      const idx = messages.value.findIndex((m) => m.tempId === message.tempId)
      if (idx !== -1) {
        messages.value[idx] = { ...messages.value[idx], ...message, status: 'sent' }
        return
      }
    }
    messages.value.push(message)
  }

  function updateMessageStatus(tempId: string, status: MessageStatus, errorMsg?: string) {
    const msg = messages.value.find((m) => m.tempId === tempId)
    if (msg) {
      msg.status = status
      if (errorMsg && status === 'error') {
        msg.content += `\n[Hata: ${errorMsg}]`
      }
    }
  }

  function resendMessage(tempId: string, tradeOfferId: string) {
    const msg = messages.value.find((m) => m.tempId === tempId)
    if (!msg) return
    msg.status = 'pending'
    socket.value?.emit('sendMessage', { tradeOfferId, content: msg.content, tempId }, (response: { status: string; message?: string }) => {
      updateMessageStatus(tempId, response.status === 'ok' ? 'sent' : 'error', response.message)
    })
  }

  return {
    socket, messages, isConnected, activeRoomId, roomOnlineCount,
    typingList, typingText,
    connect, disconnect, joinRoom, addMessage, updateMessageStatus, resendMessage,
  }
})
```

### 2.3 `composables/useChat.ts`

Sayfa seviyesinde chat composable — belirli bir tradeOfferId için:

```typescript
import { useDebounceFn } from '@vueuse/core'
import type { ChatMessage } from '~/types/chat'

export function useChat(tradeOfferId: string) {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const currentUserId = authStore.user?.id

  const isTyping = ref(false)

  // Yazıyor durumu — 2sn sonra otomatik kapat
  const stopTyping = useDebounceFn(() => {
    chatStore.socket?.emit('typing', { tradeOfferId, isTyping: false })
    isTyping.value = false
  }, 2000)

  function onTyping() {
    if (!isTyping.value) {
      chatStore.socket?.emit('typing', { tradeOfferId, isTyping: true })
      isTyping.value = true
    }
    stopTyping()
  }

  /** Mesaj gönder (Optimistic UI) */
  function sendMessage(content: string) {
    if (!content.trim()) return

    const tempId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`

    // 1. Hemen ekle (optimistic)
    const optimistic: ChatMessage = {
      id: tempId,
      tempId,
      chatRoomId: '',
      senderId: currentUserId || '',
      content: content.trim(),
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      readAt: null,
      status: 'pending',
      isFromMe: true,
    }
    chatStore.addMessage(optimistic)

    // 2. Sunucuya gönder
    chatStore.socket?.emit('sendMessage', { tradeOfferId, content: content.trim(), tempId },
      (response: { status: string; message?: string }) => {
        chatStore.updateMessageStatus(tempId, response.status === 'ok' ? 'sent' : 'error', response.message)
      },
    )
  }

  /** Odaya katıl */
  async function init() {
    try {
      await chatStore.joinRoom(tradeOfferId)
    } catch (err) {
      console.error('[useChat] joinRoom error:', err)
    }
  }

  /** Okundu işaretle */
  function markAsRead() {
    chatStore.socket?.emit('markAsRead', { tradeOfferId })
  }

  /** Başarısız mesajı tekrar gönder */
  function retryMessage(tempId: string) {
    chatStore.resendMessage(tempId, tradeOfferId)
  }

  onUnmounted(() => {
    chatStore.socket?.emit('leaveTradeRoom', { tradeOfferId })
  })

  return {
    messages: computed(() => chatStore.messages),
    isConnected: computed(() => chatStore.isConnected),
    typingList: computed(() => chatStore.typingList),
    typingText: computed(() => chatStore.typingText),
    sendMessage, retryMessage, onTyping, markAsRead, init,
  }
}
```

### 2.4 `composables/useNotifications.ts`

```typescript
import type { AppNotification } from '~/types/chat'
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '~/types/api'

export function useNotifications() {
  const { $api } = useApi()

  const notifications = ref<AppNotification[]>([])
  const loading = ref(false)
  const meta = ref<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const unreadCount = ref(0)

  async function fetchNotifications(params?: { page?: number; isRead?: boolean }) {
    loading.value = true
    try {
      const response = await $api<PaginatedResponse<AppNotification>>('notifications', {
        query: { page: params?.page || 1, limit: 20, isRead: params?.isRead },
      })
      if (response.success) {
        notifications.value = response.data || []
        if (response.meta) meta.value = response.meta
      }
    } catch { /* silent */ }
    finally { loading.value = false }
  }

  async function fetchUnreadCount() {
    try {
      const response = await $api<ApiResponse<{ count: number }>>('notifications/unread-count', {
        showErrorToast: false,
      })
      if (response.success) unreadCount.value = response.data?.count || 0
    } catch { /* silent */ }
  }

  async function markAsRead(id: string) {
    await $api<ApiResponse<void>>(`notifications/${id}/read`, { method: 'PATCH' })
    const notif = notifications.value.find((n) => n.id === id)
    if (notif) notif.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function markAllAsRead() {
    await $api<ApiResponse<void>>('notifications/read-all', { method: 'PATCH' })
    notifications.value.forEach((n) => { n.isRead = true })
    unreadCount.value = 0
  }

  /** Bildirim tıklanınca ilgili sayfaya yönlendir */
  function getNotificationLink(notif: AppNotification): string {
    switch (notif.type) {
      case 'ORDER_STATUS': return `/account/orders/${notif.data?.orderId || ''}`
      case 'BARTER_OFFER': return `/barter/offers/${notif.data?.offerId || ''}`
      case 'AUCTION_BID': return `/auctions/${notif.data?.auctionId || ''}`
      case 'CHAT_MESSAGE': return `/messages/${notif.data?.roomId || ''}`
      default: return notif.link || '#'
    }
  }

  return {
    notifications, loading, meta, unreadCount,
    fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, getNotificationLink,
  }
}
```

---

## 3. SAYFALAR

### 3.1 `pages/messages/index.vue` — Sohbet Listesi

```
Layout: default
Middleware: auth

Yapı:
- Başlık: "Mesajlar"
- Chat odaları listesi:
  - Her oda: ChatRoomCard component
    - Karşı taraf avatar + isim
    - Son mesaj önizleme (kırpılmış)
    - Tarih
    - Okunmamış badge (unreadCount > 0)
    - Online/offline durumu (yeşil/gri nokta)
  - Tıklayınca → /messages/:roomId
- Boş state: "Henüz mesajınız yok"

Veri: GET /chat/rooms → ChatRoom listesi
```

### 3.2 `pages/messages/[roomId].vue` — Sohbet Odası

```
Layout: default
Middleware: auth

Yapı — classic messenger layout:

Üst bar:
  - Geri butonu (← /messages)
  - Karşı taraf bilgisi (avatar + isim + online durumu)
  - İlgili teklif/sipariş linki (varsa)

Mesaj alanı (ortada, scroll):
  - Mesaj balonları: sol (karşı taraf) / sağ (ben)
  - Her balon: içerik + saat + durum ikonu (pending/sent/read)
  - SYSTEM mesajları: ortalanmış, gri arka plan
  - IMAGE mesajları: görsel + altında saat
  - "Yazıyor..." göstergesi (altta, sol tarafta)
  - Scroll: en son mesaj altta, yukarı scroll → eski mesajlar (lazy load opsiyonel)
  - Mesaj gönderilince otomatik scroll-to-bottom

Alt bar:
  - Input: mesaj yazma alanı
  - Gönder butonu (sağda, ikon)
  - Göndermede: onTyping() → enter veya buton → sendMessage()
  - Hata durumunda: "Tekrar gönder" butonu

Composable: useChat(roomId) — init(), sendMessage(), onTyping(), markAsRead()

onMounted: init() → odaya katıl + geçmiş mesajlar yükle
onUnmounted: leaveTradeRoom emit (composable'da zaten var)
```

### 3.3 `pages/account/notifications.vue` — Bildirim Merkezi (GÜNCELLENDİ)

Bölüm 3'te placeholder yazılmıştı. Şimdi tam implementasyon:

```
Yapı:
- Başlık + "Tümünü Okundu İşaretle" butonu
- Filtre: Tümü / Okunmamış
- Bildirim listesi:
  - Her bildirim: NotificationItem component
    - Tip ikonu (sipariş, teklif, artırma, kampanya, sistem)
    - Başlık + mesaj
    - Tarih
    - Okunmamış → sol kenarda mavi çizgi/nokta
    - Tıklanınca → markAsRead + yönlendir (getNotificationLink)
- Pagination
- Boş state

Composable: useNotifications()
```

---

## 4. COMPONENT'LER

### 4.1 `components/chat/`

```
ChatRoomList.vue           — Oda listesi
  Props: rooms: ChatRoom[]
  Emits: select: (roomId: string)

ChatRoomCard.vue           — Tek oda kartı
  Props: room: ChatRoom
  Yapı: avatar, isim, son mesaj, tarih, okunmamış badge, online nokta

ChatRoom.vue               — Mesaj akışı container
  Props: roomId: string
  İç composable: useChat(roomId)
  Yapı: mesaj listesi + input

ChatMessage.vue            — Tek mesaj balonu
  Props: message: ChatMessage, isMine: boolean
  Yapı:
    - isMine → sağda, brand-600 arka plan, beyaz metin
    - karşı taraf → solda, surface-100 arka plan
    - SYSTEM → ortalanmış, küçük, gri
    - Saat gösterimi
    - Durum ikonu (pending: saat, sent: tek tik, read: çift tik, error: kırmızı ünlem)
    - error durumunda: "Tekrar gönder" butonu

ChatInput.vue              — Mesaj yazma alanı
  Props: disabled: boolean
  Emits: send: (content: string), typing: ()
  Yapı: textarea (auto-resize) + gönder butonu (PaperAirplaneIcon)
  Enter → gönder (Shift+Enter → yeni satır)

ChatTypingIndicator.vue    — "Yazıyor..." göstergesi
  Props: text: string
  Yapı: 3 nokta animasyonu + metin

ChatOnlineIndicator.vue    — Online/offline durumu
  Props: isOnline: boolean
  Yapı: yeşil/gri küçük nokta
```

### 4.2 `components/notification/`

```
NotificationBell.vue       — Header'daki bildirim ikonu
  İç composable: useNotifications().fetchUnreadCount()
  Yapı: BellIcon + unreadCount badge (kırmızı, sağ üst)
  Tıklanınca: NotificationDropdown aç/kapa

NotificationDropdown.vue   — Dropdown: son bildirimler
  Props: notifications: AppNotification[]
  Emits: close, markRead
  Yapı: son 5 bildirim + "Tümünü Gör" linki → /account/notifications

NotificationItem.vue       — Tekil bildirim satırı
  Props: notification: AppNotification
  Emits: click
  Yapı: tip ikonu + başlık + mesaj + tarih + okunmamış göstergesi
```

---

## 5. LAYOUT / HEADER GÜNCELLEMELERİ

### AppHeader.vue güncelleme:
- NotificationBell component'ini header'a ekle (profil menüsünün yanına)
- Okunmamış bildirim sayısı badge

### Default layout güncelleme:
- onMounted'da socket bağlantısı kur:
  ```typescript
  const { connect, disconnect } = useSocket()
  const authStore = useAuthStore()
  
  onMounted(() => {
    if (authStore.isLoggedIn) {
      connect()
      // Bildirim sayısını çek
      useNotifications().fetchUnreadCount()
    }
  })
  
  onUnmounted(() => disconnect())
  ```

---

## 6. i18n — `locales/tr.json`'a ekle

```json
{
  "chat": {
    "title": "Mesajlar",
    "noMessages": "Henüz mesajınız yok",
    "noMessagesDesc": "Takas teklifleriniz veya siparişleriniz üzerinden mesajlaşmaya başlayabilirsiniz",
    "typeMessage": "Mesaj yazın...",
    "send": "Gönder",
    "typing": "yazıyor...",
    "multipleTyping": "Birkaç kişi yazıyor...",
    "online": "Çevrimiçi",
    "offline": "Çevrimdışı",
    "retry": "Tekrar gönder",
    "messageSent": "Gönderildi",
    "messageRead": "Okundu",
    "messagePending": "Gönderiliyor...",
    "messageFailed": "Gönderilemedi",
    "relatedOffer": "İlgili Teklif",
    "relatedOrder": "İlgili Sipariş"
  },
  "notifications": {
    "title": "Bildirimler",
    "markAllRead": "Tümünü Okundu İşaretle",
    "all": "Tümü",
    "unread": "Okunmamış",
    "noNotifications": "Bildirim yok",
    "noNotificationsDesc": "Yeni bildirimleriniz burada görünecek",
    "viewAll": "Tümünü Gör",
    "types": {
      "ORDER_STATUS": "Sipariş Güncellemesi",
      "BARTER_OFFER": "Takas Teklifi",
      "AUCTION_BID": "Artırma Teklifi",
      "CAMPAIGN": "Kampanya",
      "SYSTEM": "Sistem Bildirimi",
      "CHAT_MESSAGE": "Yeni Mesaj"
    }
  }
}
```

---

## 7. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/messages` → Sohbet odaları listesi, okunmamış badge
4. `/messages/:roomId` → Mesaj akışı: gönderme, alma, typing göstergesi
5. Mesaj gönderme: optimistic UI (hemen göster, sonra onay/hata)
6. Hatalı mesaj: "Tekrar gönder" butonu çalışır
7. Mesaj balonları: ben sağda (brand renk), karşı taraf solda
8. SYSTEM mesajları: ortalanmış, gri
9. Typing: yazarken "yazıyor..." göster, 2sn sonra kaybol
10. Header'da bildirim bell ikonu + okunmamış sayı badge
11. Bildirim dropdown: son 5 bildirim
12. `/account/notifications` → Tam bildirim listesi + filtre + okundu işaretle
13. Bildirim tıklama → ilgili sayfaya yönlendirme
14. Socket bağlantısı: sadece client-side, auth token ile
15. Socket disconnect: sayfa kapatılınca veya logout
16. Mobile responsive: mesajlaşma tam ekran, input altta sabit

---

## 8. DOSYA YAPISI

```
types/chat.ts

stores/chat.ts

composables/
├── useSocket.ts                       # Global socket bağlantısı
├── useChat.ts                         # Sayfa seviyesi chat (tradeOfferId bazlı)
└── useNotifications.ts                # Bildirim listesi + okunmamış sayı

components/
├── chat/
│   ├── ChatRoomList.vue
│   ├── ChatRoomCard.vue
│   ├── ChatRoom.vue
│   ├── ChatMessage.vue
│   ├── ChatInput.vue
│   ├── ChatTypingIndicator.vue
│   └── ChatOnlineIndicator.vue
└── notification/
    ├── NotificationBell.vue
    ├── NotificationDropdown.vue
    └── NotificationItem.vue

pages/
├── messages/
│   ├── index.vue                      # Sohbet listesi
│   └── [roomId].vue                   # Sohbet odası
└── account/
    └── notifications.vue              # GÜNCELLENDİ — tam implementasyon

# GÜNCELLENMESİ GEREKEN:
components/app/AppHeader.vue           # NotificationBell eklendi
layouts/default.vue                    # Socket connect/disconnect eklendi

locales/tr.json                        # chat.* + notifications.* key'leri
```

> **Not:** Her dosyayı tam implementasyonla yaz. Socket.IO bağlantısı sadece client-side olmalı (SSR'da io() çağırma). Chat mesaj balonları WhatsApp/Telegram stilinde olmalı — ben sağda, karşı taraf solda, SYSTEM ortada. Optimistic UI: mesaj hemen gösterilir, sunucudan onay gelince status güncellenir. lodash-es yerine @vueuse/core debounce kullan.
