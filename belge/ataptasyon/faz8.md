 FAZ 8 — Gemini Prompt
markdown# GÖREV: Vendor Paneli — Backend Entegrasyonu

## Backend Vendor Endpoint'leri
GET  /api/v1/vendors/me              → VendorProfile (yoksa stub)
GET  /api/v1/vendors/:id             → VendorDetail
POST /api/v1/vendors/apply           → vendor başvuru
GET  /api/v1/listings                → listings (vendor scope)
POST /api/v1/listings                → create listing (VENDOR role required)
GET  /api/v1/vendor/analytics/dashboard → vendor analytics
GET  /api/v1/companies/me            → company info
POST /api/v1/companies               → create company
GET  /api/v1/ads                     → vendor ads
POST /api/v1/ads                     → create ad campaign


## YAPILACAKLAR

### 1. pages/vendor/dashboard.vue
- `useVendorDashboard` composable çalışıyor mu?
- `VendorService.getDashboard()` → `/api/vendors/me` GET
- Vendor guard: `definePageMeta({ middleware: 'vendor' })`

### 2. pages/vendor/products.vue + product-form.vue
- `AdminProductService` veya `VendorService` ürün listeleme
- `ProductForm` bileşeni (`~/components/forms/ProductForm.vue`)
- Media upload: `POST /api/upload` → BFF → `/api/v1/media/upload`

### 3. pages/vendor/orders.vue
- `VendorOrderService.getOrders()` → `/api/vendors/orders` GET
- Backend'de bu endpoint yok → stub server route oluştur:
  `apps/frontend/server/api/vendors/orders.get.ts` → `{ success: true, data: [] }`

### 4. pages/vendor/analytics.vue
- `useAnalytics` composable
- `GET /api/vendor/analytics/dashboard`

### 5. pages/become-vendor.vue + vendor-application.vue
- `VendorService.apply()` → `/api/vendors/apply` POST
- Form validasyonu

## Kısıtlamalar
- Vendor guard her vendor sayfasında `definePageMeta({ middleware: 'vendor' })`
- `pnpm typecheck` 0 hata