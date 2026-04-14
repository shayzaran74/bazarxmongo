# BarterBorsa Frontend — Bölüm 4: Vendor Paneli

## SİSTEM TALİMATLARI

Bölüm 1-3 tamamlandı (iskelet, public sayfalar, auth/hesap). Bu bölümde satıcının ürün, sipariş, stok ve mağaza yönetimini yapacağı **Vendor Paneli** yazılacak. Tüm sayfalar `layouts/vendor.vue` layout'unu ve `vendor` middleware'ini kullanır.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK**
- `<script setup lang="ts">` zorunlu
- SSR-safe: browser API → `onMounted` veya `import.meta.client` guard
- Bölüm 1-3'te yazılan composable ve component'leri kullan (`useApi`, `useToast`, `useFormat`, `useAppImage`, UI bileşenleri)
- `brand-*` ve `surface-*` Tailwind renk paleti

### MEVCUT BACKEND API ENDPOINTLERİ (Vendor)

```
# Dashboard & Stats
GET  /vendors/me                       → { success, data: Vendor }         Vendor bilgileri
GET  /vendors/me/stats                 → { success, data: VendorStats }    Özet istatistikler
GET  /vendors/me/metrics               → { success, data: VendorMetrics }  Detaylı metrikler

# Ürün Yönetimi (Listing)
GET  /vendors/me/listings              → { success, data: Listing[], meta }  query: page, limit, status, search
POST /vendors/me/listings              → { success, data: Listing }          Yeni listing oluştur
GET  /vendors/me/listings/:id          → { success, data: Listing }
PATCH /vendors/me/listings/:id         → { success, data: Listing }
DELETE /vendors/me/listings/:id        → { success }

# Ürün Görselleri
POST /vendors/me/listings/:id/images   → { success, data: { url } }       multipart/form-data
DELETE /vendors/me/listings/:id/images/:imageId → { success }

# Sipariş Yönetimi
GET  /vendors/me/orders                → { success, data: VendorOrder[], meta }  query: page, status
GET  /vendors/me/orders/:id            → { success, data: VendorOrder }
PATCH /vendors/me/orders/:id/status    → { success }    body: { status, trackingNumber?, shippingCarrier? }
GET  /vendors/me/orders/pending-count  → { success, data: { pendingCount } }

# Stok Yönetimi
GET  /vendors/me/warehouses            → { success, data: Warehouse[] }
POST /vendors/me/warehouses            → { success, data: Warehouse }
GET  /vendors/me/stocks                → { success, data: Stock[] }
PATCH /vendors/me/stocks/:id           → { success, data: Stock }        body: { quantity }
GET  /vendors/me/purchase-orders       → { success, data: PurchaseOrder[], meta }
POST /vendors/me/purchase-orders       → { success, data: PurchaseOrder }
GET  /vendors/me/transfers             → { success, data: Transfer[], meta }
POST /vendors/me/transfers             → { success, data: Transfer }

# Mağaza Ayarları
PATCH /vendors/me/profile              → { success, data: VendorProfile }  body: { businessName, description, logo, banner }
GET  /vendors/me/bank-accounts         → { success, data: BankAccount[] }
POST /vendors/me/bank-accounts         → { success, data: BankAccount }
DELETE /vendors/me/bank-accounts/:id   → { success }

# Analitik
GET  /vendors/me/analytics             → { success, data: AnalyticsData }  query: period (7d, 30d, 90d)
GET  /vendors/me/analytics/revenue     → { success, data: RevenueData[] }  query: period, groupBy

# Cüzdan (Financial Service via BFF)
GET  /wallet                           → { success, data: Wallet }
GET  /wallet/transactions              → { success, data: Transaction[], meta }

# Kategoriler (listing oluştururken)
GET  /categories                       → { success, data: Category[] }     query: all, includeChildren
GET  /brands                           → { success, data: Brand[] }
```

---

## 1. TİP TANIMLARI

### 1.1 `types/vendor.ts`

```typescript
import type { BaseEntity } from '~/types/common'
import type { Product, Category, Brand } from '~/types/catalog'

/** Vendor detay bilgileri */
export interface Vendor extends BaseEntity {
  userId: string
  status: VendorStatus
  slug: string
  tier: VendorTier
  isVerified: boolean
  businessName: string
  description: string | null
  logo: string | null
  banner: string | null
  taxNumber: string | null
  mersisNumber: string | null
  kepAddress: string | null
  commissionRate: number
  rating: number | null
  company?: { name: string; taxNumber: string } | null
}

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type VendorTier = 'CORE' | 'PLUS' | 'PREMIUM' | 'ELITE'

/** Vendor dashboard istatistikleri */
export interface VendorStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  averageRating: number
  totalCustomers: number
  commissionRate: number
}

/** Vendor metrikleri (detaylı) */
export interface VendorMetrics {
  dailyRevenue: { date: string; amount: number }[]
  topProducts: { id: string; name: string; sales: number; revenue: number }[]
  ordersByStatus: Record<string, number>
  conversionRate: number
  returnRate: number
}

/** Listing — vendor'ın ürün kaydı */
export interface VendorListing extends BaseEntity {
  catalogProductId: string
  vendorId: string
  price: number
  compareAtPrice: number | null
  stock: number
  sku: string | null
  barcode: string | null
  status: ListingStatus
  isActive: boolean
  isFeatured: boolean
  isFlashSale: boolean
  weight: number | null
  requiresShipping: boolean
  images: ListingImage[]
  catalogProduct?: {
    id: string
    name: string
    slug: string
    description: string | null
    category?: Category | null
    brand?: Brand | null
  }
  // Varyant bilgileri
  hasVariants: boolean
  variants?: ListingVariant[]
}

export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT' | 'PENDING_REVIEW'

export interface ListingImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

export interface ListingVariant {
  id: string
  sku: string | null
  price: number
  stock: number
  attributes: Record<string, string>
  isActive: boolean
}

/** Listing oluşturma/güncelleme input */
export interface ListingInput {
  name: string
  description: string
  categoryId: string
  brandId?: string
  price: number
  compareAtPrice?: number
  stock: number
  sku?: string
  barcode?: string
  weight?: number
  requiresShipping?: boolean
  isActive?: boolean
  isFeatured?: boolean
  isFlashSale?: boolean
  images?: string[]
  tags?: string
  specifications?: Record<string, string>
}

/** Vendor sipariş */
export interface VendorOrder extends BaseEntity {
  orderNumber: string
  status: string
  totalAmount: number
  customer: {
    name: string
    email: string
  }
  items: VendorOrderItem[]
  shippingAddress: {
    fullName: string
    addressLine: string
    city: string
    district: string
    phone: string
  }
  trackingNumber: string | null
  shippingCarrier: string | null
}

export interface VendorOrderItem {
  id: string
  productName: string
  productImage: string | null
  quantity: number
  price: number
  status: string
  trackingNumber: string | null
  shippingCarrier: string | null
}

/** Depo */
export interface Warehouse extends BaseEntity {
  name: string
  address: string
  city: string
  district: string
  isDefault: boolean
  isActive: boolean
}

/** Stok */
export interface Stock extends BaseEntity {
  listingId: string
  warehouseId: string
  quantity: number
  committedQuantity: number
  lowStockThreshold: number
  listing?: { catalogProduct?: { name: string } }
  warehouse?: { name: string }
}

/** Satın alma siparişi */
export interface PurchaseOrder extends BaseEntity {
  orderNumber: string
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'
  supplier: string
  totalAmount: number
  items: PurchaseOrderItem[]
  notes: string | null
}

export interface PurchaseOrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  receivedQuantity: number
}

/** Stok transferi */
export interface StockTransfer extends BaseEntity {
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  sourceWarehouse: { name: string }
  targetWarehouse: { name: string }
  items: { productName: string; quantity: number }[]
}

/** Banka hesabı */
export interface BankAccount extends BaseEntity {
  bankName: string
  iban: string
  accountHolder: string
  isDefault: boolean
}

/** Analitik veri */
export interface VendorAnalytics {
  revenue: { date: string; amount: number }[]
  orders: { date: string; count: number }[]
  topProducts: { name: string; revenue: number; quantity: number }[]
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    conversionRate: number
  }
}

/** Kargo firması seçenekleri */
export const CARRIER_OPTIONS = [
  'Yurtiçi Kargo',
  'Aras Kargo',
  'MNG Kargo',
  'PTT Kargo',
  'Sürat Kargo',
  'UPS Kargo',
  'Hepsijet',
] as const

export type CarrierName = typeof CARRIER_OPTIONS[number]
```

---

## 2. MIDDLEWARE

### 2.1 `middleware/vendor.ts`

```typescript
/**
 * Vendor middleware — VENDOR rolü ve APPROVED status kontrolü.
 * Auth kontrolü auth.global.ts'de zaten yapılıyor.
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn) {
    return navigateTo('/auth/login')
  }

  if (authStore.user?.role !== 'VENDOR') {
    return navigateTo('/')
  }
})
```

---

## 3. COMPOSABLE'LAR

### 3.1 `composables/useVendorDashboard.ts`

```typescript
import type { VendorStats, VendorMetrics } from '~/types/vendor'
import type { ApiResponse } from '~/types/api'

export function useVendorDashboard() {
  const { $api } = useApi()

  const stats = ref<VendorStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalCustomers: 0,
    commissionRate: 10,
  })

  const loading = ref(false)

  async function fetchStats() {
    loading.value = true
    try {
      const response = await $api<ApiResponse<VendorStats>>('vendors/me/stats')
      if (response.success && response.data) {
        stats.value = response.data
      }
    } catch {
      console.error('fetchVendorStats error')
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, fetchStats }
}
```

### 3.2 `composables/useVendorListings.ts`

```typescript
import type { VendorListing, ListingInput, ListingStatus } from '~/types/vendor'
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '~/types/api'

export function useVendorListings() {
  const { $api } = useApi()
  const toast = useToast()

  const listings = ref<VendorListing[]>([])
  const loading = ref(false)
  const meta = ref<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })

  async function fetchListings(params?: { page?: number; status?: ListingStatus; search?: string }) {
    loading.value = true
    try {
      const response = await $api<PaginatedResponse<VendorListing>>('vendors/me/listings', {
        query: { page: params?.page || 1, limit: 20, status: params?.status, search: params?.search },
      })
      if (response.success) {
        listings.value = response.data || []
        if (response.meta) meta.value = response.meta
      }
    } catch {
      console.error('fetchListings error')
    } finally {
      loading.value = false
    }
  }

  async function fetchListing(id: string): Promise<VendorListing | null> {
    const response = await $api<ApiResponse<VendorListing>>(`vendors/me/listings/${id}`)
    return response.success ? response.data : null
  }

  async function createListing(data: ListingInput): Promise<VendorListing | null> {
    try {
      const response = await $api<ApiResponse<VendorListing>>('vendors/me/listings', {
        method: 'POST',
        body: data,
      })
      if (response.success) {
        toast.success('Ürün başarıyla eklendi')
        return response.data
      }
    } catch {
      toast.error('Ürün eklenirken hata oluştu')
    }
    return null
  }

  async function updateListing(id: string, data: Partial<ListingInput>): Promise<boolean> {
    try {
      const response = await $api<ApiResponse<VendorListing>>(`vendors/me/listings/${id}`, {
        method: 'PATCH',
        body: data,
      })
      if (response.success) {
        toast.success('Ürün güncellendi')
        return true
      }
    } catch {
      toast.error('Ürün güncellenirken hata oluştu')
    }
    return false
  }

  async function deleteListing(id: string): Promise<boolean> {
    try {
      const response = await $api<ApiResponse<void>>(`vendors/me/listings/${id}`, {
        method: 'DELETE',
      })
      if (response.success) {
        toast.success('Ürün silindi')
        await fetchListings()
        return true
      }
    } catch {
      toast.error('Ürün silinirken hata oluştu')
    }
    return false
  }

  return { listings, loading, meta, fetchListings, fetchListing, createListing, updateListing, deleteListing }
}
```

### 3.3 `composables/useVendorOrders.ts`

```typescript
import type { VendorOrder, CarrierName } from '~/types/vendor'
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '~/types/api'

export function useVendorOrders() {
  const { $api } = useApi()
  const toast = useToast()

  const orders = ref<VendorOrder[]>([])
  const loading = ref(false)
  const meta = ref<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })

  const filterStatus = ref('')
  const searchQuery = ref('')

  async function fetchOrders(params?: { page?: number; status?: string }) {
    loading.value = true
    try {
      const response = await $api<PaginatedResponse<VendorOrder>>('vendors/me/orders', {
        query: { page: params?.page || 1, limit: 20, status: params?.status || filterStatus.value || undefined },
      })
      if (response.success) {
        orders.value = response.data || []
        if (response.meta) meta.value = response.meta
      }
    } catch {
      toast.error('Siparişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(orderId: string, data: {
    status: string
    trackingNumber?: string
    shippingCarrier?: CarrierName
  }): Promise<boolean> {
    try {
      const response = await $api<ApiResponse<void>>(`vendors/me/orders/${orderId}/status`, {
        method: 'PATCH',
        body: data,
      })
      if (response.success) {
        toast.success('Sipariş durumu güncellendi')
        await fetchOrders()
        return true
      }
    } catch {
      toast.error('Durum güncellenirken hata oluştu')
    }
    return false
  }

  /** Filtrelenmiş siparişler */
  const filteredOrders = computed(() => {
    return orders.value.filter((order) => {
      const matchSearch = !searchQuery.value ||
        order.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchStatus = !filterStatus.value ||
        order.status.toUpperCase() === filterStatus.value.toUpperCase()
      return matchSearch && matchStatus
    })
  })

  const pendingCount = computed(() =>
    orders.value.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length,
  )
  const shippedCount = computed(() =>
    orders.value.filter((o) => o.status === 'SHIPPED').length,
  )

  return {
    orders, loading, meta, filterStatus, searchQuery,
    filteredOrders, pendingCount, shippedCount,
    fetchOrders, updateOrderStatus,
  }
}
```

### 3.4 `composables/useVendorInventory.ts`

```typescript
import type { Stock, Warehouse, PurchaseOrder, StockTransfer } from '~/types/vendor'
import type { ApiResponse, PaginatedResponse } from '~/types/api'

export function useVendorInventory() {
  const { $api } = useApi()
  const toast = useToast()

  // Depolar
  const warehouses = ref<Warehouse[]>([])
  const loadingWarehouses = ref(false)

  async function fetchWarehouses() {
    loadingWarehouses.value = true
    try {
      const response = await $api<ApiResponse<Warehouse[]>>('vendors/me/warehouses')
      if (response.success) warehouses.value = response.data || []
    } catch { console.error('fetchWarehouses error') }
    finally { loadingWarehouses.value = false }
  }

  async function createWarehouse(data: { name: string; address: string; city: string; district: string }) {
    const response = await $api<ApiResponse<Warehouse>>('vendors/me/warehouses', { method: 'POST', body: data })
    if (response.success) {
      toast.success('Depo eklendi')
      await fetchWarehouses()
      return true
    }
    return false
  }

  // Stoklar
  const stocks = ref<Stock[]>([])
  const loadingStocks = ref(false)

  async function fetchStocks() {
    loadingStocks.value = true
    try {
      const response = await $api<ApiResponse<Stock[]>>('vendors/me/stocks')
      if (response.success) stocks.value = response.data || []
    } catch { console.error('fetchStocks error') }
    finally { loadingStocks.value = false }
  }

  async function updateStock(id: string, quantity: number) {
    const response = await $api<ApiResponse<Stock>>(`vendors/me/stocks/${id}`, {
      method: 'PATCH', body: { quantity },
    })
    if (response.success) {
      toast.success('Stok güncellendi')
      await fetchStocks()
      return true
    }
    return false
  }

  /** Düşük stoklu ürünler */
  const lowStockItems = computed(() =>
    stocks.value.filter((s) => s.quantity - s.committedQuantity <= s.lowStockThreshold),
  )

  // Satın alma siparişleri
  const purchaseOrders = ref<PurchaseOrder[]>([])

  async function fetchPurchaseOrders() {
    const response = await $api<PaginatedResponse<PurchaseOrder>>('vendors/me/purchase-orders')
    if (response.success) purchaseOrders.value = response.data || []
  }

  // Transferler
  const transfers = ref<StockTransfer[]>([])

  async function fetchTransfers() {
    const response = await $api<PaginatedResponse<StockTransfer>>('vendors/me/transfers')
    if (response.success) transfers.value = response.data || []
  }

  return {
    warehouses, loadingWarehouses, fetchWarehouses, createWarehouse,
    stocks, loadingStocks, fetchStocks, updateStock, lowStockItems,
    purchaseOrders, fetchPurchaseOrders,
    transfers, fetchTransfers,
  }
}
```

### 3.5 `composables/useVendorWallet.ts`

```typescript
import type { ApiResponse } from '~/types/api'

interface WalletSummary {
  balance: number
  blockedBalance: number
  currency: string
}

interface WalletTransaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
  status: string
}

export function useVendorWallet() {
  const { $api } = useApi()

  const wallet = ref<WalletSummary | null>(null)
  const transactions = ref<WalletTransaction[]>([])
  const loading = ref(false)

  async function fetchWallet() {
    loading.value = true
    try {
      const response = await $api<ApiResponse<WalletSummary>>('wallet')
      if (response.success) wallet.value = response.data
    } catch { console.error('fetchWallet error') }
    finally { loading.value = false }
  }

  async function fetchTransactions(params?: { page?: number; limit?: number }) {
    const response = await $api<ApiResponse<WalletTransaction[]>>('wallet/transactions', {
      query: { page: params?.page || 1, limit: params?.limit || 20 },
    })
    if (response.success) transactions.value = response.data || []
  }

  return { wallet, transactions, loading, fetchWallet, fetchTransactions }
}
```

### 3.6 `composables/useVendorAnalytics.ts`

```typescript
import type { VendorAnalytics } from '~/types/vendor'
import type { ApiResponse } from '~/types/api'

export function useVendorAnalytics() {
  const { $api } = useApi()

  const analytics = ref<VendorAnalytics | null>(null)
  const loading = ref(false)
  const selectedPeriod = ref<'7d' | '30d' | '90d'>('30d')

  async function fetchAnalytics() {
    loading.value = true
    try {
      const response = await $api<ApiResponse<VendorAnalytics>>('vendors/me/analytics', {
        query: { period: selectedPeriod.value },
      })
      if (response.success) analytics.value = response.data
    } catch { console.error('fetchAnalytics error') }
    finally { loading.value = false }
  }

  watch(selectedPeriod, () => fetchAnalytics())

  return { analytics, loading, selectedPeriod, fetchAnalytics }
}
```

---

## 4. SAYFALAR

### 4.1 `pages/vendor/index.vue` — Vendor Dashboard

```
Layout: vendor
Middleware: vendor

KPI Kartları (4'lü grid):
- Toplam Kazanç (₺) — brand-600 ikon
- Toplam Ürün — brand-600 ikon
- Bekleyen Siparişler — warning renk, tıklanınca /vendor/orders
- Ortalama Puan — yıldız

XP/Bakiye Kartları (4'lü grid, gradient kartlar):
- Komisyon İndirim Paneli
- Reklam Bakiyesi
- Servis Giderleri
- Barter Havuzu (deposit/withdraw butonları)

Son Aktiviteler listesi (5 adet)
Bekleyen Siparişler listesi (5 adet, tümünü gör linki)

Composable: useVendorDashboard()
```

### 4.2 `pages/vendor/products/index.vue` — Ürün Listesi

```
Yapı:
- Başlık + "Yeni Ürün Ekle" butonu → /vendor/products/new
- Arama input + durum filtresi (ACTIVE, INACTIVE, DRAFT, OUT_OF_STOCK)
- Ürün tablosu:
  - Görsel (thumbnail)
  - Ürün adı + kategori
  - Fiyat (compareAtPrice varsa üstü çizili)
  - Stok
  - Durum badge
  - Aksiyonlar: Düzenle / Sil / Aktif/Pasif toggle

Composable: useVendorListings()
Pagination: meta'dan
```

### 4.3 `pages/vendor/products/new.vue` — Yeni Ürün Ekleme

```
Yapı — çok adımlı form (wizard veya tek uzun sayfa sidebar nav ile):

Bölümler:
1. Temel Bilgiler: İsim, açıklama (textarea/rich text), kategori (cascading 3 seviye), marka (select)
2. Fiyatlama: Fiyat, karşılaştırma fiyatı, SKU, barkod
3. Görseller: Çoklu görsel yükleme (drag & drop + URL ekleme), sıralama, silme. Min 1 görsel.
4. Stok & Lojistik: Stok miktarı, ağırlık, kargo gerekli mi
5. Pazarlama: Aktif, öne çıkan, flaş ürün toggle'ları, etiketler
6. Önizleme + Yayınla

Kategori seçimi: 3 seviyeli cascading select
  - Ana kategori → alt kategori → detay kategori
  - GET /categories?all=true&includeChildren=true ile tüm ağaç çek
  - Seçilen derinliğe göre categoryId ata

Görsel yükleme:
  - multipart/form-data ile POST /vendors/me/listings/:id/images
  - Veya URL ekleme (basit input)
  - Max 10 görsel

Submit: useVendorListings().createListing(data) → başarılı → /vendor/products'a redirect

Composable: useVendorListings() + useCategoryTree()
```

### 4.4 `pages/vendor/products/[id]/edit.vue` — Ürün Düzenleme

```
Aynı form yapısı, ama:
- useVendorListings().fetchListing(id) ile mevcut veri doldurulur
- Submit: updateListing(id, data)
- Silme butonu (onay ile)
```

### 4.5 `pages/vendor/orders/index.vue` — Sipariş Listesi

```
Yapı:
- Stat kartları: Bekleyen, Hazırlanan, Kargoda, Toplam Kazanç
- Arama (sipariş no) + durum filtresi
- Sipariş kartları listesi:
  - Sipariş no + tarih
  - Müşteri adı
  - Ürünler (mini thumbnail + isim + adet)
  - Toplam tutar
  - Durum badge
  - "Detay" butonu → modal veya ayrı sayfa

Composable: useVendorOrders()
```

### 4.6 `pages/vendor/orders/[id].vue` — Sipariş Detay

```
Yapı:
- Sipariş bilgileri (numara, tarih, müşteri)
- Ürün listesi tablosu
- Teslimat adresi
- Durum güncelleme:
  - Status select: CONFIRMED → PROCESSING → SHIPPED
  - SHIPPED seçildiğinde: kargo firması select + takip numarası input
  - "Güncelle" butonu

Composable: useVendorOrders().updateOrderStatus()
Kargo firmaları: CARRIER_OPTIONS constant'ından
```

### 4.7 `pages/vendor/inventory/index.vue` — Stok Yönetimi (Ana Sayfa)

```
Yapı:
- Tab: Stoklar | Depolar | Satın Alma | Transferler
- Stoklar tab: Stok tablosu (ürün, depo, miktar, committed, threshold), inline düzenleme
- Depolar tab: Depo listesi + yeni depo ekleme formu
- Satın Alma tab: PO listesi + yeni PO oluşturma linki
- Transferler tab: Transfer listesi

Composable: useVendorInventory()

Düşük stok uyarısı: lowStockItems computed → kırmızı badge/ikon
```

### 4.8 `pages/vendor/settings.vue` — Mağaza Ayarları

```
Yapı:
- Mağaza Profili:
  - Logo yükleme
  - Banner yükleme
  - İşletme adı
  - Açıklama (textarea)
  - Kaydet butonu → PATCH /vendors/me/profile

- Banka Hesapları:
  - Liste + "Yeni Ekle" butonu
  - Her hesap: banka adı, IBAN (maskeli), hesap sahibi, varsayılan badge
  - Silme (onay ile)
  - Modal: banka adı input + IBAN input + hesap sahibi input

- Vendor durumu: PENDING/APPROVED/REJECTED/SUSPENDED → bilgi kartı
```

### 4.9 `pages/vendor/analytics.vue` — Satış Analizi

```
Yapı:
- Periyot seçici: 7 gün / 30 gün / 90 gün
- Özet kartlar: Toplam Gelir, Toplam Sipariş, Ort. Sipariş Değeri, Dönüşüm Oranı
- Gelir grafiği (günlük bar chart veya line chart)
  - Basit CSS bar chart yeterli (chart kütüphanesi opsiyonel)
  - Her bar: tarih + tutar
- En çok satan ürünler tablosu (isim, adet, gelir)

Composable: useVendorAnalytics()
```

### 4.10 `pages/vendor/wallet.vue` — Cüzdan

```
Yapı:
- Bakiye kartı: Ana bakiye (₺), bloke bakiye
- Son işlemler tablosu: tarih, tip, tutar, açıklama, durum

Composable: useVendorWallet()
```

---

## 5. COMPONENT'LER

### 5.1 `components/vendor/`

```
VendorStatsCard.vue       — KPI kartı (ikon + başlık + değer + trend)
  Props: title: string, value: string | number, icon: Component, color: string

VendorOrderCard.vue       — Sipariş kartı (listede)
  Props: order: VendorOrder
  Emits: click, updateStatus

VendorOrderStatusUpdate.vue — Durum güncelleme formu (modal veya inline)
  Props: order: VendorOrder
  Emits: update: (data: { status, trackingNumber?, shippingCarrier? })

VendorProductTable.vue    — Ürün tablosu
  Props: listings: VendorListing[], loading: boolean
  Emits: edit, delete, toggleActive

VendorProductForm.vue     — Ürün ekleme/düzenleme formu
  Props: initialData?: Partial<ListingInput>, isEditing: boolean, loading: boolean
  Emits: submit: (data: ListingInput)

VendorImageUpload.vue     — Çoklu görsel yükleme
  Props: images: string[], maxImages: number (default: 10)
  Emits: update:images, upload: (file: File)

VendorStockTable.vue      — Stok tablosu (inline düzenleme)
  Props: stocks: Stock[], loading: boolean
  Emits: updateQuantity: (id: string, quantity: number)

VendorRevenueChart.vue    — Gelir grafiği (basit CSS bar chart)
  Props: data: { date: string; amount: number }[]

VendorWalletCard.vue      — Bakiye kartı
  Props: balance: number, blockedBalance: number, currency: string
```

### 5.2 Ek UI Component'leri (gerekirse)

```
UiTable.vue              — Genel tablo component (sort, responsive)
  Props: columns: { key, label, sortable? }[], data: Record<string, unknown>[]
  Slots: cell-{key} (custom cell render)

UiTabs.vue               — Tab navigasyon
  Props: tabs: { id, label, icon? }[], modelValue: string
  Emits: update:modelValue

UiFileUpload.vue          — Drag & drop dosya yükleme
  Props: accept: string, multiple: boolean, maxSize: number
  Emits: upload: (files: File[])

UiSelect.vue              — Custom select
  Props: modelValue, options: { value, label }[], placeholder
  Emits: update:modelValue
```

---

## 6. LAYOUT GÜNCELLEME

`layouts/vendor.vue` Bölüm 1'de temel olarak yazıldı. Bu bölümde sidebar navigasyonu güncelle — yeni sayfalarla eşleşecek şekilde:

```
Navigasyon yapısı:
- Ana Sayfa (/vendor)
- ÜRÜNLER:
  - Ürünler (/vendor/products)
  - Yeni Ürün (/vendor/products/new)
- SİPARİŞLER:
  - Siparişler (/vendor/orders)
- ENVANTER:
  - Stok Yönetimi (/vendor/inventory)
- ANALİZ:
  - Satış Analizi (/vendor/analytics)
- FİNANS:
  - Cüzdan (/vendor/wallet)
- AYARLAR:
  - Mağaza Ayarları (/vendor/settings)
```

---

## 7. i18n GÜNCELLEME — `locales/tr.json`

```json
{
  "vendor": {
    "dashboard": "Dashboard",
    "totalRevenue": "Toplam Kazanç",
    "totalProducts": "Toplam Ürün",
    "pendingOrders": "Bekleyen Siparişler",
    "avgRating": "Ortalama Puan",
    "recentActivity": "Son Aktiviteler",
    "noActivity": "Henüz aktivite yok",
    "products": {
      "title": "Ürün Yönetimi",
      "addNew": "Yeni Ürün Ekle",
      "editProduct": "Ürünü Düzenle",
      "search": "Ürün ara...",
      "name": "Ürün Adı",
      "price": "Fiyat",
      "stock": "Stok",
      "status": "Durum",
      "actions": "İşlemler",
      "noProducts": "Henüz ürün eklenmemiş",
      "deleteConfirm": "Bu ürünü silmek istediğinize emin misiniz?",
      "saved": "Ürün kaydedildi",
      "deleted": "Ürün silindi",
      "form": {
        "basicInfo": "Temel Bilgiler",
        "pricing": "Fiyatlama",
        "images": "Görseller",
        "stockLogistics": "Stok & Lojistik",
        "marketing": "Pazarlama",
        "preview": "Önizleme",
        "productName": "Ürün Adı",
        "description": "Açıklama",
        "category": "Kategori",
        "brand": "Marka",
        "selectCategory": "Kategori Seçin",
        "selectBrand": "Marka Seçin",
        "salePrice": "Satış Fiyatı",
        "comparePrice": "Karşılaştırma Fiyatı",
        "sku": "SKU",
        "barcode": "Barkod",
        "addImage": "Görsel Ekle",
        "dragDrop": "Sürükle bırak veya dosya seç",
        "maxImages": "En fazla 10 görsel",
        "stockQuantity": "Stok Miktarı",
        "weight": "Ağırlık (gr)",
        "requiresShipping": "Kargo Gerekli",
        "isActive": "Aktif",
        "isFeatured": "Öne Çıkan",
        "isFlashSale": "Flaş Ürün",
        "tags": "Etiketler",
        "publish": "Yayınla",
        "saveDraft": "Taslak Kaydet",
        "update": "Güncelle"
      }
    },
    "orders": {
      "title": "Siparişler",
      "search": "Sipariş no ile ara...",
      "allStatuses": "Tüm Durumlar",
      "pending": "Beklemede",
      "processing": "Hazırlanıyor",
      "shipped": "Kargoda",
      "delivered": "Teslim Edildi",
      "shippedOrders": "Kargolanan",
      "totalRevenue": "Toplam Kazanç",
      "orderNo": "Sipariş No",
      "customer": "Müşteri",
      "updateStatus": "Durumu Güncelle",
      "trackingNumber": "Takip Numarası",
      "carrier": "Kargo Firması",
      "selectCarrier": "Kargo seçin",
      "noPendingOrders": "Bekleyen siparişiniz yok",
      "statusUpdated": "Sipariş durumu güncellendi"
    },
    "inventory": {
      "title": "Envanter",
      "stocks": "Stoklar",
      "warehouses": "Depolar",
      "purchaseOrders": "Satın Alma",
      "transfers": "Transferler",
      "totalProducts": "Toplam Ürün",
      "lowStock": "Düşük Stok",
      "outOfStock": "Tükenen",
      "addWarehouse": "Yeni Depo",
      "warehouseName": "Depo Adı",
      "product": "Ürün",
      "warehouse": "Depo",
      "quantity": "Miktar",
      "committed": "Ayrılmış",
      "available": "Kullanılabilir",
      "threshold": "Eşik",
      "updateStock": "Stok Güncelle"
    },
    "analytics": {
      "title": "Satış Analizi",
      "period7d": "7 Gün",
      "period30d": "30 Gün",
      "period90d": "90 Gün",
      "totalRevenue": "Toplam Gelir",
      "totalOrders": "Toplam Sipariş",
      "avgOrderValue": "Ort. Sipariş",
      "conversionRate": "Dönüşüm",
      "topProducts": "En Çok Satan Ürünler",
      "revenueChart": "Gelir Grafiği"
    },
    "wallet": {
      "title": "Cüzdan",
      "balance": "Bakiye",
      "blockedBalance": "Bloke Bakiye",
      "transactions": "İşlem Geçmişi",
      "noTransactions": "Henüz işlem yok"
    },
    "settings": {
      "title": "Mağaza Ayarları",
      "storeProfile": "Mağaza Profili",
      "businessName": "İşletme Adı",
      "description": "Açıklama",
      "logo": "Logo",
      "banner": "Banner",
      "changeLogo": "Logo Değiştir",
      "changeBanner": "Banner Değiştir",
      "bankAccounts": "Banka Hesapları",
      "addBankAccount": "Yeni Hesap Ekle",
      "bankName": "Banka",
      "iban": "IBAN",
      "accountHolder": "Hesap Sahibi",
      "defaultAccount": "Varsayılan",
      "saved": "Ayarlar kaydedildi",
      "deleteBankConfirm": "Bu banka hesabını silmek istediğinize emin misiniz?"
    }
  }
}
```

---

## 8. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/vendor` → Dashboard: KPI kartları, XP bakiyeleri, son aktiviteler, bekleyen siparişler
4. `/vendor/products` → Ürün listesi tablosu: arama, filtre, pagination
5. `/vendor/products/new` → Ürün ekleme formu: kategori cascading, görseller, fiyat
6. `/vendor/products/:id/edit` → Ürün düzenleme: mevcut veri dolu, güncelleme çalışıyor
7. `/vendor/orders` → Sipariş listesi: stat kartları, arama, filtre
8. `/vendor/orders/:id` → Sipariş detay: durum güncelleme + kargo bilgisi
9. `/vendor/inventory` → Stok tablosu: inline düzenleme, düşük stok uyarısı
10. `/vendor/settings` → Mağaza profili düzenleme + banka hesapları CRUD
11. `/vendor/analytics` → Periyot seçimi, özet kartlar, gelir grafiği, top ürünler
12. `/vendor/wallet` → Bakiye + işlem geçmişi
13. Vendor layout sidebar: tüm linkler doğru, aktif sayfa vurgulanmış
14. Vendor middleware: VENDOR olmayan kullanıcı → / redirect
15. Mobile responsive: sidebar collapse veya hamburger menü

---

## 9. DOSYA YAPISI ÖZETİ (Bölüm 4)

```
types/
└── vendor.ts

middleware/
└── vendor.ts

composables/
├── useVendorDashboard.ts
├── useVendorListings.ts
├── useVendorOrders.ts
├── useVendorInventory.ts
├── useVendorWallet.ts
└── useVendorAnalytics.ts

components/
├── vendor/
│   ├── VendorStatsCard.vue
│   ├── VendorOrderCard.vue
│   ├── VendorOrderStatusUpdate.vue
│   ├── VendorProductTable.vue
│   ├── VendorProductForm.vue
│   ├── VendorImageUpload.vue
│   ├── VendorStockTable.vue
│   ├── VendorRevenueChart.vue
│   └── VendorWalletCard.vue
└── ui/
    ├── UiTable.vue
    ├── UiTabs.vue
    ├── UiFileUpload.vue
    └── UiSelect.vue

pages/
└── vendor/
    ├── index.vue                      # Dashboard
    ├── products/
    │   ├── index.vue                  # Ürün listesi
    │   ├── new.vue                    # Yeni ürün
    │   └── [id]/
    │       └── edit.vue               # Ürün düzenleme
    ├── orders/
    │   ├── index.vue                  # Sipariş listesi
    │   └── [id].vue                   # Sipariş detay
    ├── inventory/
    │   └── index.vue                  # Stok + depo + PO + transfer (tab)
    ├── analytics.vue                  # Satış analizi
    ├── wallet.vue                     # Cüzdan
    └── settings.vue                   # Mağaza ayarları + banka hesapları

layouts/
└── vendor.vue                         # GÜNCELLENDİ — sidebar nav güncel

locales/
└── tr.json                            # GÜNCELLENDİ — vendor.* key'leri
```

> **Not:** Her dosyayı tam implementasyonla yaz. Ürün ekleme formundaki cascading kategori seçimi, görsel yükleme, sipariş durum güncelleme + kargo bilgisi girişi, stok inline düzenleme — tümü çalışır durumda olacak. Gelir grafiği için basit CSS bar chart yeterli (apexcharts gibi kütüphane ekleme).
