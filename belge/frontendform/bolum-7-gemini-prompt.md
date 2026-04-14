# BarterBorsa Frontend — Bölüm 7: Auction + Lottery Sayfaları

## SİSTEM TALİMATLARI

Bölüm 1-6 tamamlandı. Bu bölümde **açık artırma ve çekiliş** özellikleri yazılacak.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK**
- `<script setup lang="ts">` zorunlu
- SSR-safe: browser API → `onMounted` veya `import.meta.client` guard
- Bölüm 1-6'daki composable/component'leri kullan (`useApi`, `useToast`, `useFormat`, `useAppImage`, `useAppSeo`, UI bileşenleri)
- `brand-*` ve `surface-*` Tailwind renk paleti

### BACKEND API ENDPOINTLERİ

```
# Açık Artırma
GET  /auctions                        → { success, data: Auction[], meta }  query: page, limit, status, search, categoryId, sortBy
GET  /auctions/:id                    → { success, data: Auction }          Detay (bid geçmişi dahil)
POST /auctions/:id/bid                → { success, data: Bid }             body: { amount }
GET  /auctions/my                     → { success, data: AuctionParticipation[] }  Katıldığım artırmalar
POST /auctions/:id/participate        → { success }                        Depozito ile katılım başvurusu

# Çekiliş
GET  /lotteries                       → { success, data: Lottery[], meta }  query: page, status, search
GET  /lotteries/:id                   → { success, data: Lottery }          Detay (bilet bilgileri dahil)
POST /lotteries/:id/tickets           → { success, data: Ticket[] }         body: { count }  Bilet satın al
GET  /lotteries/:id/my-tickets        → { success, data: Ticket[] }         Benim biletlerim
```

---

## 1. TİP TANIMLARI — `types/auction.ts`

```typescript
import type { BaseEntity } from '~/types/common'

/** Açık artırma */
export interface Auction extends BaseEntity {
  title: string
  description: string | null
  status: AuctionStatus
  startingPrice: number
  currentPrice: number
  minBidIncrement: number
  participationDeposit: number
  startTime: string
  endTime: string
  product?: {
    id: string; name: string; slug: string; image: string | null
    description: string | null; category?: { name: string } | null
  }
  _count?: { bids: number }
  bids?: AuctionBid[]
  winners?: AuctionWinner[]
}

export type AuctionStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'COMPLETED' | 'CANCELLED'

/** Teklif */
export interface AuctionBid extends BaseEntity {
  amount: number
  userId: string
  user?: { profile?: { firstName: string | null; lastName: string | null; avatar: string | null } }
}

/** Kazanan */
export interface AuctionWinner {
  rank: number  // 1, 2, 3
  userId: string
  amount: number
  user?: { profile?: { firstName: string | null; lastName: string | null } }
}

/** Katılım durumu */
export interface AuctionParticipation extends BaseEntity {
  auctionId: string
  auction?: Auction
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  depositAmount: number
}

/** Çekiliş */
export interface Lottery extends BaseEntity {
  title: string
  description: string | null
  prizeDescription: string | null
  status: LotteryStatus
  ticketPrice: number
  totalTickets: number
  ticketDigits: number
  numbersPerTicket: number
  startTime: string
  endTime: string
  product?: {
    id: string; name: string; image: string | null; description: string | null
  }
  _count?: { tickets: number }
  winningNumbers?: number[]
  winners?: LotteryWinner[]
}

export type LotteryStatus = 'SCHEDULED' | 'ACTIVE' | 'DRAWING' | 'FINISHED' | 'CANCELLED'

/** Bilet */
export interface LotteryTicket extends BaseEntity {
  numbers: number[]
  lotteryId: string
  userId: string
  isWinner: boolean
}

/** Çekiliş kazananı */
export interface LotteryWinner {
  rank: number
  userId: string
  ticketId: string
  prize: string
  user?: { profile?: { firstName: string | null; lastName: string | null } }
}

/** Geri sayım değerleri */
export interface CountdownValues {
  days: number
  hours: number
  minutes: number
  seconds: number
}
```

---

## 2. COMPOSABLE'LAR

### 2.1 `composables/useAuctions.ts`

```typescript
import type { Auction, AuctionStatus, AuctionParticipation } from '~/types/auction'
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '~/types/api'

export function useAuctions() {
  const { $api } = useApi()
  const toast = useToast()

  const auctions = ref<Auction[]>([])
  const loading = ref(false)
  const meta = ref<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 0 })

  async function fetchAuctions(params?: {
    page?: number; status?: AuctionStatus | string; search?: string
    categoryId?: string; sortBy?: string
  }) {
    loading.value = true
    try {
      const response = await $api<PaginatedResponse<Auction>>('auctions', {
        query: { page: params?.page || 1, limit: 12, ...params },
      })
      if (response.success) {
        auctions.value = response.data || []
        if (response.meta) meta.value = response.meta
      }
    } catch { console.error('fetchAuctions error') }
    finally { loading.value = false }
  }

  async function fetchAuction(id: string): Promise<Auction | null> {
    const response = await $api<ApiResponse<Auction>>(`auctions/${id}`)
    return response.success ? response.data : null
  }

  async function placeBid(auctionId: string, amount: number): Promise<boolean> {
    try {
      const response = await $api<ApiResponse<unknown>>(`auctions/${auctionId}/bid`, {
        method: 'POST', body: { amount },
      })
      if (response.success) { toast.success('Teklif verildi!'); return true }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      toast.error(e.data?.message || 'Teklif verilemedi')
    }
    return false
  }

  async function participate(auctionId: string): Promise<boolean> {
    try {
      const response = await $api<ApiResponse<void>>(`auctions/${auctionId}/participate`, { method: 'POST' })
      if (response.success) { toast.success('Katılım başvurusu yapıldı'); return true }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      toast.error(e.data?.message || 'Katılım başarısız')
    }
    return false
  }

  // Katıldığım artırmalar
  const myParticipations = ref<AuctionParticipation[]>([])

  async function fetchMyAuctions() {
    try {
      const response = await $api<ApiResponse<AuctionParticipation[]>>('auctions/my')
      if (response.success) myParticipations.value = response.data || []
    } catch { /* silent */ }
  }

  return {
    auctions, loading, meta, myParticipations,
    fetchAuctions, fetchAuction, placeBid, participate, fetchMyAuctions,
  }
}
```

### 2.2 `composables/useLotteries.ts`

```typescript
import type { Lottery, LotteryTicket } from '~/types/auction'
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '~/types/api'

export function useLotteries() {
  const { $api } = useApi()
  const toast = useToast()

  const lotteries = ref<Lottery[]>([])
  const loading = ref(false)
  const meta = ref<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 0 })

  async function fetchLotteries(params?: { page?: number; status?: string; search?: string }) {
    loading.value = true
    try {
      const response = await $api<PaginatedResponse<Lottery>>('lotteries', {
        query: { page: params?.page || 1, limit: 12, ...params },
      })
      if (response.success) {
        lotteries.value = response.data || []
        if (response.meta) meta.value = response.meta
      }
    } catch { console.error('fetchLotteries error') }
    finally { loading.value = false }
  }

  async function fetchLottery(id: string): Promise<Lottery | null> {
    const response = await $api<ApiResponse<Lottery>>(`lotteries/${id}`)
    return response.success ? response.data : null
  }

  async function buyTickets(lotteryId: string, count: number): Promise<LotteryTicket[]> {
    try {
      const response = await $api<ApiResponse<LotteryTicket[]>>(`lotteries/${lotteryId}/tickets`, {
        method: 'POST', body: { count },
      })
      if (response.success && response.data) {
        toast.success(`${count} bilet satın alındı!`)
        return response.data
      }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      toast.error(e.data?.message || 'Bilet satın alınamadı')
    }
    return []
  }

  async function fetchMyTickets(lotteryId: string): Promise<LotteryTicket[]> {
    try {
      const response = await $api<ApiResponse<LotteryTicket[]>>(`lotteries/${lotteryId}/my-tickets`)
      return response.success ? response.data || [] : []
    } catch { return [] }
  }

  return {
    lotteries, loading, meta,
    fetchLotteries, fetchLottery, buyTickets, fetchMyTickets,
  }
}
```

### 2.3 `composables/useCountdown.ts`

```typescript
import type { CountdownValues } from '~/types/auction'

/** Geri sayım composable — her saniye güncellenir */
export function useCountdown(endTime: Ref<string | null> | string) {
  const countdown = ref<CountdownValues>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const isExpired = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function calculate() {
    const end = typeof endTime === 'string' ? endTime : endTime.value
    if (!end) { isExpired.value = true; return }

    const now = Date.now()
    const diff = new Date(end).getTime() - now

    if (diff <= 0) {
      isExpired.value = true
      countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
      if (intervalId) clearInterval(intervalId)
      return
    }

    isExpired.value = false
    countdown.value = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
  }

  onMounted(() => {
    calculate()
    intervalId = setInterval(calculate, 1000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return { countdown, isExpired }
}
```

---

## 3. SAYFALAR

### 3.1 `pages/auctions/index.vue` — Açık Artırma Listesi

```
Layout: default

Yapı:
- Başlık: "Açık Artırmalar" + açıklama
- "Katıldıklarım" linki → /auctions/my
- Filtreler: arama input + durum select (Tümü/Aktif/Biten/İptal) + sıralama select
- Auction grid (3 kolon):
  - Her kart: AuctionCard component
    - Ürün görseli
    - Durum badge (ACTIVE → "CANLI" yeşil, ENDED → "BİTTİ" mavi, vb.)
    - Geri sayım (kalan süre, kartın alt kısmında)
    - Başlık
    - Başlangıç fiyatı + güncel teklif
    - Teklif sayısı
    - "Teklif Ver" / "Detay" butonu
- Pagination
- Boş state

Composable: useAuctions()
```

### 3.2 `pages/auctions/[id].vue` — Açık Artırma Detay

```
Yapı — mevcut tasarımdan esinlen (dark hero + card layout):

Hero bölüm (koyu arka plan):
  - Ürün görseli (blur arka plan)
  - Durum badge
  - Başlık (büyük, bold)
  - Geri sayım (4 kutu: gün/saat/dakika/saniye) — useCountdown composable
  - Bitmişse: "Açık Artırma Sonuçlandı!" banner

İçerik (2 kolon):
  Sol (lg:col-span-8):
  - Ürün detay kartı: görsel + açıklama + başlangıç fiyatı + min artış + depozito bilgisi
  - Güvenlik/özellik kartları (güvenli teklif, gerçek zamanlı, cüzdan ile ödeme)

  Sağ (lg:col-span-4):
  - Güncel durum kartı:
    - Şu anki teklif (büyük, vurgulu)
    - Toplam teklif sayısı
    - En yüksek teklif veren (anonim veya kısaltılmış isim)
    - "En yüksek teklifçi sizsiniz!" bilgisi (isHighestBidder ise)
  - Teklif formu (ACTIVE durumunda):
    - Teklif tutarı input (minimum: currentPrice + minBidIncrement)
    - "Teklif Ver" butonu
    - Depozito uyarısı (henüz katılım yapılmadıysa: "Katıl" butonu)
  - Teklif geçmişi:
    - Son 10 teklif listesi (tutar, kullanıcı, tarih)
  - Kazananlar (ENDED/COMPLETED durumunda):
    - 1. 2. 3. sıra — isim + tutar

Composable: useAuctions().fetchAuction(id) + useCountdown(auction.endTime)

Teklif verme akışı:
  1. Kullanıcı giriş yapmış olmalı
  2. Depozito varsa ve katılım yapılmamışsa → "Katıl" butonu göster → participate()
  3. Teklif tutarı ≥ currentPrice + minBidIncrement
  4. "Teklif Ver" → placeBid(id, amount) → teklif geçmişi güncelle
  5. Polling: 5 saniyede bir auction refetch (canlı güncelleme)
```

### 3.3 `pages/auctions/my.vue` — Katıldığım Artırmalar

```
Yapı:
- Başlık + geri butonu
- Katılım kartları listesi:
  - Artırma başlığı + ürün görseli
  - Katılım durumu badge (PENDING/APPROVED/REJECTED)
  - Depozito tutarı
  - Güncel fiyat
  - "Detay" linki → /auctions/:id
- Boş state: "Henüz bir artırmaya katılmadınız"

Composable: useAuctions().fetchMyAuctions()
```

### 3.4 `pages/lotteries/index.vue` — Çekiliş Listesi

```
Layout: default

Yapı:
- Başlık: "Şanslı Çekilişler" + açıklama
- Filtreler: durum butonları (Tümü / Aktif / Biten) + arama input
- Çekiliş grid (3 kolon):
  - Her kart: LotteryCard component
    - Ürün görseli + gradient overlay
    - Bilet tipi badge (X haneli, Y numaralı)
    - Bilet fiyatı
    - Başlık + ödül açıklaması
    - Havuz bilgisi (toplam bilet + doluluk yüzdesi)
    - "İncele ve Katıl" butonu
- Boş state

Composable: useLotteries()
```

### 3.5 `pages/lotteries/[id].vue` — Çekiliş Detay

```
Yapı — mevcut tasarımdan esinlen (dark hero):

Hero bölüm:
  - Ürün görseli (blur arka plan)
  - Durum badge
  - Başlık
  - Geri sayım (aktifse)
  - Bitmişse: "Çekiliş Sonuçlandı!" banner

İçerik (2 kolon):
  Sol (lg:col-span-8):
  - Ödül detay kartı: görsel + açıklama + bilet fiyatı + bilet tipi
  - Bilet satın alma bölümü (ACTIVE durumunda):
    - Adet seçimi: 1 / 3 / 5 adet butonları (seçili olan vurgulu)
    - Toplam fiyat göster
    - "Bilet Al" butonu
  - Benim biletlerim: LotteryTicket kartları (her birinin numaraları)

  Sağ (lg:col-span-4):
  - Çekiliş bilgileri:
    - Bilet fiyatı
    - Toplam bilet / satılan bilet
    - Doluluk yüzdesi (progress bar)
    - Kalan bilet
  - Kazananlar (FINISHED durumunda):
    - 1. 2. 3. sıra — isim + bilet numaraları
    - Kazanan numaralar (winningNumbers)

Bilet satın alma akışı:
  1. Giriş yapmış olmalı
  2. Adet seç (1/3/5)
  3. "Bilet Al" → buyTickets(id, count) → yeni biletler göster
  4. Benim biletlerim bölümü güncellenir

Composable: useLotteries() + useCountdown()
```

---

## 4. COMPONENT'LER

### 4.1 `components/auction/`

```
AuctionCard.vue           — Artırma kartı (listede)
  Props: auction: Auction
  Yapı: görsel, durum badge, geri sayım, başlık, fiyatlar, teklif sayısı, CTA butonu

AuctionBidForm.vue        — Teklif formu
  Props: auction: Auction, minBid: number, loading: boolean
  Emits: bid: (amount: number)
  Yapı: tutar input + "Teklif Ver" butonu + min tutar bilgisi

AuctionBidHistory.vue     — Teklif geçmişi
  Props: bids: AuctionBid[]
  Yapı: liste (tutar, kullanıcı kısaltılmış isim, tarih)

AuctionWinners.vue        — Kazananlar gösterimi
  Props: winners: AuctionWinner[]
  Yapı: 1. 2. 3. sıra kartları (altın/gümüş/bronz renkleri)

AuctionCountdown.vue      — Geri sayım gösterimi
  Props: endTime: string, size: 'sm' | 'lg' (default: 'lg')
  Yapı: 4 kutu (gün/saat/dakika/saniye)
  İç composable: useCountdown()
```

### 4.2 `components/lottery/`

```
LotteryCard.vue           — Çekiliş kartı (listede)
  Props: lottery: Lottery
  Yapı: görsel, badge'ler, bilet fiyatı, başlık, havuz bilgisi, CTA

LotteryTicketSelector.vue — Bilet adet seçici
  Props: ticketPrice: number, maxTickets?: number
  Emits: buy: (count: number)
  Yapı: 1/3/5 adet butonları + toplam fiyat + "Bilet Al" butonu

LotteryMyTickets.vue      — Benim biletlerim
  Props: tickets: LotteryTicket[]
  Yapı: kart grid, her bilet numaralarını gösterir

LotteryResults.vue        — Çekiliş sonuçları
  Props: lottery: Lottery (winningNumbers + winners)
  Yapı: kazanan numaralar + kazananlar listesi (animasyonlu)

LotteryProgressBar.vue    — Doluluk çubuğu
  Props: sold: number, total: number
  Yapı: progress bar + yüzde + "X bilet kaldı" metni
```

### 4.3 `components/ui/UiCountdown.vue`

```
Props: endTime: string, size: 'sm' | 'md' | 'lg' (default: 'md')
Yapı: useCountdown() kullanarak 4 kutu render, boyuta göre stil

Bu component AuctionCountdown'ın generic versiyonu — her yerde kullanılabilir.
```

---

## 5. i18n — `locales/tr.json`'a ekle

```json
{
  "auctions": {
    "title": "Açık Artırmalar",
    "subtitle": "Benzersiz ürünler için teklif verin ve kazanın!",
    "myAuctions": "Katıldıklarım",
    "search": "Açık artırma ara...",
    "allStatuses": "Tüm Durumlar",
    "active": "Aktif",
    "ended": "Biten",
    "cancelled": "İptal",
    "sortEndingSoon": "Bitiş (Yakın)",
    "sortNewest": "En Yeni",
    "sortHighestBid": "En Yüksek Teklif",
    "noAuctions": "Açık artırma bulunamadı",
    "startingPrice": "Başlangıç Fiyatı",
    "currentBid": "Güncel Teklif",
    "bidCount": "{count} teklif",
    "placeBid": "Teklif Ver",
    "viewDetails": "Detayları Gör",
    "minBid": "Minimum teklif: {amount}",
    "bidPlaced": "Teklif verildi!",
    "bidFailed": "Teklif verilemedi",
    "highestBidder": "En yüksek teklifçi sizsiniz!",
    "participate": "Katıl",
    "deposit": "Katılım Depozitosu",
    "depositNote": "Katılım onaylandığında bu tutar cüzdanınızda bloke edilir",
    "participationPending": "Katılım başvurunuz onay bekliyor",
    "bidHistory": "Teklif Geçmişi",
    "winners": "Kazananlar",
    "auctionEnded": "Açık Artırma Sonuçlandı!",
    "noParticipations": "Henüz bir artırmaya katılmadınız",
    "status": {
      "SCHEDULED": "Yaklaşan",
      "ACTIVE": "Canlı",
      "ENDED": "Bitti",
      "COMPLETED": "Tamamlandı",
      "CANCELLED": "İptal"
    },
    "countdown": { "days": "Gün", "hours": "Saat", "minutes": "Dakika", "seconds": "Saniye" }
  },
  "lotteries": {
    "title": "Şanslı Çekilişler",
    "subtitle": "Eşsiz ödüller için şansını dene!",
    "search": "Çekiliş ara...",
    "all": "Tümü",
    "active": "Aktif",
    "finished": "Biten",
    "noLotteries": "Aktif çekiliş bulunmuyor",
    "ticketPrice": "Bilet Fiyatı",
    "ticketType": "Bilet Tipi",
    "totalPool": "Havuz",
    "fillRate": "Doluluk",
    "remaining": "{count} bilet kaldı",
    "buyTickets": "Bilet Al",
    "ticketCount": "{count} Adet",
    "totalCost": "Toplam: {amount}",
    "ticketsBought": "{count} bilet satın alındı!",
    "myTickets": "Biletlerim",
    "noTickets": "Henüz bilet almadınız",
    "prizeDetails": "Ödül Detayları",
    "tryYourLuck": "Şansını Dene",
    "ticketNumbers": "Bilet Numaraları",
    "results": "Çekiliş Sonuçları",
    "winningNumbers": "Kazanan Numaralar",
    "lotteryEnded": "Çekiliş Sonuçlandı!",
    "status": {
      "SCHEDULED": "Yaklaşan",
      "ACTIVE": "Aktif",
      "DRAWING": "Çekilişte",
      "FINISHED": "Sonuçlandı",
      "CANCELLED": "İptal"
    }
  }
}
```

---

## 6. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/auctions` → Artırma listesi: grid, filtreler, pagination, durum badge'leri
4. `/auctions/:id` → Detay: hero, geri sayım (canlı), ürün bilgisi, teklif formu, teklif geçmişi
5. `/auctions/:id` → Teklif verme: min tutar kontrolü, başarılı teklif → güncelleme
6. `/auctions/:id` → Depozito: katılım başvurusu butonu + bilgi
7. `/auctions/:id` → Biten artırma: kazananlar gösterimi
8. `/auctions/my` → Katılımlarım listesi
9. `/lotteries` → Çekiliş listesi: grid, filtreler, doluluk bilgisi
10. `/lotteries/:id` → Detay: hero, geri sayım, ödül bilgisi, bilet satın alma
11. `/lotteries/:id` → Bilet satın alma: adet seçimi → toast → biletlerim güncellenir
12. `/lotteries/:id` → Biten çekiliş: kazanan numaralar + kazananlar
13. Geri sayım: her saniye güncelleniyor (useCountdown)
14. Polling: auction detayda 5sn'de bir refetch
15. Mobile responsive

---

## 7. DOSYA YAPISI

```
types/auction.ts

composables/
├── useAuctions.ts
├── useLotteries.ts
└── useCountdown.ts

components/
├── auction/
│   ├── AuctionCard.vue
│   ├── AuctionBidForm.vue
│   ├── AuctionBidHistory.vue
│   ├── AuctionWinners.vue
│   └── AuctionCountdown.vue
├── lottery/
│   ├── LotteryCard.vue
│   ├── LotteryTicketSelector.vue
│   ├── LotteryMyTickets.vue
│   ├── LotteryResults.vue
│   └── LotteryProgressBar.vue
└── ui/
    └── UiCountdown.vue

pages/
├── auctions/
│   ├── index.vue
│   ├── [id].vue
│   └── my.vue
└── lotteries/
    ├── index.vue
    └── [id].vue

locales/tr.json (GÜNCELLENDİ)
```

> **Not:** Her dosyayı tam implementasyonla yaz. Geri sayım (useCountdown) her saniye güncellenmeli ve onUnmounted'da interval temizlenmeli. Auction detayda 5sn polling ile canlı teklif güncellemesi yapılmalı. Çekiliş bilet satın alma sonrası biletlerim bölümü güncellenip numaralar gösterilmeli. Hero bölümlerde mevcut tasarımdaki dark gradient + blur arka plan stilini koru.
