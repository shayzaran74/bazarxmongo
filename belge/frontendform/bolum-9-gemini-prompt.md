# BarterBorsa Frontend — Bölüm 9: Admin Paneli

## SİSTEM TALİMATLARI

Bölüm 1-8 tamamlandı. Bu bölümde **platform yönetimi — admin paneli** yazılacak. Tüm sayfalar `layouts/admin.vue` layout'unu ve `admin` middleware'ini kullanır.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK**
- `<script setup lang="ts">` zorunlu
- SSR-safe
- Bölüm 1-8'deki composable/component'leri kullan
- `brand-*` ve `surface-*` Tailwind renk paleti

### ÖNEMLİ NOT

Mevcut admin panelinde 70+ sayfa var. Yeniden yazımda **en kritik 15 sayfayı** yazacağız. Diğerleri ileride eklenebilir. Öncelik sırası:

1. Dashboard (özet istatistikler)
2. Kullanıcı yönetimi
3. Vendor yönetimi (onay/red)
4. Sipariş yönetimi
5. Ürün yönetimi + moderasyon
6. Kategori yönetimi (CRUD + tree)
7. Marka onayları
8. Dispute yönetimi
9. Banner yönetimi
10. İçerik yönetimi (duyurular)
11. Yardım merkezi yönetimi
12. Reklam kampanyaları
13. Platform analitik
14. Loyalty/XP yönetimi
15. Sistem ayarları

### BACKEND API ENDPOINTLERİ (Admin)

```
# Dashboard
GET  /admin/dashboard/health           → { success, data: DashboardHealth }
GET  /admin/wallet/stats               → { success, data: WalletStats }

# Kullanıcılar
GET  /admin/users                      → { success, data: User[], meta }  query: page, search, status, role
GET  /admin/users/:id                  → { success, data: User }
PATCH /admin/users/:id                 → { success }  body: { role, status }
DELETE /admin/users/:id                → { success }

# Vendor'lar
GET  /admin/vendors                    → { success, data: Vendor[], meta }  query: page, status, search
GET  /admin/vendors/:id                → { success, data: Vendor }
PATCH /admin/vendors/:id/approve       → { success }
PATCH /admin/vendors/:id/reject        → { success }  body: { reason }
PATCH /admin/vendors/:id/suspend       → { success }

# Siparişler
GET  /admin/orders                     → { success, data: Order[], meta }  query: page, status, search, vendorId
GET  /admin/orders/:id                 → { success, data: Order }
PATCH /admin/orders/:id/status         → { success }  body: { status }

# Ürünler
GET  /admin/products                   → { success, data: Product[], meta }  query: page, status, search
PATCH /admin/products/:id/approve      → { success }
PATCH /admin/products/:id/reject       → { success }  body: { reason }
DELETE /admin/products/:id             → { success }

# Kategoriler
GET  /categories                       → { success, data: Category[] }  query: all, includeChildren
POST /categories                       → { success, data: Category }
PATCH /categories/:id                  → { success, data: Category }
DELETE /categories/:id                 → { success }

# Markalar
GET  /admin/brands                     → { success, data: Brand[], meta }  query: page, status
PATCH /admin/brands/:id/approve        → { success }
PATCH /admin/brands/:id/reject         → { success }

# Dispute'lar
GET  /admin/disputes                   → { success, data: Dispute[], meta }  query: page, status
GET  /admin/disputes/:id               → { success, data: Dispute }
PATCH /admin/disputes/:id/resolve      → { success }  body: { resolution, note }

# Banner'lar
GET  /banners                          → { success, data: Banner[] }
POST /banners                          → { success, data: Banner }
PATCH /banners/:id                     → { success, data: Banner }
DELETE /banners/:id                    → { success }

# İçerik
GET  /announcements                    → { success, data: Announcement[] }
POST /announcements                    → { success, data: Announcement }
PATCH /announcements/:id              → { success }
DELETE /announcements/:id             → { success }

# Yardım Merkezi
GET  /help/categories                  → { success, data: HelpCategory[] }
POST /help/categories                  → { success, data: HelpCategory }
GET  /help/articles                    → { success, data: HelpArticle[], meta }
POST /help/articles                    → { success, data: HelpArticle }
PATCH /help/articles/:id              → { success }
DELETE /help/articles/:id             → { success }

# Reklam
GET  /admin/campaigns                  → { success, data: AdCampaign[], meta }
GET  /admin/campaigns/:id              → { success, data: AdCampaign }
PATCH /admin/campaigns/:id/status      → { success }  body: { status }

# Analitik
GET  /admin/analytics                  → { success, data: AnalyticsSummary }  query: period
GET  /admin/analytics/revenue          → { success, data: RevenueData[] }

# Loyalty
GET  /admin/loyalty/missions           → { success, data: Mission[] }
POST /admin/loyalty/missions           → { success, data: Mission }
PATCH /admin/loyalty/missions/:id      → { success }
GET  /admin/loyalty/tiers              → { success, data: Tier[] }

# Sistem Ayarları
GET  /system/settings                  → { success, data: Record<string, string> }
PATCH /system/settings                 → { success }  body: Record<string, string>
```

---

## 1. TİP TANIMLARI — `types/admin.ts`

```typescript
import type { BaseEntity } from '~/types/common'

/** Dashboard health response */
export interface DashboardHealth {
  totalUsers: number
  totalVendors: number
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalAuctions: number
  totalLotteries: number
  pendingProductsCount: number
  pendingVendorsCount: number
  openDisputesCount: number
}

/** Dashboard financial stats */
export interface DashboardFinancials {
  totalCommissionXP: number
  totalAdXP: number
  totalServiceXP: number
  totalBarterBalance: number
  totalXPEarned: number
  totalDeposits: number
  totalWithdrawals: number
}

/** Admin user listesi (genişletilmiş) */
export interface AdminUser extends BaseEntity {
  email: string
  role: string
  status: string
  isEmailVerified: boolean
  lastLoginAt: string | null
  profile?: { firstName: string | null; lastName: string | null; avatar: string | null; phone: string | null }
  vendor?: { id: string; status: string; businessName: string } | null
  _count?: { orders: number }
}

/** Admin vendor listesi (genişletilmiş) */
export interface AdminVendor extends BaseEntity {
  userId: string
  status: string
  slug: string
  tier: string
  businessName: string
  logo: string | null
  isVerified: boolean
  commissionRate: number
  rating: number | null
  user?: { email: string; profile?: { firstName: string | null; lastName: string | null } }
  company?: { name: string; taxNumber: string; mersisNumber: string | null }
  _count?: { listings: number; orders: number }
}

/** Admin sipariş */
export interface AdminOrder extends BaseEntity {
  orderNumber: string
  status: string
  totalAmount: number
  user?: { email: string; profile?: { firstName: string | null; lastName: string | null } }
  vendor?: { businessName: string }
  itemCount: number
}

/** Dispute */
export interface Dispute extends BaseEntity {
  orderId: string
  orderNumber: string
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'
  reason: string
  resolution: string | null
  resolutionNote: string | null
  buyer?: { email: string; profile?: { firstName: string | null } }
  seller?: { businessName: string }
}

export type DisputeResolution = 'REFUND_BUYER' | 'FAVOR_SELLER' | 'PARTIAL_REFUND'

/** Banner */
export interface AdminBanner extends BaseEntity {
  title: string
  subtitle: string | null
  image: string
  link: string | null
  sortOrder: number
  isActive: boolean
  ecosystem: string
}

export interface BannerInput {
  title: string
  subtitle?: string
  image: string
  link?: string
  sortOrder?: number
  isActive?: boolean
  ecosystem?: string
}

/** Duyuru */
export interface Announcement extends BaseEntity {
  title: string
  content: string
  startDate: string
  endDate: string
  isActive: boolean
}

/** Yardım kategorisi */
export interface HelpCategory extends BaseEntity {
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
}

/** Yardım makalesi */
export interface HelpArticle extends BaseEntity {
  title: string
  slug: string
  content: string
  categoryId: string
  category?: HelpCategory
  status: 'DRAFT' | 'PUBLISHED'
  viewCount: number
}

/** Reklam kampanyası */
export interface AdminAdCampaign extends BaseEntity {
  name: string
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  budget: number
  spent: number
  vendor?: { businessName: string }
  metrics?: { impressions: number; clicks: number; ctr: number }
}

/** Platform analitik */
export interface PlatformAnalytics {
  revenue: { date: string; amount: number }[]
  orders: { date: string; count: number }[]
  users: { date: string; count: number }[]
  summary: {
    totalRevenue: number; totalOrders: number; totalUsers: number
    avgOrderValue: number; conversionRate: number
  }
}

/** Loyalty mission */
export interface Mission extends BaseEntity {
  title: string
  description: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME'
  xpReward: number
  targetValue: number
  isActive: boolean
}

/** Loyalty tier */
export interface LoyaltyTier extends BaseEntity {
  name: string
  nametr: string
  minXp: number
  maxXp: number | null
  benefits: string[]
  commissionDiscount: number
}
```

---

## 2. MIDDLEWARE — `middleware/admin.ts`

```typescript
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) return navigateTo('/auth/login')
  const role = authStore.user?.role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return navigateTo('/')
})
```

---

## 3. COMPOSABLE'LAR

### 3.1 `composables/useAdminDashboard.ts`
- `stats` (DashboardHealth), `financials` (DashboardFinancials), `loading`
- `fetchStats()` → GET /admin/dashboard/health + /admin/wallet/stats paralel

### 3.2 `composables/useAdminUsers.ts`
- `users`, `loading`, `meta`
- `fetchUsers(params?)` → GET /admin/users (page, search, status, role)
- `updateUser(id, { role, status })` → PATCH /admin/users/:id
- `deleteUser(id)` → DELETE /admin/users/:id

### 3.3 `composables/useAdminVendors.ts`
- `vendors`, `loading`, `meta`
- `fetchVendors(params?)` → GET /admin/vendors
- `approveVendor(id)` → PATCH /admin/vendors/:id/approve
- `rejectVendor(id, reason)` → PATCH /admin/vendors/:id/reject
- `suspendVendor(id)` → PATCH /admin/vendors/:id/suspend

### 3.4 `composables/useAdminOrders.ts`
- `orders`, `loading`, `meta`, `filterStatus`, `searchQuery`
- `fetchOrders(params?)` → GET /admin/orders
- `updateOrderStatus(id, status)` → PATCH /admin/orders/:id/status
- `filteredOrders` computed
- Bulk operations: `selectedIds`, `bulkUpdateStatus()`

### 3.5 `composables/useAdminProducts.ts`
- `products`, `loading`, `meta`
- `fetchProducts(params?)` → GET /admin/products
- `approveProduct(id)` → PATCH /admin/products/:id/approve
- `rejectProduct(id, reason)` → PATCH /admin/products/:id/reject
- `deleteProduct(id)` → DELETE /admin/products/:id

### 3.6 `composables/useAdminCatalog.ts`
- Kategori CRUD: `fetchCategories`, `createCategory`, `updateCategory`, `deleteCategory`
- Marka onay: `fetchBrands`, `approveBrand`, `rejectBrand`

### 3.7 `composables/useAdminDisputes.ts`
- `disputes`, `loading`
- `fetchDisputes(params?)` → GET /admin/disputes
- `resolveDispute(id, { resolution, note })` → PATCH /admin/disputes/:id/resolve

### 3.8 `composables/useAdminContent.ts`
- Banner CRUD: `fetchBanners`, `createBanner`, `updateBanner`, `deleteBanner`
- Duyuru CRUD: `fetchAnnouncements`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`
- Help CRUD: `fetchHelpCategories`, `createHelpCategory`, `fetchArticles`, `createArticle`, `updateArticle`, `deleteArticle`

### 3.9 `composables/useAdminAnalytics.ts`
- `analytics`, `loading`, `selectedPeriod`
- `fetchAnalytics()` → GET /admin/analytics

### 3.10 `composables/useAdminLoyalty.ts`
- Mission CRUD: `missions`, `fetchMissions`, `createMission`, `updateMission`
- Tier listesi: `tiers`, `fetchTiers`

---

## 4. SAYFALAR

### 4.1 `pages/admin/index.vue` — Dashboard
- KPI kartları (8 adet): ürün, kategori, kullanıcı, sipariş, vendor, artırma, çekiliş, bekleyen onay
- Finansal havuzlar: komisyon XP, reklam XP, servis XP, barter havuzu
- Son aktiviteler listesi
- Hızlı erişim kısayolları (en çok kullanılan admin sayfalarına linkler)

### 4.2 `pages/admin/users/index.vue` — Kullanıcı Listesi
- Arama + durum filtresi + rol filtresi
- Tablo: avatar, ad, email, rol, durum, son giriş, sipariş sayısı
- Aksiyonlar: rol değiştir (select), durum değiştir, sil (onay ile)
- Pagination

### 4.3 `pages/admin/users/[id].vue` — Kullanıcı Detay
- Profil bilgileri
- Sipariş geçmişi
- Rol/durum değiştirme

### 4.4 `pages/admin/vendors/index.vue` — Vendor Listesi
- Durum filtresi (PENDING/APPROVED/REJECTED/SUSPENDED) + arama
- Tablo: logo, firma adı, email, durum badge, tier, komisyon, ürün sayısı
- PENDING olanlar vurgulanmış
- Aksiyonlar: Onayla / Reddet (neden gir) / Askıya Al
- Detay modal: firma bilgileri, vergi no, belgeler, onay/red butonları

### 4.5 `pages/admin/orders/index.vue` — Sipariş Listesi
- Stat kartları: toplam, bekleyen, kargoda, tamamlanan
- Arama + durum filtresi + vendor filtresi
- Tablo: sipariş no, müşteri, vendor, tutar, durum badge, tarih
- Bulk aksiyonlar: toplu durum güncelleme
- Sipariş tıklanınca → /admin/orders/:id

### 4.6 `pages/admin/orders/[id].vue` — Sipariş Detay
- Sipariş bilgileri + durum güncelleme
- Ürün listesi
- Fiyat özeti
- Teslimat adresi
- Durum timeline

### 4.7 `pages/admin/products/index.vue` — Ürün Listesi
- Arama + durum filtresi (ACTIVE/PENDING/REJECTED)
- Tablo: görsel, ad, vendor, fiyat, stok, durum badge
- Aksiyonlar: onayla, reddet, sil
- "Onay Bekleyenler" hızlı filtre butonu

### 4.8 `pages/admin/categories/index.vue` — Kategori Yönetimi
- Hiyerarşik tablo: ana → alt → detay kategoriler (expandable rows)
- CRUD: ekle (modal), düzenle (modal), sil (onay)
- Her satır: ikon, isim, slug, alt kategori sayısı, ürün sayısı, durum toggle
- Oluşturma/düzenleme modal: isim, slug (otomatik), ikon select, üst kategori select, açıklama, aktif toggle

### 4.9 `pages/admin/brands.vue` — Marka Yönetimi
- Durum filtresi (PENDING/APPROVED/REJECTED)
- Tablo: logo, isim, durum badge, ürün sayısı
- Aksiyonlar: onayla, reddet

### 4.10 `pages/admin/disputes/index.vue` — Dispute Yönetimi
- Durum filtresi (OPEN/UNDER_REVIEW/RESOLVED)
- Kart listesi: sipariş no, alıcı/satıcı, sebep, durum
- Detay → modal veya sayfa: her iki tarafın mesajları, karar verme formu
- Karar: REFUND_BUYER / FAVOR_SELLER / PARTIAL_REFUND + açıklama notu

### 4.11 `pages/admin/banners.vue` — Banner Yönetimi
- Banner listesi: görsel önizleme, başlık, link, sıra, aktif toggle
- CRUD: ekle/düzenle modal (başlık, subtitle, görsel URL, link, sıra, ekosistem select, aktif toggle)
- Sıralama (drag & drop opsiyonel, veya sort order input)

### 4.12 `pages/admin/content.vue` — Duyuru Yönetimi
- Duyuru listesi + CRUD modal
- Alanlar: başlık, içerik (textarea), başlangıç/bitiş tarihi, aktif toggle

### 4.13 `pages/admin/help.vue` — Yardım Merkezi
- Sol: kategori listesi + ekle butonu
- Sağ: seçili kategorinin makaleleri
- Makale CRUD: başlık, slug, içerik (textarea/rich text), durum (DRAFT/PUBLISHED)
- Stat kartları: toplam makale, aktif kategori, toplam okunma

### 4.14 `pages/admin/analytics.vue` — Platform Analitik
- Periyot seçici: 7d / 30d / 90d
- Özet kartlar: toplam gelir, sipariş, kullanıcı, ort. sipariş değeri
- Gelir grafiği (basit CSS bar chart)
- Sipariş grafiği
- Kullanıcı büyüme grafiği

### 4.15 `pages/admin/settings.vue` — Sistem Ayarları
- Key-value form: site adı, açıklama, logo URL, kargo ücreti, vb.
- Ecosystem bazlı ayarlar (BazarX, TicariTakas, BarterBorsa)
- "Kaydet" butonu → PATCH /system/settings

---

## 5. COMPONENT'LER

### 5.1 `components/admin/`

```
AdminStatsCard.vue         — KPI kartı (ikon + değer + label)
AdminPoolCard.vue          — Finansal havuz kartı (gradient, ikon, değer)
AdminShortcuts.vue         — Hızlı erişim kısayol grid

AdminUserTable.vue         — Kullanıcı tablosu (sort, filtre, aksiyonlar)
AdminVendorTable.vue       — Vendor tablosu
AdminVendorDetailModal.vue — Vendor detay + onay/red
AdminOrderTable.vue        — Sipariş tablosu (bulk select)
AdminOrderStats.vue        — Sipariş stat kartları
AdminProductTable.vue      — Ürün tablosu (onay/red aksiyonları)
AdminCategoryTree.vue      — Hiyerarşik kategori tablosu (expandable)
AdminCategoryForm.vue      — Kategori oluştur/düzenle modal formu
AdminBrandTable.vue        — Marka tablosu (onay/red)
AdminDisputeCard.vue       — Dispute kartı
AdminDisputeResolveForm.vue — Karar verme formu (resolution select + note)
AdminBannerCard.vue        — Banner kartı (önizleme + aksiyonlar)
AdminBannerForm.vue        — Banner oluştur/düzenle formu
AdminAnnouncementForm.vue  — Duyuru formu
AdminHelpArticleForm.vue   — Yardım makalesi formu
AdminRevenueChart.vue      — Gelir grafiği (basit CSS bar)
AdminMissionForm.vue       — Loyalty mission formu
```

### 5.2 Ek UI Component'ler

```
UiDataTable.vue            — Gelişmiş tablo: sort, pagination, bulk select, responsive
  Props: columns, data, loading, selectable, meta
  Emits: sort, pageChange, select

UiConfirmDialog.vue        — Onay dialogu (tehlikeli aksiyonlar için)
  Props: open, title, message, confirmText, confirmVariant
  Emits: confirm, cancel

UiRichTextEditor.vue       — Basit zengin metin editörü (help makaleleri için)
  Props: modelValue
  Emits: update:modelValue
  NOT: Şimdilik textarea olarak yaz, TipTap ileride eklenebilir
```

---

## 6. LAYOUT GÜNCELLEME — `layouts/admin.vue`

Bölüm 1'de yazılan admin layout'un sidebar navigasyonunu güncelle — yeni sayfalarla eşleşecek:

```
Navigasyon yapısı:
- Dashboard (/admin)
- SATIŞ KANALLARI:
  - Siparişler (/admin/orders)
  - Ürünler (/admin/products)
  - Kategoriler (/admin/categories)
  - Markalar (/admin/brands)
- KULLANICILAR:
  - Kullanıcılar (/admin/users)
  - Vendor'lar (/admin/vendors)
  - Dispute'lar (/admin/disputes)
- İÇERİK:
  - Banner'lar (/admin/banners)
  - Duyurular (/admin/content)
  - Yardım Merkezi (/admin/help)
- REKLAM & ANALİTİK:
  - Reklam Kampanyaları (/admin/campaigns)
  - Platform Analitik (/admin/analytics)
- SİSTEM:
  - Loyalty / XP (/admin/loyalty)
  - Sistem Ayarları (/admin/settings)
```

Collapsible menü grupları (mevcut yapıdan korunan).

---

## 7. i18n — `locales/tr.json`'a ekle

```json
{
  "admin": {
    "dashboard": "Dashboard",
    "refresh": "Yenile",
    "totalProducts": "Toplam Ürün",
    "totalCategories": "Toplam Kategori",
    "totalUsers": "Toplam Kullanıcı",
    "totalOrders": "Toplam Sipariş",
    "totalVendors": "Toplam Vendor",
    "pendingApprovals": "Onay Bekleyen",
    "openDisputes": "Açık Anlaşmazlık",
    "financialPools": "Finansal Havuzlar",
    "users": {
      "title": "Kullanıcı Yönetimi",
      "search": "İsim veya email ara...",
      "role": "Rol",
      "status": "Durum",
      "lastLogin": "Son Giriş",
      "changeRole": "Rol Değiştir",
      "changeStatus": "Durum Değiştir",
      "deleteConfirm": "Bu kullanıcıyı silmek istediğinize emin misiniz?"
    },
    "vendors": {
      "title": "Vendor Yönetimi",
      "approve": "Onayla",
      "reject": "Reddet",
      "suspend": "Askıya Al",
      "rejectReason": "Red Nedeni",
      "pendingApproval": "Onay Bekliyor",
      "companyInfo": "Firma Bilgileri",
      "taxNumber": "Vergi No",
      "approved": "Vendor onaylandı",
      "rejected": "Vendor reddedildi"
    },
    "orders": {
      "title": "Sipariş Yönetimi",
      "orderNo": "Sipariş No",
      "customer": "Müşteri",
      "vendor": "Satıcı",
      "amount": "Tutar",
      "bulkUpdate": "Toplu Güncelle",
      "selectAll": "Tümünü Seç"
    },
    "products": {
      "title": "Ürün Yönetimi",
      "approve": "Onayla",
      "reject": "Reddet",
      "pendingProducts": "Onay Bekleyen Ürünler",
      "rejectReason": "Red Nedeni"
    },
    "categories": {
      "title": "Kategori Yönetimi",
      "addCategory": "Kategori Ekle",
      "editCategory": "Kategori Düzenle",
      "name": "Kategori Adı",
      "slug": "Slug",
      "icon": "İkon",
      "parentCategory": "Üst Kategori",
      "deleteConfirm": "Bu kategoriyi silmek istediğinize emin misiniz?",
      "saved": "Kategori kaydedildi",
      "deleted": "Kategori silindi"
    },
    "brands": {
      "title": "Marka Yönetimi",
      "pendingBrands": "Onay Bekleyen Markalar"
    },
    "disputes": {
      "title": "Anlaşmazlık Yönetimi",
      "resolve": "Karar Ver",
      "resolution": "Karar",
      "resolutionNote": "Karar Notu",
      "refundBuyer": "Alıcıya İade",
      "favorSeller": "Satıcı Lehine",
      "partialRefund": "Kısmi İade",
      "resolved": "Anlaşmazlık çözüldü"
    },
    "banners": {
      "title": "Banner Yönetimi",
      "addBanner": "Banner Ekle",
      "editBanner": "Banner Düzenle",
      "imageUrl": "Görsel URL",
      "link": "Link",
      "sortOrder": "Sıra",
      "ecosystem": "Ekosistem"
    },
    "content": {
      "title": "Duyuru Yönetimi",
      "addAnnouncement": "Duyuru Ekle"
    },
    "help": {
      "title": "Yardım Merkezi",
      "addCategory": "Kategori Ekle",
      "addArticle": "Makale Ekle",
      "totalArticles": "Toplam Makale",
      "totalViews": "Toplam Okunma"
    },
    "analytics": {
      "title": "Platform Analitik",
      "revenue": "Gelir",
      "ordersCount": "Sipariş Sayısı",
      "userGrowth": "Kullanıcı Büyümesi"
    },
    "loyalty": {
      "title": "Sadakat & XP",
      "missions": "Görevler",
      "tiers": "Seviyeler",
      "addMission": "Görev Ekle"
    },
    "settings": {
      "title": "Sistem Ayarları",
      "siteName": "Site Adı",
      "siteDescription": "Site Açıklaması",
      "saved": "Ayarlar kaydedildi"
    }
  }
}
```

---

## 8. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/admin` → Dashboard: KPI kartları, finansal havuzlar, son aktiviteler
4. `/admin/users` → Kullanıcı listesi: arama, filtre, rol/durum değiştirme
5. `/admin/vendors` → Vendor listesi: onay/red/askıya al aksiyonları
6. `/admin/orders` → Sipariş listesi: filtre, bulk güncelleme
7. `/admin/orders/:id` → Sipariş detay + durum güncelleme
8. `/admin/products` → Ürün listesi: onay/red/sil
9. `/admin/categories` → Kategori tree CRUD (expandable + modal)
10. `/admin/brands` → Marka onay/red
11. `/admin/disputes` → Dispute listesi + karar verme
12. `/admin/banners` → Banner CRUD
13. `/admin/content` → Duyuru CRUD
14. `/admin/help` → Yardım merkezi: kategori + makale CRUD
15. `/admin/analytics` → Periyot seçimi, özet kartlar, grafikler
16. `/admin/settings` → Sistem ayarları kaydetme
17. Admin middleware: ADMIN/SUPER_ADMIN olmayan → / redirect
18. Admin layout sidebar: tüm linkler doğru, aktif vurgulu
19. Mobile responsive (admin genellikle desktop ama temel responsive olmalı)

---

## 9. DOSYA YAPISI

```
types/admin.ts
middleware/admin.ts

composables/
├── useAdminDashboard.ts
├── useAdminUsers.ts
├── useAdminVendors.ts
├── useAdminOrders.ts
├── useAdminProducts.ts
├── useAdminCatalog.ts
├── useAdminDisputes.ts
├── useAdminContent.ts
├── useAdminAnalytics.ts
└── useAdminLoyalty.ts

components/admin/
├── AdminStatsCard.vue, AdminPoolCard.vue, AdminShortcuts.vue
├── AdminUserTable.vue
├── AdminVendorTable.vue, AdminVendorDetailModal.vue
├── AdminOrderTable.vue, AdminOrderStats.vue
├── AdminProductTable.vue
├── AdminCategoryTree.vue, AdminCategoryForm.vue
├── AdminBrandTable.vue
├── AdminDisputeCard.vue, AdminDisputeResolveForm.vue
├── AdminBannerCard.vue, AdminBannerForm.vue
├── AdminAnnouncementForm.vue
├── AdminHelpArticleForm.vue
├── AdminRevenueChart.vue
└── AdminMissionForm.vue

components/ui/
├── UiDataTable.vue
├── UiConfirmDialog.vue
└── UiRichTextEditor.vue (textarea placeholder)

pages/admin/
├── index.vue
├── users/index.vue, users/[id].vue
├── vendors/index.vue
├── orders/index.vue, orders/[id].vue
├── products/index.vue
├── categories/index.vue
├── brands.vue
├── disputes/index.vue
├── banners.vue
├── content.vue
├── help.vue
├── campaigns.vue (placeholder — reklam kampanya listesi)
├── analytics.vue
├── loyalty.vue
└── settings.vue

layouts/admin.vue (GÜNCELLENDİ — sidebar nav güncel)
locales/tr.json (GÜNCELLENDİ — admin.* key'leri)
```

> **Not:** Her dosyayı tam implementasyonla yaz. UiDataTable genel tablo component'i — sort, pagination, bulk select desteği ile. Kategori tree expandable satırlar ile (ana → alt → detay). Vendor onay: detay modal'da firma bilgileri (vergi no, MERSIS) görüntülenip onay/red butonları olacak. Dispute karar verme: resolution tipi select + zorunlu not alanı.
