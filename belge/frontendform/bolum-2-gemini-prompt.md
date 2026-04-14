# BarterBorsa Frontend — Bölüm 2: Public Sayfalar (Anasayfa, Ürün Listesi, Ürün Detay, Kategori, Arama)

## SİSTEM TALİMATLARI

Bölüm 1'de proje iskeleti, layout'lar, auth akışı ve temel UI bileşenleri yazıldı. Bu bölümde ziyaretçinin göreceği tüm public sayfaları yazacaksın. Tüm sayfalar SSR uyumlu ve SEO optimize olacak.

### MUTLAK KURALLAR (Bölüm 1'den devam)
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK** (sadece `console.error` / `console.warn`)
- `<script setup lang="ts">` zorunlu
- SSR-safe: browser API → `onMounted` veya `import.meta.client` içinde
- Tüm component prop/emit'leri tam tipli
- Tailwind class'larında `brand-*` ve `surface-*` renk paletini kullan (Bölüm 1'de tanımlandı)
- Bölüm 1'de yazılan `useApi`, `useToast`, `useAuth`, `UiButton`, `UiSpinner`, `UiBadge`, `UiEmptyState` vb. bileşenleri kullan

### MEVCUT BACKEND API ENDPOINTLERİ

```
GET  /categories                       → { success, data: Category[] }      query: all, includeChildren
GET  /categories/mega-menu             → { success, data: Category[] }      Mega menu için optimize
GET  /products                         → { success, data: Product[], meta } query: page, limit, sort, categorySlug, brandSlug, minPrice, maxPrice, search, isFeatured, isFlashSale, freeShipping
GET  /products/:slug                   → { success, data: Product }         Slug ile ürün detay (listing + catalog bilgileri)
GET  /products/specs                   → { success, data: Record<string,string[]> } Filtrelenebilir özellikler
GET  /brands                           → { success, data: Brand[] }
GET  /brands/:slug                     → { success, data: Brand }
GET  /reviews?productId=X              → { success, data: Review[], meta }  Ürün yorumları
GET  /banners?ecosystem=BAZARX         → { success, data: Banner[] }        Anasayfa banner'ları
GET  /quad-cards?ecosystem=BAZARX      → { success, data: QuadCard[] }      4'lü kart
GET  /listings?featured=true           → { success, data: Listing[] }       Öne çıkan ürünler
GET  /campaigns?status=ACTIVE          → { success, data: Campaign[] }      Aktif kampanyalar
GET  /vendors/:slug                    → { success, data: Vendor }          Vendor public profili
GET  /favorites                        → { success, data: Favorite[] }      (auth required)
POST /favorites                        → { success }                         (auth required)
DELETE /favorites/:id                  → { success }                         (auth required)
GET  /seo?path=/products               → { success, data: SeoMetadata }     Dinamik SEO
```

---

## 1. TİP TANIMLARI

### 1.1 `types/catalog.ts`

```typescript
import type { BaseEntity } from '~/types/common'

/** Kategori */
export interface Category extends BaseEntity {
  name: string
  slug: string
  description: string | null
  icon: string | null
  image: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
  children?: Category[]
  parent?: Category | null
  _count?: { products: number }
}

/** Marka */
export interface Brand extends BaseEntity {
  name: string
  slug: string
  logo: string | null
  description: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isActive: boolean
}

/** Ürün görseli */
export interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

/** Ürün varyantı */
export interface ProductVariant {
  id: string
  sku: string | null
  price: number
  compareAtPrice: number | null
  stock: number
  attributes: Record<string, string>
  isActive: boolean
}

/** Ürün badge */
export interface ProductBadge {
  text: string
  class?: string
  style?: { backgroundColor: string; color: string }
  iconUrl?: string | null
}

/** Dinamik badge pozisyonları */
export interface DynamicBadges {
  topLeft?: ProductBadge
  topRight?: ProductBadge
  bottomLeft?: ProductBadge
  bottomRight?: ProductBadge
}

/** Yorum */
export interface Review extends BaseEntity {
  rating: number
  comment: string | null
  userId: string
  orderId: string
  user?: { profile?: { firstName: string | null; lastName: string | null; avatar: string | null } }
}

/** Vendor özet (ürün kartında gösterilecek) */
export interface VendorInfo {
  id: string
  slug: string
  businessName?: string
  logo: string | null
  isVerified: boolean
  tier: string
  rating?: number
}

/** Listing — vendor'ın ürün listesi */
export interface Listing extends BaseEntity {
  price: number
  compareAtPrice: number | null
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT'
  vendor?: VendorInfo
  images?: ProductImage[]
}

/** Ürün — ana entity (CatalogProduct + aktif Listing bilgileri) */
export interface Product extends BaseEntity {
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  image: string | null
  images: string[]
  price: number
  compareAtPrice: number | null
  stock: number
  sku: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT'
  isFeatured: boolean
  isFlashSale: boolean
  hasVariants: boolean
  variants?: ProductVariant[]
  category?: Category | null
  brand?: Brand | null
  vendor?: VendorInfo | null
  vendorId?: string
  reviews?: Review[]
  reviewCount?: number
  averageRating?: number
  dynamicBadges?: DynamicBadges
  specifications?: Record<string, string>
  bestListingId?: string
  freeShipping?: boolean
  maxPurchasePerMember?: number
  purchasedCount?: number
  // Listing bilgileri
  listing?: Listing
}

/** Banner */
export interface Banner extends BaseEntity {
  title: string
  subtitle: string | null
  image: string
  link: string | null
  sortOrder: number
  isActive: boolean
  ecosystem: string
}

/** QuadCard */
export interface QuadCard extends BaseEntity {
  title: string
  image: string | null
  link: string | null
  sortOrder: number
  items?: QuadCardItem[]
}

export interface QuadCardItem {
  id: string
  title: string
  image: string | null
  link: string | null
  price: number | null
}

/** Kampanya */
export interface Campaign extends BaseEntity {
  name: string
  slug: string
  description: string | null
  image: string | null
  startDate: string
  endDate: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  status: 'ACTIVE' | 'SCHEDULED' | 'ENDED'
}
```

---

## 2. COMPOSABLE'LAR

### 2.1 `composables/useProducts.ts`

URL query'den filtre oku, ürün listesi çek, pagination yönet:

```typescript
import type { Product } from '~/types/catalog'
import type { PaginatedResponse, PaginationMeta } from '~/types/api'

export interface ProductFilters {
  page?: number
  limit?: number
  sort?: string
  search?: string
  categorySlug?: string
  brandSlug?: string
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  isFlashSale?: boolean
  freeShipping?: boolean
}

export function useProducts() {
  const { $api } = useApi()
  const route = useRoute()
  const router = useRouter()

  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const meta = ref<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  /** URL query'den filtre nesnesine dönüştür */
  function filtersFromQuery(): ProductFilters {
    const q = route.query
    return {
      page: q.page ? Number(q.page) : 1,
      limit: q.limit ? Number(q.limit) : 20,
      sort: (q.sort as string) || undefined,
      search: (q.search as string) || undefined,
      categorySlug: (q.categorySlug as string) || undefined,
      brandSlug: (q.brandSlug as string) || undefined,
      minPrice: q.minPrice ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
      isFeatured: q.isFeatured === 'true' ? true : undefined,
      isFlashSale: q.isFlashSale === 'true' ? true : undefined,
      freeShipping: q.freeShipping === 'true' ? true : undefined,
    }
  }

  /** Filtre nesnesini URL query'ye yaz */
  function updateQuery(filters: ProductFilters) {
    const query: Record<string, string> = {}
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== false) {
        query[key] = String(val)
      }
    })
    router.push({ query })
  }

  /** Ürünleri API'den çek */
  async function fetchProducts(filters?: ProductFilters) {
    const activeFilters = filters || filtersFromQuery()
    loading.value = true
    error.value = null

    try {
      // Boş değerleri temizle
      const query: Record<string, unknown> = {}
      Object.entries(activeFilters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query[key] = val
        }
      })

      const response = await $api<PaginatedResponse<Product>>('products', { query })

      if (response.success) {
        products.value = response.data || []
        if (response.meta) {
          meta.value = response.meta
        }
      }
    } catch (err) {
      error.value = 'Ürünler yüklenirken hata oluştu'
      console.error('fetchProducts error:', err)
    } finally {
      loading.value = false
    }
  }

  /** Sayfayı değiştir */
  function goToPage(page: number) {
    const filters = filtersFromQuery()
    filters.page = page
    updateQuery(filters)
  }

  /** Filtreleri sıfırla */
  function clearFilters() {
    router.push({ query: {} })
  }

  return {
    products,
    loading,
    error,
    meta,
    filtersFromQuery,
    updateQuery,
    fetchProducts,
    goToPage,
    clearFilters,
  }
}
```

### 2.2 `composables/useProduct.ts`

Tekil ürün detay — SSR ile çekilecek:

```typescript
import type { Product, Review } from '~/types/catalog'
import type { ApiResponse, PaginatedResponse } from '~/types/api'

export function useProduct(slug: Ref<string> | string) {
  const { $api } = useApi()
  const slugValue = typeof slug === 'string' ? slug : slug.value

  /** SSR uyumlu ürün fetch */
  const { data: product, pending: loading, error } = useAsyncData<Product | null>(
    `product-${slugValue}`,
    async () => {
      const response = await $api<ApiResponse<Product>>(`products/${slugValue}`)
      return response.success ? response.data : null
    },
  )

  /** İlgili ürünler (lazy, client-side) */
  const relatedProducts = ref<Product[]>([])
  const loadingRelated = ref(false)

  async function fetchRelated() {
    if (!product.value?.category?.slug) return
    loadingRelated.value = true
    try {
      const response = await $api<PaginatedResponse<Product>>('products', {
        query: {
          categorySlug: product.value.category.slug,
          limit: 5,
        },
      })
      if (response.success && response.data) {
        relatedProducts.value = response.data
          .filter((p) => p.id !== product.value?.id)
          .slice(0, 4)
      }
    } catch {
      // İlgili ürünler kritik değil
    } finally {
      loadingRelated.value = false
    }
  }

  /** Yorumlar (lazy, paginated) */
  const reviews = ref<Review[]>([])
  const loadingReviews = ref(false)

  async function fetchReviews(page = 1) {
    if (!product.value?.id) return
    loadingReviews.value = true
    try {
      const response = await $api<PaginatedResponse<Review>>('reviews', {
        query: { productId: product.value.id, page, limit: 10 },
      })
      if (response.success && response.data) {
        reviews.value = response.data
      }
    } catch {
      // Yorumlar kritik değil
    } finally {
      loadingReviews.value = false
    }
  }

  return {
    product,
    loading,
    error,
    relatedProducts,
    loadingRelated,
    fetchRelated,
    reviews,
    loadingReviews,
    fetchReviews,
  }
}
```

### 2.3 `composables/useCategories.ts`

```typescript
import type { Category } from '~/types/catalog'
import type { ApiResponse } from '~/types/api'

/** Mega menu kategorileri — singleton cache */
export function useCategories() {
  const { $api } = useApi()

  return useAsyncData<Category[]>(
    'mega-menu-categories',
    async () => {
      const response = await $api<ApiResponse<Category[]>>('categories/mega-menu')
      return response.success ? response.data : []
    },
    {
      lazy: true,
      server: false,
      default: () => [] as Category[],
    },
  )
}

/** Tüm kategoriler (tree yapısında) */
export function useCategoryTree() {
  const { $api } = useApi()

  return useAsyncData<Category[]>(
    'category-tree',
    async () => {
      const response = await $api<ApiResponse<Category[]>>('categories', {
        query: { all: true, includeChildren: true },
      })
      if (response.success && response.data) {
        // Sadece üst kategorileri döndür (children zaten include edilmiş)
        return response.data.filter((c) => !c.parentId)
      }
      return []
    },
    {
      default: () => [] as Category[],
    },
  )
}
```

### 2.4 `composables/useSearch.ts`

```typescript
import { useDebounceFn } from '@vueuse/core'
import type { Product } from '~/types/catalog'
import type { PaginatedResponse } from '~/types/api'

export function useSearch() {
  const { $api } = useApi()
  const router = useRouter()

  const query = ref('')
  const suggestions = ref<Product[]>([])
  const loading = ref(false)
  const showDropdown = ref(false)

  /** Debounced arama — 300ms */
  const fetchSuggestions = useDebounceFn(async () => {
    if (query.value.length < 2) {
      suggestions.value = []
      showDropdown.value = false
      return
    }

    loading.value = true
    try {
      const response = await $api<PaginatedResponse<Product>>('products', {
        query: { search: query.value, limit: 5 },
      })
      if (response.success && response.data) {
        suggestions.value = response.data
        showDropdown.value = true
      }
    } catch {
      suggestions.value = []
    } finally {
      loading.value = false
    }
  }, 300)

  /** Enter ile arama sayfasına git */
  function submitSearch() {
    if (query.value.length < 2) return
    showDropdown.value = false
    router.push({ path: '/search', query: { q: query.value } })
  }

  /** Dropdown kapat */
  function closeDropdown() {
    showDropdown.value = false
  }

  return {
    query,
    suggestions,
    loading,
    showDropdown,
    fetchSuggestions,
    submitSearch,
    closeDropdown,
  }
}
```

### 2.5 `composables/useFormat.ts`

```typescript
/** Formatlama yardımcıları */
export function useFormat() {
  /** TL fiyat formatı: ₺1.234,56 */
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price)
  }

  /** Tam sayı fiyat: 1.234 */
  function formatPriceShort(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  /** Tarih formatı: 5 Nisan 2026 */
  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr))
  }

  /** Kısa tarih: 05.04.2026 */
  function formatDateShort(dateStr: string): string {
    if (!dateStr) return ''
    return new Intl.DateTimeFormat('tr-TR').format(new Date(dateStr))
  }

  return { formatPrice, formatPriceShort, formatDate, formatDateShort }
}
```

### 2.6 `composables/useAppImage.ts`

```typescript
import type { Category } from '~/types/catalog'

/** Görsel URL çözümleme */
export function useAppImage() {
  const config = useRuntimeConfig()

  /**
   * Görsel URL'sini tam URL'ye çevir
   * - Tam URL (http/https) → olduğu gibi döner
   * - Göreceli yol → minioBase ile birleştir
   * - null/undefined → fallback placeholder
   */
  function resolveImageUrl(
    url: string | { url: string } | null | undefined,
    fallbackType: 'product' | 'avatar' | 'category' | 'banner' = 'product',
  ): string {
    const fallbacks: Record<string, string> = {
      product: 'https://placehold.co/600x600/f8fafc/64748b?text=Ürün',
      avatar: 'https://placehold.co/200x200/f1f5f9/94a3b8?text=Profil',
      category: 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Kategori',
      banner: 'https://placehold.co/1200x400/f1f5f9/64748b?text=Banner',
    }

    // Nesne ise .url'yi al
    const sourceUrl = url && typeof url === 'object' ? url.url : url

    if (!sourceUrl) return fallbacks[fallbackType]

    // Tam URL veya data URI ise olduğu gibi döndür
    if (
      sourceUrl.startsWith('http://') ||
      sourceUrl.startsWith('https://') ||
      sourceUrl.startsWith('data:') ||
      sourceUrl.startsWith('/images/')
    ) {
      return sourceUrl
    }

    // MinIO base ile birleştir
    const base = (config.public.minioBase as string || '').replace(/\/+$/, '')
    const path = sourceUrl.startsWith('/') ? sourceUrl : `/${sourceUrl}`
    return `${base}${path}`
  }

  /** Kategori görseli */
  function getCategoryImage(category: Category | null | undefined): string {
    if (!category) return resolveImageUrl(null, 'category')
    if (category.image) return resolveImageUrl(category.image, 'category')
    return resolveImageUrl(null, 'category')
  }

  return { resolveImageUrl, getCategoryImage }
}
```

### 2.7 `composables/useAppSeo.ts`

```typescript
/** Dinamik SEO meta tag'leri */
export function useAppSeo(options: {
  title?: string
  description?: string
  image?: string
  type?: string
  noindex?: boolean
} = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const siteName = config.public.appName || 'BarterBorsa'
  const baseUrl = 'https://barterborsa.com'

  const title = options.title ? `${options.title} | ${siteName}` : siteName
  const description = options.description || (config.public.appDescription as string)
  const currentUrl = `${baseUrl}${route.path}`
  const image = options.image || `${baseUrl}/og-image.png`

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogImage: image,
    ogUrl: currentUrl,
    ogType: options.type || 'website',
    ogSiteName: siteName,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots: options.noindex ? 'noindex, nofollow' : 'index, follow',
  })

  useHead({
    link: [{ rel: 'canonical', href: currentUrl }],
  })

  return { title, description, currentUrl, image }
}
```

---

## 3. COMPONENT'LER

### 3.1 `components/product/ProductCard.vue`

Ürün kartı — ürün listesi ve anasayfada kullanılır.

```
Props:
- product: Product (required)
- badges: DynamicBadges (optional)
- showVendor: boolean (default: true)
- showFavorite: boolean (default: true)

Emits:
- click: () => void
- addToCart: (product: Product) => void

Yapı:
- Kart: rounded-2xl, border, hover shadow + translate-y efekti
- Görsel: aspect-square, object-cover, lazy load
- Badge'ler: absolute positioned (topLeft, topRight, vb.)
- İsim: 2 satır clamp
- Fiyat: compareAtPrice varsa üstü çizili eski fiyat + yeni fiyat
- Vendor: mini logo + isim (showVendor ise)
- Rating: yıldız + ortalama + yorum sayısı
- Favori: kalp ikonu (sağ üst, showFavorite ise)
- Sepete ekle: buton (hover'da görünür veya her zaman)

NOT: Favori toggle → auth kontrolü → `wishlistStore.toggleWishlist(product.id)` çağrılacak.
Bölüm 1'de wishlist store yazılmadı, bu bölümde placeholder olarak bir `useFavorites` composable yaz:
- toggleFavorite(productId: string): API call + toast
- isFavorite(productId: string): boolean check
Gerçek implementasyon Bölüm 3'te.
```

### 3.2 `components/product/ProductGrid.vue`

```
Props:
- products: Product[] (required)
- loading: boolean (default: false)
- columns: 2 | 3 | 4 (default: 4) — responsive override var, bu sadece max

Yapı:
- Loading: skeleton grid (ProductCardSkeleton × columns adet)
- Empty: UiEmptyState kullan
- Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-{columns}
- Her ProductCard'a click ve addToCart emit bağla
```

### 3.3 `components/product/ProductCardSkeleton.vue`

```
Skeleton loading kartı — ProductCard ile aynı boyutlarda.
Pulse animasyonu ile gri bloklar.
```

### 3.4 `components/product/ProductFilters.vue`

Sidebar filtreler. Mobile'da slide-over panel olarak açılır.

```
Props:
- categories: Category[] — kategori listesi
- brands: Brand[] — marka listesi
- currentFilters: ProductFilters — aktif filtreler
- availableSpecs: Record<string, string[]> — filtrelenebilir özellikler (opsiyonel)

Emits:
- update:filters: (filters: ProductFilters) => void
- clear: () => void

Bölümler:
1. Kategori: hiyerarşik checkbox tree veya flat liste
2. Fiyat aralığı: min/max input
3. Marka: checkbox listesi (arama + scroll)
4. Rating: yıldız bazlı filtre (4+, 3+, 2+, 1+)
5. Diğer: Ücretsiz kargo, Öne çıkan, Flaş ürün toggle'ları

Mobile: UiButton ile açılan slide panel + filtrele/temizle butonları
```

### 3.5 `components/product/ProductSort.vue`

```
Props:
- modelValue: string (current sort value)

Emits:
- update:modelValue: (value: string) => void

Seçenekler:
- '' (Önerilen)
- 'priceAsc' (Fiyat: Düşükten Yükseğe)
- 'priceDesc' (Fiyat: Yüksekten Düşüğe)
- 'newest' (En Yeni)
- 'popular' (En Popüler)
- 'rating' (En Yüksek Puan)

UiSelect veya custom dropdown kullan.
```

### 3.6 `components/product/ProductGallery.vue`

Ürün detay sayfası galeri bileşeni.

```
Props:
- images: string[] — tam URL listesi
- productName: string — alt text için

Yapı:
- Ana görsel: büyük, aspect-square veya aspect-4/3
- Thumbnail şeridi: altta veya yanda, tıklanabilir
- Aktif thumbnail vurgusu (border)
- Ana görsele tıklayınca zoom modal (opsiyonel, basit tutulabilir)
```

### 3.7 `components/product/ProductInfo.vue`

Ürün detay sayfası ana bilgi bileşeni.

```
Props:
- product: Product
- selectedVariant: ProductVariant | null

Yapı:
- Breadcrumb: Anasayfa > Kategori > Alt Kategori > Ürün adı
- Ürün adı (h1)
- Rating: yıldızlar + ortalama + yorum sayısı
- Fiyat: büyük, compareAtPrice varsa indirim yüzdesi
- Stok durumu: "Stokta" / "Tükeniyor" / "Stokta Yok"
- Vendor: mini kart (logo + isim + "Mağazaya Git" link)
- Kısa açıklama
```

### 3.8 `components/product/ProductVariants.vue`

```
Props:
- variants: ProductVariant[]
- modelValue: Record<string, string> — seçili varyant options

Emits:
- update:modelValue: (options: Record<string, string>) => void

Varyantları attribute key'lerine göre grupla (ör: Renk, Beden).
Her grup için seçim butonları render et.
Seçim değişince emit.
```

### 3.9 `components/product/ProductReviews.vue`

```
Props:
- reviews: Review[]
- averageRating: number
- totalCount: number
- loading: boolean

Yapı:
- Ortalama puan kartı (büyük yıldız + sayı)
- Puan dağılımı (5 bar, her yıldız seviyesi için yüzde)
- Yorum listesi: avatar + isim + tarih + puan + yorum metni
- "Daha fazla göster" butonu (pagination)
```

### 3.10 `components/product/ProductBreadcrumb.vue`

```
Props:
- category: Category | null
- productName: string

Yapı: Anasayfa > Kategori > (Varsa Alt Kategori) > Ürün Adı
Son eleman bold, diğerleri link.
```

---

### 3.11 Home Component'ler — `components/home/`

#### `HomeBanner.vue`
```
API: GET /banners?ecosystem=BAZARX
Yapı: Carousel slider. Her banner: görsel + başlık + subtitle + link butonu.
Otomatik geçiş (5sn), manuel ok butonları.
İndikatör noktaları.
```

#### `HomeQuadCards.vue`
```
API: GET /quad-cards?ecosystem=BAZARX
Yapı: 4'lü grid. Her kart: görsel + başlık + alt ürünler.
```

#### `HomeFeaturedProducts.vue`
```
API: GET /products?isFeatured=true&limit=8
Yapı: Başlık + ProductGrid veya horizontal scroll carousel.
```

#### `HomeCampaigns.vue`
```
API: GET /campaigns?status=ACTIVE
Yapı: Kampanya kartları — görsel + isim + indirim yüzdesi + bitiş tarihi countdown.
```

#### `HomeCategories.vue`
```
API: useCategories() composable'dan
Yapı: Popüler kategori kartları — ikon + isim. Tıklayınca /products?categorySlug=X
```

---

### 3.12 Category Component'ler

#### `components/category/CategoryTree.vue`
```
Props:
- categories: Category[] (ana kategoriler, children nested)
- selectedSlug: string | null

Emits:
- select: (slug: string) => void

Yapı:
- Desktop: Sidebar tree, tıklanınca alt kategoriler expandable
- Mobile: Sol panel + sağ panel (Trendyol stili — mevcut categories.vue'daki gibi)
```

#### `components/category/CategoryCard.vue`
```
Props:
- category: Category

Yapı: Kart — ikon/görsel + isim + ürün sayısı. NuxtLink ile /products?categorySlug=X
```

---

### 3.13 Search Component'ler

#### `components/search/SearchBar.vue` 

AppHeader içine entegre edilecek. Bölüm 1'de AppHeader placeholder olarak yazıldı — şimdi SearchBar'ı yaz ve AppHeader'a bağla.

```
Yapı:
- Input: search icon + input + shortcut badge (⌘K)
- Dropdown: öneriler (ürün kart mini), "X sonuç bulundu" 
- Enter → /search?q=...
- useSearch composable kullanır
- Desktop: default layout header'da gösterilir
- Mobile: tıklayınca tam ekran arama modal açılır
```

---

## 4. SAYFALAR

### 4.1 `pages/index.vue` — Anasayfa

```vue
<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Banner, featured products, campaigns, categories paralel fetch
const { $api } = useApi()

const { data: banners } = useAsyncData('home-banners', async () => {
  const res = await $api<ApiResponse<Banner[]>>('banners', { query: { ecosystem: 'BAZARX' } })
  return res.success ? res.data : []
}, { default: () => [] })

const { data: featuredProducts } = useAsyncData('home-featured', async () => {
  const res = await $api<PaginatedResponse<Product>>('products', { query: { isFeatured: true, limit: 8 } })
  return res.success ? res.data : []
}, { default: () => [] })

const { data: campaigns } = useAsyncData('home-campaigns', async () => {
  const res = await $api<ApiResponse<Campaign[]>>('campaigns', { query: { status: 'ACTIVE' } })
  return res.success ? res.data : []
}, { default: () => [] })

const { data: categories } = useCategoryTree()

useAppSeo({
  title: 'Anasayfa',
  description: 'BarterBorsa — Ticari sektörde fazla malzeme ve stokların takası için modern platform',
})
</script>

<template>
  <div class="space-y-12">
    <HomeBanner :banners="banners || []" />
    <HomeCategories :categories="categories || []" />
    <HomeFeaturedProducts :products="featuredProducts || []" />
    <HomeCampaigns :campaigns="campaigns || []" />
  </div>
</template>
```

**NOT:** Mevcut anasayfadaki QuadCards, GroupBuy, FlashSales, BarterPool, Auctions, Lotteries, Vendors, Restaurants, Brands, Newsletter gibi bölümler bu aşamada **eklenmeyecek**. Bunlar ilgili bölümlerde (Bölüm 6, 7, vb.) eklenecek. Şimdilik temiz 4 bölüm yeterli.

### 4.2 `pages/products/index.vue` — Ürün Listesi

```
Yapı:
- Breadcrumb (opsiyonel — kategori varsa)
- Sol sidebar: ProductFilters
- Sağ: ProductSort + ProductGrid + Pagination
- URL query driven: filtre değişince URL güncellenir, sayfa yüklendiğinde query'den filtreler okunur
- watch(route.query) → fetchProducts

Seç/Detay composable: useProducts()

Mobile: Filtreler butona tıklayınca slide-over açılır.
```

### 4.3 `pages/products/[slug].vue` — Ürün Detay

```
Yapı:
- useProduct(slug) ile SSR fetch
- Sol: ProductGallery (sticky)
- Sağ: ProductBreadcrumb + ProductInfo + ProductVariants + Sepete Ekle/Hemen Al butonları + Vendor kartı
- Alt: Tab bölümü (Açıklama, Özellikler, Yorumlar)
- Alt: İlgili ürünler (ProductGrid)

Sepete ekle butonu şimdilik placeholder → toast göster. Gerçek implementasyon Bölüm 5'te.

SEO: useAppSeo ile dinamik title/description/og:image
```

### 4.4 `pages/categories/index.vue` — Tüm Kategoriler

```
Yapı:
- Desktop: grid görünüm — CategoryCard'lar
- Mobile: Trendyol stili sol panel + sağ panel (mevcut koddan esinlen)
- useCategoryTree() ile veri çek

Tıklayınca: /products?categorySlug=xxx
```

### 4.5 `pages/categories/[slug].vue` — Kategori Detay

```
Bu sayfa aslında products/index.vue'nun categorySlug filtreli hali.
Ya doğrudan /products?categorySlug=X'e redirect et,
ya da kendi içinde ProductGrid + ProductFilters render et.

Önerilen: redirect → navigateTo(`/products?categorySlug=${slug}`)
```

### 4.6 `pages/search.vue` — Arama Sonuçları

```
Yapı:
- route.query.q'dan arama terimi al
- useProducts() ile search filtresiyle çek
- ProductGrid + ProductFilters + ProductSort göster
- Sonuç yoksa UiEmptyState

Aslında products/index.vue ile çok benzer — tekrar yazmak yerine ProductGrid + ProductFilters'ı component olarak paylaş.
```

### 4.7 `pages/brands/[slug].vue` — Marka Detay (basit)

```
- GET /brands/:slug ile marka bilgisi
- O markanın ürünleri: /products?brandSlug=xxx
- Başlık + logo + açıklama + ürün grid
```

### 4.8 `pages/vendors/[slug].vue` — Vendor Vitrin (basit)

```
- GET /vendors/:slug ile vendor bilgisi
- Vendor banner + bilgiler
- "Bu mağazanın ürünleri" → ürün grid
```

---

## 5. APPHEADER + MEGAMENU GÜNCELLEME

Bölüm 1'de AppHeader ve AppMegaMenu placeholder olarak yazıldı. Şimdi:

### `components/app/AppHeader.vue` güncelleme:
- SearchBar component'ini entegre et
- Sepet ikonu badge'ini cart store'dan çek (placeholder: 0)

### `components/app/AppMegaMenu.vue` güncelleme:
- useCategories() ile kategori verisi çek
- Desktop: hover'da alt kategoriler mega menu dropdown olarak gösterilsin
- Her kategori tıklanınca /products?categorySlug=X

---

## 6. i18n GÜNCELLEME — `locales/tr.json`

Mevcut tr.json'a şu key'leri ekle:

```json
{
  "products": {
    "title": "Ürünler",
    "allProducts": "Tüm Ürünler",
    "countProducts": "{count} ürün bulundu",
    "noProductFound": "Ürün bulunamadı",
    "noProductFoundDesc": "Filtrelerinizi değiştirmeyi deneyin",
    "clearFilters": "Filtreleri Temizle",
    "sortOptions": {
      "recommended": "Önerilen",
      "priceAsc": "Fiyat: Düşükten Yükseğe",
      "priceDesc": "Fiyat: Yüksekten Düşüğe",
      "newest": "En Yeni",
      "popular": "En Popüler",
      "rating": "En Yüksek Puan"
    },
    "filters": {
      "title": "Filtreler",
      "categories": "Kategoriler",
      "brands": "Markalar",
      "priceRange": "Fiyat Aralığı",
      "minPrice": "Min",
      "maxPrice": "Max",
      "rating": "Puan",
      "freeShipping": "Ücretsiz Kargo",
      "featured": "Öne Çıkan",
      "flashSale": "Flaş Ürün",
      "apply": "Uygula",
      "clear": "Temizle"
    },
    "detail": {
      "addToCart": "Sepete Ekle",
      "buyNow": "Hemen Al",
      "inStock": "Stokta",
      "lowStock": "Son birkaç ürün",
      "outOfStock": "Tükendi",
      "description": "Açıklama",
      "specifications": "Özellikler",
      "reviews": "Değerlendirmeler",
      "relatedProducts": "İlgili Ürünler",
      "share": "Paylaş",
      "favorite": "Favorilere Ekle",
      "vendor": "Satıcı",
      "visitStore": "Mağazaya Git",
      "freeShipping": "Ücretsiz Kargo",
      "fastDelivery": "Hızlı Teslimat",
      "originalProduct": "Orijinal Ürün",
      "easyReturn": "Kolay İade"
    }
  },
  "categories": {
    "title": "Kategoriler",
    "allCategories": "Tüm Kategoriler",
    "viewAll": "Tümünü Gör",
    "productsInCategory": "{count} ürün"
  },
  "search": {
    "placeholder": "Ürün, marka veya kategori ara...",
    "results": "Arama Sonuçları",
    "noResults": "Sonuç bulunamadı",
    "noResultsDesc": "Farklı bir arama terimi deneyin"
  },
  "home": {
    "featuredProducts": "Öne Çıkan Ürünler",
    "campaigns": "Aktif Kampanyalar",
    "popularCategories": "Popüler Kategoriler",
    "viewAll": "Tümünü Gör",
    "campaignEnds": "Kampanya bitiyor"
  }
}
```

---

## 7. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/` → Anasayfa: banner, kategoriler, öne çıkan ürünler, kampanyalar render
4. `/products` → Ürün listesi: grid, filtreler, sıralama, pagination çalışıyor
5. `/products?categorySlug=xxx` → Kategoriye göre filtrelenmiş liste
6. `/products/xxx-slug` → Ürün detay: galeri, bilgi, yorumlar, ilgili ürünler
7. `/categories` → Kategori sayfası: desktop grid + mobile tree görünüm
8. `/search?q=xxx` → Arama sonuçları
9. Header'daki SearchBar: yazınca öneriler, enter'a basınca /search'e git
10. MegaMenu: kategoriler hover'da görünür
11. SSR: sayfa kaynağında ürün verileri HTML olarak mevcut (view-source ile kontrol)
12. SEO: her sayfada doğru title, description, og:image meta tag'leri
13. Mobile responsive: tüm sayfalar 375px'ten itibaren düzgün
14. Skeleton loading: ürünler yüklenirken kartlar skeleton olarak görünür

---

## 8. DOSYA YAPISI ÖZETİ (Bölüm 2 eklentileri)

```
types/
└── catalog.ts                         # Product, Category, Brand, Review, Banner, vb.

composables/
├── useProducts.ts                     # Ürün listesi + filtreleme
├── useProduct.ts                      # Tekil ürün detay (SSR)
├── useCategories.ts                   # Mega menu + category tree
├── useSearch.ts                       # Debounced arama + öneriler
├── useFormat.ts                       # Fiyat, tarih formatlama
├── useAppImage.ts                     # Görsel URL çözümleme
├── useAppSeo.ts                       # Dinamik SEO
└── useFavorites.ts                    # Favori toggle (placeholder, Bölüm 3'te tam)

components/
├── product/
│   ├── ProductCard.vue
│   ├── ProductCardSkeleton.vue
│   ├── ProductGrid.vue
│   ├── ProductFilters.vue
│   ├── ProductSort.vue
│   ├── ProductGallery.vue
│   ├── ProductInfo.vue
│   ├── ProductVariants.vue
│   ├── ProductReviews.vue
│   └── ProductBreadcrumb.vue
├── home/
│   ├── HomeBanner.vue
│   ├── HomeQuadCards.vue              # (opsiyonel, varsa)
│   ├── HomeFeaturedProducts.vue
│   ├── HomeCampaigns.vue
│   └── HomeCategories.vue
├── category/
│   ├── CategoryTree.vue
│   └── CategoryCard.vue
├── search/
│   └── SearchBar.vue
└── app/
    ├── AppHeader.vue                  # GÜNCELLENDİ — SearchBar entegrasyonu
    └── AppMegaMenu.vue                # GÜNCELLENDİ — gerçek kategori verisi

pages/
├── index.vue                          # Anasayfa (güncellendi)
├── products/
│   ├── index.vue                      # Ürün listesi
│   └── [slug].vue                     # Ürün detay
├── categories/
│   ├── index.vue                      # Tüm kategoriler
│   └── [slug].vue                     # Kategori → redirect
├── search.vue                         # Arama sonuçları
├── brands/
│   └── [slug].vue                     # Marka detay
└── vendors/
    └── [slug].vue                     # Vendor vitrin

locales/
└── tr.json                            # GÜNCELLENDİ — yeni key'ler eklendi
```

> **Not:** Her dosyayı tam implementasyonla yaz — template, script, style dahil. Placeholder "TODO" bırakma. Tüm component'ler tam çalışır durumda olacak. ProductCard, ProductGallery gibi görsel-yoğun component'lerin tasarımını güzel yap — hover efektleri, geçişler, responsive breakpoint'ler.
