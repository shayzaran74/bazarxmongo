FAZ 9 — Gemini Prompt
markdown# GÖREV: Admin Paneli — Backend Entegrasyonu

## Backend Admin Endpoint'leri
GET  /api/v1/users                             → User[] (ADMIN only)
GET  /api/v1/users/:id                         → UserDetail (ADMIN only)
GET  /api/v1/admin/analytics/stats             → AdminStats
GET  /api/v1/admin/analytics/vendor-stats      → VendorStats
GET  /api/v1/vendors                           → Vendor[] (paginated)
POST /api/v1/vendors/:id/approve               → (yoksa stub)
POST /api/v1/vendors/:id/reject                → (yoksa stub)
GET  /api/v1/catalog/products                  → tüm ürünler
GET  /api/v1/admin/content                     → content yönetim
GET  /api/v1/admin/loyalty                     → loyalty admin
POST /api/v1/missions                          → mission create (ADMIN)
GET  /api/v1/xp/spending-rules                 → xp kuralları
POST /api/v1/xp/grant-xp                       → manuel xp
GET  /api/v1/media                             → media list
POST /api/v1/media/upload                      → file upload

## YAPILACAKLAR

### 1. pages/admin/index.vue — Dashboard
- `useAdminDashboard` composable
- `GET /api/admin/analytics/stats` → stub server route gerekirse

### 2. pages/admin/users.vue
- `AdminVendorService.getUsers()` veya direkt `GET /api/users`
- Tablo bileşeni `AdminVendorTable` veya `AdminProductTable`

### 3. pages/admin/products/index.vue + pending.vue
- `AdminProductService.getProducts()`
- Bulk action'lar: approve, reject, delete

### 4. pages/admin/vendors.vue
- `AdminVendorService.getVendors()`
- Approve/Reject modal'ı

### 5. Eksik admin endpoint'ler için stub server routes
`apps/frontend/server/api/admin/` altında:
- `analytics/stats.get.ts` → boş ama valid response
- `vendors/[id]/approve.post.ts` → stub (gerçek backend henüz yok)

### 6. Super-admin guard
Admin sayfaları: `definePageMeta({ middleware: ['auth', 'admin'] })`
Super-admin sayfaları: `definePageMeta({ middleware: ['auth', 'super-admin'] })`

## Kısıtlamalar
- Admin guard tüm `/admin/**` sayfalarda aktif
- `pnpm typecheck` 0 hata