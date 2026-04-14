# BarterBorsa Frontend — Bölüm 3: Auth Sayfaları + Hesap Yönetimi

## SİSTEM TALİMATLARI

Bölüm 1'de iskelet + auth altyapısı, Bölüm 2'de public sayfalar yazıldı. Bu bölümde kullanıcı kimlik doğrulama sayfaları ve hesap yönetimi yazılacak.

### MUTLAK KURALLAR (Önceki bölümlerden devam)
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK** (sadece `console.error` / `console.warn`)
- `<script setup lang="ts">` zorunlu — Options API yasak
- SSR-safe: browser API → `onMounted` veya `import.meta.client` içinde
- Tüm component prop/emit'leri tam tipli
- Bölüm 1-2'de yazılan `useApi`, `useToast`, `useAuth`, `useFormat`, `useAppImage`, `useAppSeo`, UI bileşenlerini (`UiButton`, `UiInput`, `UiModal`, `UiSpinner`, `UiBadge`, `UiEmptyState`, `UiAvatar`) kullan
- `brand-*` ve `surface-*` Tailwind renk paleti

### MEVCUT BACKEND API ENDPOINTLERİ

```
POST /auth/login                      → { success, data: { accessToken, refreshToken, user } }
POST /auth/register                   → { success, data: { accessToken, refreshToken, user } }
POST /auth/logout                     → { success }
POST /auth/refresh                    → { success, data: { token, csrfToken } }
GET  /auth/google                     → Google OAuth2 redirect (backend yönetir)
POST /auth/forgot-password            → { success, message }           body: { email }
POST /auth/reset-password             → { success, data: { user } }    body: { token, password }

GET  /users/me                        → { success, data: User }
GET  /users/me/profile                → { success, data: UserProfile }
PATCH /users/me/profile               → { success, data: UserProfile }  body: { firstName, lastName, phone, avatar, bio, ... }
POST /users/me/avatar                 → { success, data: { url } }     multipart/form-data
POST /users/me/change-password        → { success }                    body: { currentPassword, newPassword }

GET  /users/me/addresses              → { success, data: Address[] }
POST /users/me/addresses              → { success, data: Address }     body: { title, fullName, phone, addressLine, city, district, isDefault }
PATCH /users/me/addresses/:id         → { success, data: Address }
DELETE /users/me/addresses/:id        → { success }
PATCH /users/me/addresses/:id/default → { success }

GET  /favorites                       → { success, data: Favorite[] }
POST /favorites                       → { success }                    body: { catalogProductId }
DELETE /favorites/:id                 → { success }

GET  /orders                          → { success, data: Order[], meta }  query: page, limit, status
GET  /orders/:id                      → { success, data: Order }

GET  /notifications                   → { success, data: Notification[], meta }
PATCH /notifications/:id/read         → { success }

GET  /xp/status                       → { success, data: { currentXp, tier, level, progress } }
GET  /xp/history                      → { success, data: XpTransaction[], meta }
```

---

## 1. TİP TANIMLARI

### 1.1 `types/account.ts`

```typescript
import type { BaseEntity } from '~/types/common'

/** Adres */
export interface Address extends BaseEntity {
  userId: string
  title: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  district: string
  postalCode: string | null
  isDefault: boolean
}

/** Adres oluşturma/güncelleme */
export interface AddressInput {
  title: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  district: string
  postalCode?: string
  isDefault?: boolean
}

/** Favori */
export interface Favorite extends BaseEntity {
  userId: string
  catalogProductId: string
  product?: {
    id: string
    name: string
    slug: string
    image: string | null
    price: number
    compareAtPrice: number | null
    stock: number
    category?: { name: string; slug: string } | null
    vendor?: { businessName: string; slug: string } | null
  }
}

/** Sipariş (özet — liste görünümü) */
export interface OrderSummary extends BaseEntity {
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  items: OrderItemSummary[]
}

export interface OrderItemSummary {
  id: string
  productName: string
  productImage: string | null
  quantity: number
  price: number
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

/** Sipariş detay */
export interface OrderDetail extends OrderSummary {
  shippingAddress: Address
  paymentMethod: string
  shippingCost: number
  discount: number
  subtotal: number
  statusHistory: { status: OrderStatus; createdAt: string; note: string | null }[]
  trackingNumber: string | null
  trackingUrl: string | null
}

/** Bildirim */
export interface AppNotification extends BaseEntity {
  type: 'ORDER_STATUS' | 'BARTER_OFFER' | 'AUCTION_BID' | 'CAMPAIGN' | 'SYSTEM'
  title: string
  message: string
  isRead: boolean
  link: string | null
  data: Record<string, unknown> | null
}

/** XP / Loyalty */
export interface LoyaltyStatus {
  currentXp: number
  lifetimeXp: number
  level: number
  tier: string
  nextTier: string | null
  nextTierXp: number | null
  progress: number
}

export interface XpTransaction extends BaseEntity {
  amount: number
  type: string
  description: string
  source: string
}

/** Login form */
export interface LoginForm {
  email: string
  password: string
  acceptTerms: boolean
}

/** Register form */
export interface RegisterForm {
  email: string
  name: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  kvkkConsent: boolean
  marketingConsent: boolean
}

/** Profil güncelleme */
export interface ProfileUpdateInput {
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  birthday?: string
  gender?: string
  city?: string
  district?: string
  avatar?: string
}

/** Şifre değiştirme */
export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}
```

---

## 2. AUTH STORE GÜNCELLEME — `stores/auth.ts`

Bölüm 1'de auth store yazıldı (init, fetchUser, tryRefresh, logout). Bu bölümde **login** ve **register** action'larını ekle:

```typescript
// Mevcut store'a eklenecek action'lar:

/** Email/Password ile giriş */
async login(credentials: { email: string; password: string }) {
  this.loading = true
  this.error = null
  try {
    const config = useRuntimeConfig()
    const response = await $fetch<ApiResponse<LoginResponse>>('auth/login', {
      method: 'POST',
      baseURL: config.public.apiBase,
      credentials: 'include',
      body: credentials,
    })

    if (response.success && response.data) {
      this.token = response.data.accessToken
      this.isAuthenticated = true
      this.user = response.data.user

      // Cookie'ye yaz
      const tokenCookie = useCookie('access_token', {
        maxAge: 60 * 15,
        path: '/',
        sameSite: 'lax',
      })
      tokenCookie.value = this.token

      if (response.data.refreshToken) {
        const refreshCookie = useCookie('refresh_token', {
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          sameSite: 'lax',
        })
        refreshCookie.value = response.data.refreshToken
      }

      return response.data
    }
    throw new Error(response.message || 'Giriş başarısız')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string }
    this.error = err.data?.message || err.message || 'Giriş sırasında hata oluştu'
    throw error
  } finally {
    this.loading = false
  }
},

/** Kayıt ol */
async register(data: { email: string; password: string; name?: string }) {
  this.loading = true
  this.error = null
  try {
    const config = useRuntimeConfig()
    const response = await $fetch<ApiResponse<LoginResponse>>('auth/register', {
      method: 'POST',
      baseURL: config.public.apiBase,
      credentials: 'include',
      body: data,
    })

    if (response.success && response.data) {
      this.token = response.data.accessToken
      this.isAuthenticated = true
      this.user = response.data.user

      const tokenCookie = useCookie('access_token', {
        maxAge: 60 * 15,
        path: '/',
        sameSite: 'lax',
      })
      tokenCookie.value = this.token

      return response.data
    }
    throw new Error(response.message || 'Kayıt başarısız')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string }
    this.error = err.data?.message || err.message || 'Kayıt sırasında hata oluştu'
    throw error
  } finally {
    this.loading = false
  }
},

/** Hata temizle */
clearError() {
  this.error = null
},
```

---

## 3. STORE'LAR

### 3.1 `stores/address.ts`

```typescript
import { defineStore } from 'pinia'
import type { Address, AddressInput } from '~/types/account'
import type { ApiResponse } from '~/types/api'

export const useAddressStore = defineStore('address', () => {
  const { $api } = useApi()

  const addresses = ref<Address[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAddresses() {
    loading.value = true
    error.value = null
    try {
      const response = await $api<ApiResponse<Address[]>>('users/me/addresses')
      if (response.success) {
        addresses.value = response.data || []
      }
    } catch (err) {
      console.error('fetchAddresses error:', err)
      error.value = 'Adresler yüklenirken hata oluştu'
    } finally {
      loading.value = false
    }
  }

  async function addAddress(data: AddressInput) {
    loading.value = true
    try {
      const response = await $api<ApiResponse<Address>>('users/me/addresses', {
        method: 'POST',
        body: data,
      })
      if (response.success) {
        await fetchAddresses()
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      return { success: false, error: e.data?.message || 'Adres eklenemedi' }
    } finally {
      loading.value = false
    }
  }

  async function updateAddress(id: string, data: Partial<AddressInput>) {
    loading.value = true
    try {
      const response = await $api<ApiResponse<Address>>(`users/me/addresses/${id}`, {
        method: 'PATCH',
        body: data,
      })
      if (response.success) {
        await fetchAddresses()
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      return { success: false, error: e.data?.message || 'Adres güncellenemedi' }
    } finally {
      loading.value = false
    }
  }

  async function deleteAddress(id: string) {
    loading.value = true
    try {
      const response = await $api<ApiResponse<void>>(`users/me/addresses/${id}`, {
        method: 'DELETE',
      })
      if (response.success) {
        await fetchAddresses()
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      return { success: false, error: e.data?.message || 'Adres silinemedi' }
    } finally {
      loading.value = false
    }
  }

  async function setDefault(id: string) {
    loading.value = true
    try {
      const response = await $api<ApiResponse<void>>(`users/me/addresses/${id}/default`, {
        method: 'PATCH',
      })
      if (response.success) {
        await fetchAddresses()
        return { success: true }
      }
      return { success: false }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  /** Varsayılan adres */
  const defaultAddress = computed(() => addresses.value.find((a) => a.isDefault) || addresses.value[0] || null)

  return {
    addresses,
    loading,
    error,
    defaultAddress,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
  }
})
```

### 3.2 `stores/wishlist.ts`

```typescript
import { defineStore } from 'pinia'
import type { Favorite } from '~/types/account'
import type { ApiResponse } from '~/types/api'

export const useWishlistStore = defineStore('wishlist', () => {
  const { $api } = useApi()

  const items = ref<Favorite[]>([])
  const loading = ref(false)

  const itemCount = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  function isFavorite(productId: string): boolean {
    return items.value.some(
      (item) => item.catalogProductId === productId || item.product?.id === productId,
    )
  }

  async function fetchWishlist() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      items.value = []
      return
    }

    loading.value = true
    try {
      const response = await $api<ApiResponse<Favorite[]>>('favorites')
      if (response.success) {
        items.value = response.data || []
      }
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function toggleFavorite(productId: string) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      return { success: false, needsLogin: true }
    }

    try {
      if (isFavorite(productId)) {
        // Favori kaydını bul ve sil
        const item = items.value.find(
          (i) => i.catalogProductId === productId || i.product?.id === productId,
        )
        if (item) {
          await $api<ApiResponse<void>>(`favorites/${item.id}`, { method: 'DELETE' })
        }
      } else {
        await $api<ApiResponse<void>>('favorites', {
          method: 'POST',
          body: { catalogProductId: productId },
        })
      }
      await fetchWishlist()
      return { success: true, removed: isFavorite(productId) }
    } catch {
      return { success: false }
    }
  }

  async function clearWishlist() {
    // Tüm favorileri tek tek sil
    for (const item of items.value) {
      await $api<ApiResponse<void>>(`favorites/${item.id}`, { method: 'DELETE' }).catch(() => {})
    }
    items.value = []
  }

  return {
    items,
    loading,
    itemCount,
    isEmpty,
    isFavorite,
    fetchWishlist,
    toggleFavorite,
    clearWishlist,
  }
})
```

---

## 4. COMPOSABLE'LAR

### 4.1 `composables/useProfile.ts`

Mevcut useProfile çok büyük (~350 satır) ve her şeyi yapıyor. Sadeleştir — bu bölümde sadece profil + adres + güvenlik tablarını yaz. Loyalty, wallet, activity sonraki bölümlerde:

```typescript
import type { ProfileUpdateInput, ChangePasswordInput } from '~/types/account'
import type { ApiResponse } from '~/types/api'
import type { User } from '~/types/auth'

export function useProfile() {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const toast = useToast()

  // Profil güncelleme
  const profileLoading = ref(false)

  async function updateProfile(data: ProfileUpdateInput) {
    profileLoading.value = true
    try {
      const response = await $api<ApiResponse<User>>('users/me/profile', {
        method: 'PATCH',
        body: data,
      })
      if (response.success) {
        // Auth store'daki user'ı güncelle
        await authStore.fetchUser()
        toast.success('Profil güncellendi')
      }
    } catch {
      toast.error('Profil güncellenirken hata oluştu')
    } finally {
      profileLoading.value = false
    }
  }

  // Avatar yükleme
  const avatarUploading = ref(false)

  async function uploadAvatar(file: File) {
    avatarUploading.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)

      // $fetch ile multipart gönder (useApi JSON varsayar)
      const config = useRuntimeConfig()
      const response = await $fetch<ApiResponse<{ url: string }>>('users/me/avatar', {
        method: 'POST',
        baseURL: config.public.apiBase,
        credentials: 'include',
        body: formData,
      })

      if (response.success && response.data?.url) {
        await updateProfile({ avatar: response.data.url })
        toast.success('Profil fotoğrafı güncellendi')
        return response.data.url
      }
    } catch {
      toast.error('Fotoğraf yüklenirken hata oluştu')
    } finally {
      avatarUploading.value = false
    }
    return null
  }

  // Şifre değiştirme
  const passwordLoading = ref(false)

  async function changePassword(data: ChangePasswordInput) {
    passwordLoading.value = true
    try {
      const response = await $api<ApiResponse<void>>('users/me/change-password', {
        method: 'POST',
        body: data,
      })
      if (response.success) {
        toast.success('Şifre başarıyla değiştirildi')
        return true
      }
    } catch {
      toast.error('Şifre değiştirirken hata oluştu')
    } finally {
      passwordLoading.value = false
    }
    return false
  }

  return {
    profileLoading,
    updateProfile,
    avatarUploading,
    uploadAvatar,
    passwordLoading,
    changePassword,
  }
}
```

### 4.2 `composables/useOrders.ts`

```typescript
import type { OrderSummary, OrderDetail, OrderStatus } from '~/types/account'
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '~/types/api'

export function useOrders() {
  const { $api } = useApi()

  const orders = ref<OrderSummary[]>([])
  const loading = ref(false)
  const meta = ref<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 })

  async function fetchOrders(params?: { page?: number; status?: OrderStatus }) {
    loading.value = true
    try {
      const response = await $api<PaginatedResponse<OrderSummary>>('orders', {
        query: { page: params?.page || 1, limit: 10, status: params?.status },
      })
      if (response.success) {
        orders.value = response.data || []
        if (response.meta) meta.value = response.meta
      }
    } catch {
      console.error('fetchOrders error')
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id: string) {
    const response = await $api<ApiResponse<OrderDetail>>(`orders/${id}`)
    return response.success ? response.data : null
  }

  return { orders, loading, meta, fetchOrders, fetchOrder }
}
```

---

## 5. SAYFALAR

### 5.1 `pages/auth/login.vue`

Mevcut login.vue'dan esinlen ama temizle:

```
Layout: auth
Middleware: guest (zaten login ise / 'e redirect)

Yapı:
- Logo (BarterBorsa ikonu)
- Başlık: "Hoş Geldiniz"
- Form:
  - Email input (UiInput)
  - Password input (UiInput, type=password, göster/gizle toggle)
  - "Şifremi Unuttum" linki → /auth/forgot-password
  - Kullanım koşulları checkbox
  - Hata mesajı (auth store error'dan)
  - "Giriş Yap" butonu (UiButton, loading state)
- Ayırıcı: "veya"
- Google ile Giriş butonu → useAuth().loginWithGoogle()
- "Hesabınız yok mu? Kayıt olun" linki → /auth/register

Submit:
  1. acceptTerms kontrolü
  2. authStore.login({ email, password })
  3. Başarılı → toast + navigateTo('/')
  4. Hata → authStore.error gösterilir

Google login:
  handleGoogleLogin() → window.location.href = `${apiBase}/auth/google`
  (BFF proxy üzerinden değil, doğrudan backend'e redirect — backend callback sonrası token ile /auth/callback'e döner)
```

### 5.2 `pages/auth/register.vue`

```
Layout: auth
Middleware: guest

Yapı:
- Logo + Başlık: "Hesap Oluştur"
- Form:
  - Email (required)
  - Ad Soyad (opsiyonel)
  - Şifre (required, min 8 karakter, büyük/küçük harf + rakam + özel karakter)
  - Şifre tekrar (eşleşme kontrolü)
  - Kullanım koşulları checkbox (required)
  - KVKK onay checkbox (required)
  - Pazarlama izni checkbox (opsiyonel)
  - Hata mesajları
  - "Kayıt Ol" butonu
- Google ile Kayıt butonu (aynı endpoint)
- "Zaten hesabınız var mı? Giriş yapın" linki

Validasyon (client-side):
  - Email format: /\S+@\S+\.\S+/
  - Şifre gücü: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/
  - Şifre eşleşme
  - Checkbox'lar

Submit: authStore.register() → başarılı → navigateTo('/')
```

### 5.3 `pages/auth/forgot-password.vue`

```
Layout: auth
Middleware: guest

Yapı:
- Başlık: "Şifremi Unuttum"
- Açıklama metni
- Email input
- "Sıfırlama Linki Gönder" butonu
- Başarılı → mesaj göster ("Email adresinize sıfırlama linki gönderildi")
- "Giriş sayfasına dön" linki

API: POST /auth/forgot-password { email }
```

### 5.4 `pages/auth/reset-password.vue`

```
Layout: auth

Yapı:
- route.query.token'dan reset token al
- Yeni şifre + tekrar input
- "Şifreyi Sıfırla" butonu
- Başarılı → toast + navigateTo('/auth/login')

API: POST /auth/reset-password { token, password }
```

### 5.5 `pages/auth/callback.vue`

Bölüm 1'de placeholder yazıldı — **değiştirme**, çalışıyor.

### 5.6 `pages/account/index.vue` — Hesap Dashboard

```
Layout: default
Middleware: (auth.global zaten koruyor)

Yapı:
- Sol sidebar: AccountSidebar component (hesap menüsü)
- Sağ: Hesap özeti
  - Kullanıcı kartı (avatar + ad + email + üyelik tarihi)
  - Hızlı aksiyonlar: Son siparişler, favori sayısı, adres sayısı
  - İstatistikler (basit)

NOT: Mevcut frontend'de profil tek sayfa + tab yapısı. Yeni yapıda her sekme ayrı sayfa:
  /account → dashboard
  /account/profile → profil düzenleme
  /account/addresses → adres yönetimi
  /account/orders → sipariş listesi (ileride /orders olarak da erişilebilir)
  /account/favorites → favoriler
  /account/security → şifre değiştirme
  /account/notifications → bildirim ayarları
```

### 5.7 `pages/account/profile.vue` — Profil Düzenleme

```
Yapı:
- Avatar: mevcut görsel + "Değiştir" butonu → dosya seçici → uploadAvatar()
- Form:
  - Ad (UiInput)
  - Soyad (UiInput)
  - Telefon (UiInput, type=tel)
  - Doğum tarihi (UiInput, type=date)
  - Cinsiyet (select: Belirtmek istemiyorum / Erkek / Kadın / Diğer)
  - Biyografi (textarea)
  - İl (select — Türkiye illeri)
  - İlçe (select — seçili ile göre)
- "Kaydet" butonu → useProfile().updateProfile()

İl/İlçe: Backend'den veya statik veri. Şimdilik basit text input olarak yaz, ileride cascading select eklenebilir.
```

### 5.8 `pages/account/addresses.vue` — Adres Yönetimi

```
Yapı:
- "Yeni Adres Ekle" butonu → modal aç
- Adres kartları listesi (AddressCard component):
  - Başlık + tam adres
  - "Varsayılan" badge (isDefault ise)
  - "Düzenle" / "Sil" / "Varsayılan Yap" butonları
- Adres modal (UiModal):
  - Başlık input
  - Ad Soyad
  - Telefon
  - Adres satırı (textarea)
  - İl / İlçe
  - Varsayılan adres checkbox
  - "Kaydet" butonu

Store: useAddressStore() — fetchAddresses, addAddress, updateAddress, deleteAddress, setDefault
Silme: onay dialogu göster
```

### 5.9 `pages/account/favorites.vue` — Favoriler

```
Yapı:
- Başlık + ürün sayısı
- Ürün grid (ProductCard component'lerini kullan — Bölüm 2'de yazıldı)
- Boş state: kalp ikonu + "Henüz favori ürününüz yok" + "Ürünleri Keşfet" butonu
- Her kart: favori kaldır butonu + sepete ekle butonu
- "Tümünü Temizle" butonu (onay ile)

Store: useWishlistStore() — fetchWishlist, toggleFavorite, clearWishlist
```

### 5.10 `pages/account/orders.vue` — Sipariş Geçmişi

```
Yapı:
- Başlık + filtre (status select: Tümü / Bekliyor / Kargoda / Teslim Edildi / İptal)
- Sipariş kartları listesi:
  - Sipariş no (#BB-20260412-XXXXX)
  - Tarih
  - Durum badge (UiBadge, duruma göre renk)
  - Toplam tutar
  - Ürün thumbnail'leri (ilk 3-4)
  - "Detay" butonu → /account/orders/:id
- Pagination
- Boş state

Composable: useOrders() — fetchOrders, meta
```

### 5.11 `pages/account/orders/[id].vue` — Sipariş Detay

```
Yapı:
- Geri butonu
- Sipariş numarası + tarih
- Durum timeline (OrderStatusHistory)
- Ürün listesi (isim, görsel, adet, fiyat)
- Fiyat özeti (ara toplam, kargo, indirim, toplam)
- Teslimat adresi
- Kargo takip (varsa trackingNumber)

Composable: useOrders().fetchOrder(id)
```

### 5.12 `pages/account/security.vue` — Güvenlik

```
Yapı:
- Şifre Değiştirme formu:
  - Mevcut şifre (UiInput, type=password)
  - Yeni şifre
  - Yeni şifre tekrar
  - Eşleşme kontrolü
  - "Şifreyi Değiştir" butonu

- Aktif Oturumlar bölümü (placeholder — backend endpoint sonraki fazda):
  - "Tüm oturumları sonlandır" butonu (placeholder)

Composable: useProfile().changePassword()
```

### 5.13 `pages/account/notifications.vue` — Bildirim Ayarları (placeholder)

```
Yapı:
- Email bildirimleri toggle
- Push bildirimleri toggle
- Bildirim tipleri checkbox'ları (sipariş, barter, kampanya, sistem)
- "Kaydet" butonu (şimdilik toast göster, gerçek API Bölüm 8'de)
```

---

## 6. COMPONENT'LER

### 6.1 `components/account/AccountSidebar.vue`

```
Props: yok (route'tan aktif sayfa belirle)

Yapı: Yan menü — her hesap sayfasına link:
- Hesap Özeti (/account)
- Profil (/account/profile)
- Adreslerim (/account/addresses)
- Siparişlerim (/account/orders)
- Favorilerim (/account/favorites)
- Güvenlik (/account/security)
- Bildirimler (/account/notifications)
- Çıkış Yap

Aktif sayfa vurgulanmış.
Mobile: horizontal scroll tab bar veya dropdown.
```

### 6.2 `components/account/AccountLayout.vue`

```
Slot: default

Yapı:
- Sol: AccountSidebar
- Sağ: <slot />
- Responsive: mobile'da sidebar üstte tab bar olur

Tüm /account/* sayfaları bu layout'u kullanır (definePageMeta ile değil, component olarak sararak).
```

### 6.3 `components/account/AddressCard.vue`

```
Props:
- address: Address
- isDefault: boolean

Emits:
- edit: () => void
- delete: () => void
- setDefault: () => void

Yapı: Kart — başlık, adres metni, telefon, varsayılan badge, aksiyon butonları
```

### 6.4 `components/account/AddressForm.vue`

```
Props:
- modelValue: AddressInput
- loading: boolean

Emits:
- update:modelValue
- submit

Yapı: Form alanları (UiInput kullanarak) — başlık, ad soyad, telefon, adres, il, ilçe, varsayılan checkbox
```

### 6.5 `components/account/OrderCard.vue`

```
Props:
- order: OrderSummary

Yapı: Sipariş özet kartı — numara, tarih, durum badge, tutar, ürün thumbnail'leri, detay linki
```

### 6.6 `components/account/OrderStatusBadge.vue`

```
Props:
- status: OrderStatus

Yapı: UiBadge wrapper — duruma göre renk ve metin:
  PENDING → warning "Bekliyor"
  PAID → info "Ödendi"
  CONFIRMED → info "Onaylandı"
  PROCESSING → info "Hazırlanıyor"
  SHIPPED → info "Kargoda"
  DELIVERED → success "Teslim Edildi"
  COMPLETED → success "Tamamlandı"
  CANCELLED → danger "İptal Edildi"
  REFUNDED → neutral "İade Edildi"
```

### 6.7 `components/account/OrderTimeline.vue`

```
Props:
- history: { status: OrderStatus; createdAt: string; note: string | null }[]

Yapı: Dikey timeline — her adım bir nokta + durum + tarih + not
```

---

## 7. i18n GÜNCELLEME — `locales/tr.json`

Mevcut tr.json'a ekle:

```json
{
  "auth": {
    "welcome": "Hoş Geldiniz",
    "loginTitle": "Hesabınıza giriş yapın",
    "email": "E-posta",
    "password": "Şifre",
    "forgotPassword": "Şifremi Unuttum",
    "login": "Giriş Yap",
    "loggingIn": "Giriş yapılıyor...",
    "loginSuccess": "Giriş başarılı!",
    "or": "veya",
    "continueWithGoogle": "Google ile Devam Et",
    "noAccount": "Hesabınız yok mu?",
    "registerNow": "Kayıt Olun",
    "alreadyHaveAccount": "Zaten hesabınız var mı?",
    "loginNow": "Giriş Yapın",
    "registerTitle": "Hesap Oluştur",
    "registerSubtitle": "BarterBorsa'ya katılın",
    "fullName": "Ad Soyad",
    "confirmPassword": "Şifre Tekrar",
    "passwordHint": "En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir",
    "registerBtn": "Kayıt Ol",
    "creatingAccount": "Hesap oluşturuluyor...",
    "registerSuccess": "Hesabınız başarıyla oluşturuldu!",
    "acceptTermsTemplate": "{terms} ve {privacy} kabul ediyorum",
    "acceptTermsError": "Kullanım koşullarını kabul etmelisiniz",
    "terms": "Kullanım Koşulları",
    "privacy": "Gizlilik Politikası",
    "kvkkConsentTemplate": "{kvkk} metnini okudum ve onaylıyorum",
    "kvkk": "KVKK Aydınlatma Metni",
    "marketingConsent": "Kampanya ve fırsatlardan e-posta ile haberdar olmak istiyorum",
    "forgotPasswordTitle": "Şifremi Unuttum",
    "forgotPasswordDesc": "E-posta adresinizi girin, şifre sıfırlama linki gönderelim",
    "sendResetLink": "Sıfırlama Linki Gönder",
    "resetLinkSent": "Şifre sıfırlama linki e-posta adresinize gönderildi",
    "backToLogin": "Giriş sayfasına dön",
    "resetPasswordTitle": "Şifre Sıfırlama",
    "newPassword": "Yeni Şifre",
    "resetPassword": "Şifreyi Sıfırla",
    "resetSuccess": "Şifreniz başarıyla sıfırlandı",
    "validation": {
      "emailRequired": "E-posta adresi gereklidir",
      "emailInvalid": "Geçerli bir e-posta adresi girin",
      "passwordRequired": "Şifre gereklidir",
      "passwordCriteria": "Şifre en az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir",
      "passwordMismatch": "Şifreler eşleşmiyor"
    }
  },
  "account": {
    "title": "Hesabım",
    "dashboard": "Hesap Özeti",
    "profile": "Profil",
    "addresses": "Adreslerim",
    "orders": "Siparişlerim",
    "favorites": "Favorilerim",
    "security": "Güvenlik",
    "notifications": "Bildirimler",
    "memberSince": "Üyelik tarihi",
    "editProfile": "Profili Düzenle",
    "changeAvatar": "Fotoğrafı Değiştir",
    "saveProfile": "Profili Kaydet",
    "profileUpdated": "Profil güncellendi",
    "firstName": "Ad",
    "lastName": "Soyad",
    "phone": "Telefon",
    "birthday": "Doğum Tarihi",
    "gender": "Cinsiyet",
    "bio": "Hakkımda",
    "city": "İl",
    "district": "İlçe",
    "genderOptions": {
      "unspecified": "Belirtmek istemiyorum",
      "male": "Erkek",
      "female": "Kadın",
      "other": "Diğer"
    }
  },
  "addresses": {
    "title": "Adreslerim",
    "addNew": "Yeni Adres Ekle",
    "edit": "Düzenle",
    "delete": "Sil",
    "setDefault": "Varsayılan Yap",
    "default": "Varsayılan",
    "deleteConfirm": "Bu adresi silmek istediğinize emin misiniz?",
    "addressTitle": "Adres Başlığı",
    "fullName": "Ad Soyad",
    "phone": "Telefon",
    "addressLine": "Adres",
    "city": "İl",
    "district": "İlçe",
    "isDefault": "Varsayılan adres olarak ayarla",
    "saved": "Adres kaydedildi",
    "deleted": "Adres silindi",
    "noAddresses": "Henüz adres eklemediniz",
    "addFirst": "İlk adresinizi ekleyin"
  },
  "orders": {
    "title": "Siparişlerim",
    "orderNo": "Sipariş No",
    "date": "Tarih",
    "status": "Durum",
    "total": "Toplam",
    "detail": "Detay",
    "noOrders": "Henüz siparişiniz yok",
    "startShopping": "Alışverişe Başla",
    "statusLabels": {
      "PENDING": "Bekliyor",
      "PAID": "Ödendi",
      "CONFIRMED": "Onaylandı",
      "PROCESSING": "Hazırlanıyor",
      "SHIPPED": "Kargoda",
      "DELIVERED": "Teslim Edildi",
      "COMPLETED": "Tamamlandı",
      "CANCELLED": "İptal Edildi",
      "REFUNDED": "İade Edildi"
    },
    "filterAll": "Tümü",
    "tracking": "Kargo Takip",
    "shippingAddress": "Teslimat Adresi",
    "priceBreakdown": "Fiyat Detayı",
    "subtotal": "Ara Toplam",
    "shipping": "Kargo",
    "discount": "İndirim",
    "grandTotal": "Genel Toplam"
  },
  "favorites": {
    "title": "Favorilerim",
    "count": "{count} ürün",
    "empty": "Henüz favori ürününüz yok",
    "emptyDesc": "Beğendiğiniz ürünleri favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz",
    "explore": "Ürünleri Keşfet",
    "clearAll": "Tümünü Temizle",
    "clearConfirm": "Tüm favorilerinizi silmek istediğinize emin misiniz?",
    "removed": "Favorilerden kaldırıldı",
    "added": "Favorilere eklendi"
  },
  "security": {
    "title": "Güvenlik",
    "changePassword": "Şifre Değiştir",
    "currentPassword": "Mevcut Şifre",
    "newPassword": "Yeni Şifre",
    "confirmNewPassword": "Yeni Şifre Tekrar",
    "updatePassword": "Şifreyi Güncelle",
    "passwordChanged": "Şifre başarıyla değiştirildi",
    "passwordsNotMatch": "Şifreler eşleşmiyor",
    "activeSessions": "Aktif Oturumlar",
    "endAllSessions": "Tüm Oturumları Sonlandır"
  }
}
```

---

## 8. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/auth/login` → Email/password form + Google butonu çalışıyor
4. `/auth/register` → Kayıt formu + validasyon çalışıyor
5. `/auth/forgot-password` → Email gönderme formu
6. `/auth/callback?token=xxx` → Token işleme (Bölüm 1'den)
7. `/account` → Hesap dashboard + sidebar menü
8. `/account/profile` → Profil düzenleme formu + avatar yükleme
9. `/account/addresses` → Adres listesi + ekleme/düzenleme/silme modal
10. `/account/favorites` → Favori ürün listesi + kaldırma
11. `/account/orders` → Sipariş listesi + durum filtresi + pagination
12. `/account/orders/:id` → Sipariş detay + timeline
13. `/account/security` → Şifre değiştirme formu
14. Auth middleware: korumalı sayfalara erişim → login redirect
15. Guest middleware: login/register'a giriş yapmış kullanıcı → / redirect
16. Mobile responsive: tüm sayfalar 375px'ten itibaren düzgün

---

## 9. DOSYA YAPISI ÖZETİ (Bölüm 3 eklentileri)

```
types/
└── account.ts                         # Address, Favorite, Order, Notification, Loyalty, LoginForm, RegisterForm, ...

stores/
├── auth.ts                            # GÜNCELLENDİ — login + register action'ları eklendi
├── address.ts                         # Adres CRUD store
└── wishlist.ts                        # Favori store

composables/
├── useProfile.ts                      # Profil güncelleme, avatar, şifre
└── useOrders.ts                       # Sipariş listesi + detay

components/
└── account/
    ├── AccountSidebar.vue             # Hesap menüsü
    ├── AccountLayout.vue              # Sidebar + content wrapper
    ├── AddressCard.vue                # Adres kartı
    ├── AddressForm.vue                # Adres formu (modal içinde)
    ├── OrderCard.vue                  # Sipariş özet kartı
    ├── OrderStatusBadge.vue           # Durum badge
    └── OrderTimeline.vue              # Sipariş durum timeline

pages/
├── auth/
│   ├── login.vue                      # GÜNCELLENDİ — tam form
│   ├── register.vue                   # GÜNCELLENDİ — tam form
│   ├── forgot-password.vue            # Yeni
│   ├── reset-password.vue             # Yeni
│   └── callback.vue                   # Bölüm 1'den (değişmedi)
└── account/
    ├── index.vue                      # Hesap dashboard
    ├── profile.vue                    # Profil düzenleme
    ├── addresses.vue                  # Adres yönetimi
    ├── favorites.vue                  # Favoriler
    ├── orders.vue                     # Sipariş listesi
    ├── orders/[id].vue                # Sipariş detay
    ├── security.vue                   # Şifre değiştirme
    └── notifications.vue              # Bildirim ayarları (placeholder)

locales/
└── tr.json                            # GÜNCELLENDİ — auth, account, addresses, orders, favorites, security key'leri
```

> **Not:** Her dosyayı tam implementasyonla yaz. Profil sayfasındaki avatar yükleme, adres modal'ındaki il/ilçe seçimi, sipariş timeline'ı dahil tüm UI öğeleri çalışır durumda olacak. Mevcut frontend'deki tab-based profil yapısı yerine ayrı sayfa yapısı kullan (/account/profile, /account/addresses, vb.).
