FAZ 6 — Public Sayfalar (Home, Products, Catalog)

Hedef: Ana sayfa, ürün listeleme, ürün detay sayfalarının backend ile çalışması.

markdown# GÖREV: Public Sayfalar — Backend Catalog Entegrasyonu

## Backend Catalog Endpoint'leri (gerçek)
GET /api/v1/catalog/products                → PaginatedListingsDto
GET /api/v1/catalog/products/slug/:slug     → ProductDetailsDto
GET /api/v1/catalog/products/:id            → ProductDetailsDto
GET /api/v1/categories                      → Category[]
GET /api/v1/categories/tree                 → CategoryTree
GET /api/v1/vendors                         → Vendor[] (paginated)
GET /api/v1/catalog/brands (kısmi)          → mevcut olabilir


## YAPILACAKLAR

### 1. services/api/ProductService.ts — Path fix
Mevcut `getProducts()` `/api/products` çağırıyor.
BFF rewrite ile `→ /api/v1/catalog/products` gidiyor. ✓

`getProductBySlug(slug)` → `/api/products/:slug` → BFF → `/api/v1/catalog/products/slug/:slug` ✓

Kontrol: backend `PaginatedListingsDto` ne dönüyor?
```typescript
interface PaginatedListingsDto {
  items: ListingResponseDto[]
  total: number
  page: number
  limit: number
}
```
Frontend `ApiResponse<Product[]>` bekliyor. Bu mismatch için:
`ProductService.getProducts()` içinde response'u normalize et:
```typescript
const raw = await $api<PaginatedListingsDto>('/api/products', { query: params })
return {
  success: true,
  data: raw.items || [],
  meta: { total: raw.total, page: raw.page, limit: raw.limit }
}
```

### 2. pages/index.vue — Home page audit
Ana sayfa bileşenlerinin import'larını kontrol et:
- `HomeBanner`, `HomeQuadCards`, `HomeCategoryHighlights`
- `HomeAuctions`, `HomeBarterPool`, `HomeVendors`
- `HomeFlashSales`, `HomeNewsletter`
Her biri `~/components/home/` altında var mı?

### 3. pages/products/index.vue — Listing page
- `useProductService().getProducts(filters)` çağrısı
- Filtre state'i URL query'e sync ediliyor mu? (`useRoute`, `useRouter`)
- Sayfalama bileşeni var mı?

### 4. pages/products/[...slug].vue — Detail page
- `getProductBySlug(slug)` çağrısı
- `ProductGallery`, `ProductMainInfo`, `ProductSidebar` bileşenleri
- Barter / Sepete ekle butonları `authStore.isLoggedIn` kontrolü

### 5. CategoryService + BrandService — Path normalizasyonu
`categories` → `/api/v1/categories` ✓ direkt
`brands` → `/api/v1/catalog/brands` → server middleware rewrite gerekiyor (FAZ 1'de yapıldı)

## Kısıtlamalar
- SSR uyumlu: `useFetch` veya `useAsyncData` kullan, `onMounted` içinde `fetch` değil
- `any` yasak
- `pnpm typecheck` 0 hata