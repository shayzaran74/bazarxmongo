# BarterBorsa — Frontend × Backend Entegrasyon Implementation Planı

> **Kural:** Backend kodu **değiştirilmez.** Yalnızca frontend `belge/` kodları `apps/frontend`'e taşınır;
> bozuk API path'leri proxy katmanında düzeltilir.  
> Her faz ayrı bir **Gemini 2.0 Flash prompt** olarak sunulur.

---

## Sistematik Durum Tespiti

### Backend Gerçek URL Yapısı
```
Global prefix → /api/v1
Backend port  → 3001

Gerçek endpoint örnekleri:
POST  http://localhost:3001/api/v1/auth/login
POST  http://localhost:3001/api/v1/auth/register
GET   http://localhost:3001/api/v1/users/me
GET   http://localhost:3001/api/v1/identity/profile
GET   http://localhost:3001/api/v1/identity/addresses
GET   http://localhost:3001/api/v1/catalog/products
GET   http://localhost:3001/api/v1/wallet
POST  http://localhost:3001/api/v1/cart/add
```

### Frontend Servis Beklentisi (mevcut)
```
Frontend servisler /api/... kullanıyor:
POST  /api/auth/login          → /api/v1/auth/login    ✓ (devProxy ile fix edilir)
GET   /api/auth/me             → /api/v1/users/me      ⚠ PATH FARK
GET   /api/user/profile        → /api/v1/identity/profile ⚠ PATH FARK
GET   /api/addresses           → /api/v1/identity/addresses ⚠ PATH FARK
GET   /api/products            → /api/v1/catalog/products ⚠ PATH FARK
GET   /api/cart                → /api/v1/cart          ✓
GET   /api/wallet              → /api/v1/wallet        ✓
GET   /api/auth/csrf           → BACKEND'DE YOK ⛔ (BFF'de mock edilecek)
```

### Kritik Gap'ler (Backend'e dokunmadan çözüm)
| Frontend istiyor | Backend gerçek path | Çözüm |
|---|---|---|
| `/api/auth/me` | `/api/v1/users/me` | BFF rewrite rule |
| `/api/auth/csrf` | Yok | Nitro server route ile mock |
| `/api/user/profile` | `/api/v1/identity/profile` | BFF rewrite rule |
| `/api/user/change-password` | `/api/v1/identity/profile/change-password` | BFF rewrite rule |
| `/api/addresses` | `/api/v1/identity/addresses` | BFF rewrite rule |
| `/api/products` | `/api/v1/catalog/products` | BFF rewrite rule |
| `/api/products/:slug` | `/api/v1/catalog/products/slug/:slug` | BFF rewrite rule |
| `/api/vendors` | `/api/v1/vendors` | ✓ direkt |
| `/api/brands` | `/api/v1/catalog/brands` | BFF rewrite rule |
| `/api/settings` | Yok | Nitro server route ile static mock |
| `/api/tiers/*` | `/api/v1/xp/*` (kısmen) | BFF + mock |
| `/api/upload` | `/api/v1/media/upload` | BFF rewrite rule |

---

## Faz Haritası

```
FAZ 1 (BACKEND TARAF) ─── Nitro BFF + API Bridge (Path Rewrite + Mock Endpoints)
FAZ 2 (FRONTEND)      ─── nuxt.config + bağımlılıklar + temel altyapı
FAZ 3 (FRONTEND)      ─── Core stores (auth, cart, wishlist) + composables
FAZ 4 (FRONTEND)      ─── Layout sistemi (default, admin, vendor, auth)
FAZ 5 (FRONTEND)      ─── Auth akışı (Login, Register, Google OAuth, Forgot/Reset)
FAZ 6 (FRONTEND)      ─── Public sayfalar (Home, Products, Product Detail, Categories)
FAZ 7 (FRONTEND)      ─── Kullanıcı paneli (Profile, Wallet, Orders, Addresses)
FAZ 8 (FRONTEND)      ─── Vendor paneli (Dashboard, Products, Orders, Analytics)
FAZ 9 (FRONTEND)      ─── Admin paneli (Dashboard, Users, Products, Vendors)
FAZ 10 (FRONTEND)     ─── Barter/Auction/Lotteri + Chat + Bildirim sistemi
FAZ 11 (FRONTEND)     ─── Final polish (i18n, PWA, SEO, TypeCheck temizlik)
```

---

## FAZ 1 — Backend Taraf: Nitro BFF + API Bridge

> **Hedef:** Frontend servislerin `/api/...` isteklerini backend `/api/v1/...` endpointlerine
> yönlendirmek; backend'de olmayan ama frontend'in beklediği endpointleri Nitro server route olarak mock etmek.
> **Backend'e tek satır dokunulmaz.**

---

### 📦 FAZ 1 — Gemini Prompt

```markdown
# GÖREV: Nuxt 3 Nitro BFF Katmanı — API Path Bridge + Mock Endpoints

Sen senior bir Nuxt 3 / TypeScript mühendisisin.

## Proje Yapısı
- Frontend: Nuxt 3.10.3 (apps/frontend)
- Backend: NestJS + Fastify, port 3001, global prefix `/api/v1`
- **Backend koduna dokunulmayacak**

## Hedef
`apps/frontend/` içinde aşağıdaki değişiklikleri yap.
TypeScript'te `any` kullanımı yasak, her dosyada strict tip zorunlu.
`pnpm typecheck` sıfır hatayla geçmeli.

---

## ADIM 1: nuxt.config.ts — devProxy Güncelleme

`apps/frontend/nuxt.config.ts` içindeki `nitro.devProxy` bloğunu aşağıdaki gibi değiştir:

```typescript
nitro: {
  devProxy: {
    '/api': {
      target: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, '/api/v1'),
    }
  },
  // ... diğer mevcut ayarlar korunur
}
```

Bu ayar `/api/auth/login` → `http://localhost:3001/api/v1/auth/login` şeklinde çalışır.

---

## ADIM 2: Path Rewrite Server Middleware

`apps/frontend/server/middleware/api-rewrite.ts` dosyasını oluştur:

```typescript
// Farklı path convention'ları arasında köprü kurar
// Örn: frontend /api/auth/me → backend /api/v1/users/me

export default defineEventHandler((event) => {
  const url = event.node.req.url || ''
  
  const rewrites: [RegExp, string][] = [
    // Identity rewrites
    [/^\/api\/auth\/me(\?.*)?$/, '/api/v1/users/me$1'],
    [/^\/api\/user\/profile(\?.*)?$/, '/api/v1/identity/profile$1'],
    [/^\/api\/user\/change-password/, '/api/v1/identity/profile/change-password'],
    [/^\/api\/user\/location/, '/api/v1/users/location'],
    [/^\/api\/user\/stats/, '/api/v1/users/stats'],
    [/^\/api\/addresses/, '/api/v1/identity/addresses'],
    // Catalog rewrites
    [/^\/api\/products\/bulk/, '/api/v1/catalog/products/bulk'],
    [/^\/api\/products\/([^/]+)\/reviews/, '/api/v1/catalog/products/$1/reviews'],
    [/^\/api\/products\/([^/]+)/, '/api/v1/catalog/products/slug/$1'],
    [/^\/api\/products(\?.*)?$/, '/api/v1/catalog/products$1'],
    [/^\/api\/brands/, '/api/v1/catalog/brands'],
    [/^\/api\/categories/, '/api/v1/categories'],
    // Upload rewrite
    [/^\/api\/upload/, '/api/v1/media/upload'],
    // Loyalty rewrites
    [/^\/api\/tiers\/me/, '/api/v1/xp/me'],
    [/^\/api\/tiers\/progress/, '/api/v1/xp/history'],
    [/^\/api\/loyalty\/status/, '/api/v1/xp/me'],
    [/^\/api\/loyalty\/history/, '/api/v1/xp/history'],
  ]

  for (const [pattern, replacement] of rewrites) {
    if (pattern.test(url)) {
      event.node.req.url = url.replace(pattern, replacement)
      break
    }
  }
})
```

---

## ADIM 3: Mock Server Routes (Backend'de olmayan endpoint'ler)

### `apps/frontend/server/api/auth/csrf.get.ts`
```typescript
// CSRF token mock — backend stateless JWT kullandığı için CSRF gereksiz
// Frontend bunu beklediği için boş ama valid response dönüyoruz
export default defineEventHandler(() => {
  return { csrfToken: 'nuxt-bff-csrf-exempt' }
})
```

### `apps/frontend/server/api/settings.get.ts`
```typescript
// Global site ayarları — backend henüz bu endpoint'i sunmuyor
export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      siteName: 'BarterBorsa',
      maintenanceMode: false,
      features: {
        barter: true,
        auction: true,
        lottery: true,
        groupBuy: false,
      },
      paymentMethods: ['iyzico', 'bank_transfer', 'wallet'],
    }
  }
})
```

### `apps/frontend/server/api/tiers/me.get.ts`
```typescript
// Tier bilgisi — loyalty modülü üzerinden türetilir, şimdilik stub
export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      tier: 'STANDARD',
      level: 1,
      xp: 0,
      nextTierXP: 1000,
      benefits: [],
    }
  }
})
```

### `apps/frontend/server/api/tiers/vendor.get.ts`
```typescript
export default defineEventHandler(() => {
  return { success: true, data: { tier: 'STANDARD', commission: 0.12 } }
})
```

---

## ADIM 4: Production Proxy (nitro.routeRules)

`nuxt.config.ts` içine production için de rewrite ekle:

```typescript
routeRules: {
  // Mevcut security headers korunur
  // Production API proxy
  '/api/**': {
    proxy: {
      to: (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001') + '/api/v1/**',
    }
  },
  // Overrides: Mock endpoint'ler proxy'ye takılmasın
  '/api/auth/csrf': {},
  '/api/settings': {},
  '/api/tiers/me': {},
  '/api/tiers/vendor': {},
}
```

---

## Doğrulama
1. `pnpm typecheck` → 0 hata
2. `pnpm build` → başarılı
3. Dev server'da `curl http://localhost:3002/api/auth/csrf` → `{"csrfToken":"..."}` döner
4. `curl http://localhost:3002/api/settings` → `{"success":true,"data":{...}}` döner

## Kısıtlamalar
- `any` kullanma
- Backend dosyalarına dokunma
- Mevcut `nuxt.config.ts` ayarlarından (PWA, i18n, image domains, CSP) hiçbirini silme
```

---

## FAZ 2 — Frontend Altyapı: Bağımlılıklar + Config

> **Hedef:** `package.json` ve `nuxt.config.ts`'yi belge/frontend standartlarına taşı.
> Var olan UI bileşenlerini koru.

---

### 📦 FAZ 2 — Gemini Prompt

```markdown
# GÖREV: Frontend Altyapı Güncelleme — Bağımlılıklar + Konfigürasyon

## Mevcut Durum
apps/frontend zaten çalışır durumda. Nuxt 3.10.3, Tailwind, Pinia,
vue-toastification, socket.io-client, tiptap, apexcharts ve stripe yüklü.

## YAPILACAKLAR

### 1. package.json kontrolü
Şu paketlerin `dependencies` veya `devDependencies` içinde olduğunu doğrula,
eksikse ekle (mevcut versiyonları değiştirme):
- `vee-validate` ^4.11.8
- `@vee-validate/rules` ^4.11.8
- `@vee-validate/i18n` ^4.11.8
- `yup` ^1.3.3
- `vuedraggable` ^4.1.0
- `lodash-es` ^4.17.22
- `blurhash` ^2.0.5
- `uuid` ^13.0.0

### 2. nuxt.config.ts — tailwindcss content genişlet
`@nuxtjs/tailwindcss` modülü config'ine content path'i ekle:
```typescript
// nuxt.config.ts içinde modules tanımından sonra
tailwindcss: {
  exposeConfig: false,
  config: {
    content: [
      './components/**/*.{vue,js,ts}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './composables/**/*.{js,ts}',
      './stores/**/*.{js,ts}',
    ]
  }
}
```

### 3. nuxt.config.ts — build.transpile
Mevcut transpile listesine eksikleri ekle (duplicate olmadan):
```typescript
build: {
  transpile: [
    'vue-toastification',
    '@heroicons/vue',
    'socket.io-client',
    'apexcharts',
    'vue3-apexcharts',
  ]
}
```

### 4. tailwind.config.js güncelle
`apps/frontend/tailwind.config.js` dosyasına `primary` renk paleti ekle
(mevcut renkler korunur, sadece eksik `primary` grubu eklenir):
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50:  '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  }
}
```

### 5. plugins/veevalidate.client.ts oluştur
```typescript
import { defineRule, configure } from 'vee-validate'
import { required, email, min, max, confirmed } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import tr from '@vee-validate/i18n/dist/locale/tr.json'

export default defineNuxtPlugin(() => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('max', max)
  defineRule('confirmed', confirmed)

  configure({
    generateMessage: localize({ tr }),
  })
})
```

## Kısıtlamalar
- Mevcut plugin dosyalarını silme (stripe.client.ts, apexcharts.client.ts vb.)
- Mevcut composable'ları silme
- `pnpm typecheck` 0 hata
- `pnpm build` başarılı
```

---

## FAZ 3 — Core Stores + Composables

> **Hedef:** `stores/auth.ts`, `stores/cart.ts`, `stores/wishlist.ts` ve `composables/useApi.ts`'ı
> mevcut dosyalarla karşılaştırarak eksik logic'leri tamamla.

---

### 📦 FAZ 3 — Gemini Prompt

```markdown
# GÖREV: Core Stores + API Composable — Doğrulama ve Tamamlama

## Mevcut Durum
`apps/frontend/stores/auth.ts`, `stores/cart.ts`, `composables/useApi.ts` zaten var.
Bu dosyalar belge/frontend ile aynı yapıda. Fark: bazı getter/action'lar eksik.

## YAPILACAKLAR

### 1. stores/auth.ts — Kontrol listesi
Şu action'ların mevcut olduğunu doğrula, eksikse ekle:
- `init()` — token cookie'den okur, CSRF alır, `fetchUser` çağırır
- `login(credentials)` — `/api/auth/login` POST
- `register(userData)` — `/api/auth/register` POST
- `logout()` — `/api/auth/logout` POST + store temizleme
- `tryRefresh()` — Promise deduplication ile refresh token
- `fetchUser(silent, service?)` — `/api/auth/me` GET
- `forgotPassword(email)` — `/api/auth/forgot-password` POST
- `resetPassword(data)` — `/api/auth/reset-password` POST
- `updateLocation(locationData)` — `/api/user/location` PUT

Getter'ların kontrolü (hepsi state'ten türetilen computed):
- `isLoggedIn`, `isAdmin`, `isSuperAdmin`, `isVendor`, `isPremium`
- `fullName`, `avatarUrl`, `currentXP`, `currentLevel`
- `balance`, `barterBalance`, `vendorStatus`

### 2. stores/cart.ts — Eksik action'lar
Şu action'ların var olduğunu doğrula:
- `fetchCart()` — `/api/cart` GET
- `addItem(productId, quantity, variantId?)` — `/api/cart/add` POST
- `removeItem(itemId)` — `/api/cart/:itemId` DELETE
- `updateQuantity(itemId, qty)` — `/api/cart/:itemId` PUT
- `mergeCart()` — `/api/cart/merge` POST (localStorage guest cart ile)
- `clearCart()` — `/api/cart` DELETE

### 3. stores/wishlist.ts — Doğrula veya oluştur
```typescript
// Eğer yoksa oluştur
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

interface WishlistItem {
  id: string
  productId: string
  addedAt: string
}

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as WishlistItem[],
    loading: false,
  }),
  getters: {
    count: (state) => state.items.length,
    isInWishlist: (state) => (productId: string) =>
      state.items.some((i) => i.productId === productId),
  },
  actions: {
    async fetchWishlist() {
      const { $api } = useApi()
      this.loading = true
      try {
        const res = await $api<{ success: boolean; data: WishlistItem[] }>('/api/favorites')
        if (res.success) this.items = res.data
      } finally {
        this.loading = false
      }
    },
    async toggle(productId: string) {
      const { $api } = useApi()
      if (this.isInWishlist(productId)) {
        await $api(`/api/favorites/${productId}`, { method: 'DELETE' })
        this.items = this.items.filter((i) => i.productId !== productId)
      } else {
        const res = await $api<{ success: boolean; data: WishlistItem }>(
          '/api/favorites', { method: 'POST', body: { productId } }
        )
        if (res.success) this.items.push(res.data)
      }
    },
  },
})
```

### 4. composables/useApi.ts — Doğrulama
Mevcut `useApi.ts` zaten doğru yapıda. Sadece şunu kontrol et:
- `baseURL` config'den geliyor (hardcode yok)
- 401 → logout + redirect `/login`
- 419 → `tryRefresh()` sonra retry

## Kısıtlamalar
- Mevcut mantığı bozmadan, **sadece eksikleri ekle**
- `any` yasak, strict TypeScript
- `pnpm typecheck` 0 hata
```

---

## FAZ 4 — Layout Sistemi

> **Hedef:** `layouts/default.vue`, `layouts/auth.vue`, `layouts/vendor.vue`, `layouts/admin.vue`'yu
> belge/frontend'deki UI ile birebir uyumlu hale getir.

---

### 📦 FAZ 4 — Gemini Prompt

```markdown
# GÖREV: Layout Sistemi — Mevcut UI Korunarak Stabilizasyon

## Mevcut Durum
`apps/frontend/layouts/` dizininde 4 layout var: default, auth, vendor, admin.
Bu layoutlar belge/frontend'den geldiği için UI zaten hazır.
Sorun: bazı import'lar veya composable referansları kırık olabilir.

## YAPILACAKLAR

### 1. layouts/default.vue — Import audit
Şu bileşen ve composable import'larının resolve olduğunu kontrol et:
- `~/components/layout/MegaMenu.vue`
- `~/components/layout/CategoryPillBar.vue`
- `~/components/common/AnnouncementBar.vue`
- `~/stores/auth` → `useAuthStore`
- `~/stores/cart` → `useCartStore`
- `~/stores/wishlist` → `useWishlistStore`
- `~/composables/useSocket` → `useSocket`
- `~/composables/useHomeMenu` → `useHomeMenu`

Eksik olan her bileşen için minimal skeleton oluştur:
```vue
<!-- Örnek skeleton -->
<template><div><!-- placeholder --></div></template>
<script setup lang="ts">/* TODO */</script>
```

### 2. layouts/vendor.vue — Sidebar nav kontrol
- `~/stores/auth` bağlantısı çalışıyor mu?
- Vendor guard middleware (`~/middleware/vendor.ts`) tanımlı mı?

### 3. layouts/admin.vue — Role check
- Admin guard middleware (`~/middleware/admin.ts`) tanımlı mı?
- `isAdmin` getter'ı auth store'dan geliyor mu?

### 4. middleware/ — Guard'ların doğrulanması
`apps/frontend/middleware/` içindeki tüm guard'ları gözden geçir:
- `auth.ts` → `authStore.isLoggedIn` değilse `/login`'e redirect
- `vendor.ts` → `authStore.isVendor` değilse `/` veya `/become-vendor`'a redirect
- `admin.ts` → `authStore.isAdmin` değilse `/` redirect
- `super-admin.ts` → `authStore.isSuperAdmin` kontrolü
- `ecosystemGuard.ts` → path bazlı ecosystem routing

Her guard'da `navigateTo()` Nuxt composable'ı kullanılmalı.

## Kısıtlamalar
- Mevcut UI/tasarım hiç değiştirilmez
- Sadece kırık import'lar ve logic bug'ları düzeltilir
- `pnpm typecheck` 0 hata
```

---

## FAZ 5 — Auth Akışı (Login, Register, Google OAuth, Forgot/Reset)

> **Hedef:** Auth sayfalarının backend ile uçtan uca çalışması.

---

### 📦 FAZ 5 — Gemini Prompt

```markdown
# GÖREV: Auth Akışı — Backend Entegrasyon Tamamlama

## Backend Auth Endpoint'leri (gerçek)
```
POST /api/v1/auth/login        → { success, data: { user, accessToken, refreshToken } }
POST /api/v1/auth/register     → { success, data: { user, ... } }
POST /api/v1/auth/logout       → { success, message }
POST /api/v1/auth/refresh      → { success, data: { accessToken, refreshToken } }
POST /api/v1/auth/forgot-password → { success, message }
POST /api/v1/auth/reset-password  → { success, message }
GET  /api/v1/users/me          → (via BFF rewrite from /api/auth/me)
GET  /api/v1/auth/google       → Google OAuth başlatır
GET  /api/v1/auth/google/callback → callback, frontend'e redirect eder
```

## YAPILACAKLAR

### 1. pages/login.vue — Backend response uyumu
Backend login response'u şu yapıda:
```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "data": {
    "user": { "id": "...", "email": "...", ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

`stores/auth.ts` `login()` action'ı bu response'u doğru parse etmeli:
- `data.accessToken` → `this.token`
- `data.user` → `this.user`
- Token cookie'ye yaz (15 dk maxAge)

### 2. pages/register.vue — Validation + submit
Backend register DTO:
```typescript
{ email: string, password: string, firstName?: string, lastName?: string }
```
VeeValidate ile form validasyonu: email format, password min 8, confirmed password.

### 3. pages/auth/callback.vue — Google OAuth handler
Google callback URL: `GET /api/v1/auth/google/callback`
Backend bu URL'den `/auth/success?accessToken=...&refreshToken=...&userId=...` şeklinde redirect yapar.

`pages/auth/callback.vue` veya `app.vue` `onMounted`:
- URL query'den `accessToken` oku
- `authStore.token = accessToken`
- Token cookie'ye yaz
- `authStore.fetchUser()` çağır
- `/` redirect

**NOT:** Mevcut `app.vue` zaten `?token` parametresini handle ediyor.
Google OAuth controller `?accessToken` kullanıyor. Bu mismatch'i düzelt:
`app.vue`'da hem `route.query.token` hem `route.query.accessToken` kontrol et.

### 4. pages/forgot-password.vue + pages/reset-password.vue
- Form validasyonu var mı? Email field `required|email` kuralları
- Backend'e doğru endpoint çağırılıyor mu?
- Başarı/hata toast mesajları var mı?

### 5. services/api/AuthService.ts — Response mapping
`getMe()` şu an `/api/auth/me` çağırıyor → BFF `/api/v1/users/me`'ye rewrite eder.
Backend `users/me` response:
```json
{ "success": true, "data": { "id": "...", "email": "...", "profile": {...}, ... } }
```
`AuthApiResponse<UserDTO>` interface'i bu yapıya uygun mu? Kontrol et.

## Doğrulama
1. `curl -X POST http://localhost:3002/api/auth/login -d '{"email":"test@test.com","password":"Pass123!"}' -H "Content-Type: application/json"`
2. `curl http://localhost:3002/api/auth/csrf` → `{"csrfToken":"..."}` (mock)
3. Login sonrası `/profile` sayfasına gidilebiliyor mu?

## Kısıtlamalar
- `any` yasak
- Backend response shape değiştirilemez
- Mevcut UI değiştirilmez
```

---

## FAZ 6 — Public Sayfalar (Home, Products, Catalog)

> **Hedef:** Ana sayfa, ürün listeleme, ürün detay sayfalarının backend ile çalışması.

---

### 📦 FAZ 6 — Gemini Prompt

```markdown
# GÖREV: Public Sayfalar — Backend Catalog Entegrasyonu

## Backend Catalog Endpoint'leri (gerçek)
```
GET /api/v1/catalog/products                → PaginatedListingsDto
GET /api/v1/catalog/products/slug/:slug     → ProductDetailsDto
GET /api/v1/catalog/products/:id            → ProductDetailsDto
GET /api/v1/categories                      → Category[]
GET /api/v1/categories/tree                 → CategoryTree
GET /api/v1/vendors                         → Vendor[] (paginated)
GET /api/v1/catalog/brands (kısmi)          → mevcut olabilir
```

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
```

---

## FAZ 7 — Kullanıcı Paneli (Profile, Wallet, Orders, Addresses)

---

### 📦 FAZ 7 — Gemini Prompt

```markdown
# GÖREV: Kullanıcı Paneli — Backend Entegrasyonu

## Backend User Endpoint'leri
```
GET  /api/v1/users/me                           → UserDTO
GET  /api/v1/identity/profile                   → UserProfile (via BFF: /api/user/profile)
POST /api/v1/identity/profile                   → profile update
POST /api/v1/identity/profile/change-password   → (via BFF: /api/user/change-password)
GET  /api/v1/identity/addresses                 → Address[] (via BFF: /api/addresses)
POST /api/v1/identity/addresses                 → create address
PUT  /api/v1/identity/addresses/:id             → update
DELETE /api/v1/identity/addresses/:id           → delete
GET  /api/v1/wallet                             → WalletBalance
GET  /api/v1/wallet/transactions                → WalletTransaction[]
POST /api/v1/wallet/topup                       → stub
POST /api/v1/wallet/withdraw                    → stub
GET  /api/v1/xp/history (kısmen)               → XP geçmişi
```

## YAPILACAKLAR

### 1. pages/profile/index.vue — Tab yapısı
Profile sayfası tab'lara ayrılmış:
- `ProfileInfoTab` → `GET/POST /api/user/profile`
- `ProfileAddressesTab` → `GET/POST/PUT/DELETE /api/addresses`
- `ProfileSecurityTab` → `POST /api/user/change-password`
- `ProfileWalletTab` → `GET /api/wallet`
- `ProfileLoyaltyTab` → `GET /api/loyalty/status`
- `ProfileActivityTab` → kullanıcı aktivite (stub ok)

Her tab'ın doğru service metodu çağırıp çağırmadığını kontrol et.

### 2. pages/wallet.vue — Wallet sayfası
`WalletService.getWallet()` response normalize:
Backend dönüşü:
```json
{
  "success": true,
  "data": {
    "balance": 150.50,
    "availableBalance": 100.00,
    "blockedBalance": 50.50,
    "currency": "TRY"
  }
}
```

### 3. pages/orders/index.vue + [id].vue
`OrderService.getOrders()` → `/api/orders` GET
`OrderService.getOrderById(id)` → `/api/orders/:id` GET
Backend `commerce` modülünde `checkout.controller.ts` + `cart.controller.ts` var.
Order listing için ayrı bir endpoint mevcut değilse stub response dön.

### 4. AddressService path fix
`AddressService` şu an `/api/addresses` çağırıyor.
BFF middleware `→ /api/v1/identity/addresses` rewrite ediyor. ✓
Ancak `:id` parametreli route'lar da capture ediliyor mu?
BFF middleware'de `/api/addresses/:id` → `/api/v1/identity/addresses/:id` kontrolü.

## Kısıtlamalar
- Auth guard: profil sayfaları `definePageMeta({ middleware: 'auth' })`
- `any` yasak
- Response normalize edilirken orijinal backend kodu değiştirilmez
```

---

## FAZ 8 — Vendor Paneli

---

### 📦 FAZ 8 — Gemini Prompt

```markdown
# GÖREV: Vendor Paneli — Backend Entegrasyonu

## Backend Vendor Endpoint'leri
```
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
```

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
```

---

## FAZ 9 — Admin Paneli

---

### 📦 FAZ 9 — Gemini Prompt

```markdown
# GÖREV: Admin Paneli — Backend Entegrasyonu

## Backend Admin Endpoint'leri
```
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
```

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
```

---

## FAZ 10 — Barter, Auction, Lottery + Chat + Bildirim

---

### 📦 FAZ 10 — Gemini Prompt

```markdown
# GÖREV: Barter + Auction + Chat + Bildirim Sistemi

## Backend Endpoint'leri
```
# Barter
GET  /api/v1/listings (surplus ile aynı)
POST /api/v1/listings (surplus create)
POST /api/v1/barter/accept-trade (handler var)
GET  /api/v1/barter/my-offers → stub gerekiyor

# Auction
GET  /api/v1/auction/active → (auction module var, controller eksik) → stub
POST /api/v1/auction/bid → place-bid.handler.ts var
POST /api/v1/auction/draw → draw-lottery.handler.ts var

# Chat (CommunicationModule disabled in AppModule!)
# Not: app.module.ts'de // CommunicationModule, yorumlu!
# Socket.io gateway var ama module disabled
# → Stub server routes + mock socket

# Bildirim
# CommunicationModule disabled → stub
```

## YAPILACAKLAR

### 1. ÖNEMLİ: CommunicationModule Backend'de Disabled
`app.module.ts` içinde `CommunicationModule` yorumlanmış durumda.
Bu nedenle chat ve bildirim endpoint'leri **çalışmıyor**.

Çözüm — Frontend'e özel stub server routes oluştur:
```
server/api/chat/rooms.get.ts       → { success: true, data: [] }
server/api/chat/rooms/[id]/messages.get.ts → { success: true, data: [] }
server/api/notifications.get.ts   → { success: true, data: [] }
server/api/notifications/unread-count.get.ts → { success: true, data: { count: 0 } }
```

### 2. composables/useSocket.ts — Graceful fallback
Socket.io bağlantı başarısız olursa (backend çalışmıyor):
```typescript
// Mevcut useSocket.ts'e try-catch ve reconnection limit ekle
const MAX_RETRIES = 3
// Retry sonrası fail → warning logla, kullanıcıya toast gösterme
```

### 3. pages/barter/index.vue
- Surplus ilanlarını listele: `GET /api/surplus` → BFF → `/api/v1/listings`
- `CreateSurplusModal` → `POST /api/surplus` → `/api/v1/listings`
- Trade offer: `TradeOfferModal` → `POST /api/barter/transfer`

### 4. pages/auctions/index.vue + [id].vue
- Auction list: stub server route
- Bid gönderme: `/api/auction/bid` POST

### 5. pages/lotteries/index.vue + [id].vue
- Lottery list: stub server route
- Draw: backend'de handler var

### 6. Backend'e NOT ekle (backend prompt için)
Backend FAZ'ındaki eklenecekler (ayrı prompt):
- `CommunicationModule`'ü `app.module.ts`'de aktifleştir
- `AuctionController` oluştur (handler'lar var, controller yok)

## Kısıtlamalar
- Stub route'lar production'da da çalışmalı (Nitro server routes)
- `pnpm typecheck` 0 hata
```

---

## FAZ 11 — Final Polish (i18n, PWA, SEO, TypeCheck)

---

### 📦 FAZ 11 — Gemini Prompt

```markdown
# GÖREV: Final Polish — TypeScript + i18n + SEO + PWA

## YAPILACAKLAR

### 1. TypeScript strict temizlik
`pnpm typecheck` çalıştır. Hata varsa kategorile:
- Missing type export → `@barterborsa/shared-types` package'ından import et
- `any` kullanımı → proper type ile replace et
- Unresolved component → skeleton bileşen oluştur

### 2. i18n eksik key'leri tamamla
`locales/tr.json` ve `locales/en.json` içinde:
- `common.error`, `common.serverConnectionError`, `common.unexpectedError`
- `common.accessDenied`, `nav.ecoBazarX`, `nav.ecoTicariTakas`, `nav.ecoBarterBorsa`
- Auth mesajları: `auth.loginSuccess`, `auth.logoutSuccess`

### 3. SEO — useHead per sayfa
Kritik sayfalara `useHead` ekle:
```typescript
// pages/products/[...slug].vue içinde
useHead({
  title: () => product.value?.name ? `${product.value.name} | BarterBorsa` : 'Ürün',
  meta: [
    { name: 'description', content: () => product.value?.description?.slice(0, 160) ?? '' }
  ]
})
```

### 4. PWA manifest doğrulama
`public/icon-192x192.png` ve `public/icon-512x512.png` var mı?
Nuxt PWA config'in `manifest.icons` doğru path'e bakıyor mu?

### 5. Error boundary
`app.vue`'ya global error handler ekle:
```typescript
onErrorCaptured((err) => {
  console.error('[App] Unhandled error:', err)
  return false // Prevent propagation
})
```

### 6. Son build doğrulama
```bash
pnpm typecheck  # 0 hata
pnpm build      # successful build
```

## Kısıtlamalar
- `any` = 0
- Build hatası = 0
- TypeScript strict mode aktif
```

---

## Backend'e Eklenecekler (Ayrı Prompt — Backend Ekibi İçin)

> Bu bölüm backend'de **ek** geliştirme gerektiren noktalardır.
> Frontend bu noktaları stub ile geçici olarak çözüyor.
> Backend hazır olunca stub'lar kaldırılır.

---

### 📦 Backend Ek Geliştirme Promtu

```markdown
# GÖREV: Backend Eksik Endpoint'ler — Yeni Controller ve Route Eklemeleri

Bu değişiklikler mevcut DDD/CQRS mimarisini bozmadan yapılmalı.
Test suite'i kırmamalı (pnpm test hepsi pass).

## 1. CommunicationModule — Aktifleştirme
`apps/backend/src/app.module.ts` içinde:
```typescript
// ÖNCE (yorumlu):
// CommunicationModule,
// SONRA (aktif):
CommunicationModule,
```
Bu değişiklik sonrası:
- `GET /api/v1/chat/rooms` → chat room listesi
- `GET /api/v1/chat/rooms/:id/messages` → mesajlar
- `GET /api/v1/notifications` → bildirimler
- `GET /api/v1/notifications/unread-count` → okunmamış sayı

## 2. AuctionController — Yeni Controller
`apps/backend/src/modules/auction/presentation/auction.controller.ts` oluştur:
```typescript
@ApiTags('Auctions')
@Controller('auction')
export class AuctionController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Public()
  @Get('active')
  async getActiveAuctions(@Query() query: any) {
    // TODO: GetActiveAuctionsQuery implement
    return { success: true, data: [], total: 0 }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bid')
  async placeBid(@CurrentUser() user: any, @Body() dto: PlaceBidDto) {
    return this.commandBus.execute(new PlaceBidCommand(user.id, dto.auctionId, dto.amount))
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('draw')
  async drawLottery(@Body() dto: DrawLotteryDto) {
    return this.commandBus.execute(new DrawLotteryCommand(dto.lotteryId))
  }
}
```
`auction.module.ts`'e controller ekle.

## 3. SurplusController — Listings alias
`apps/backend/src/modules/catalog/presentation/surplus.controller.ts` oluştur:
```typescript
// /api/v1/surplus → /api/v1/listings alias
@Controller('surplus')
export class SurplusController extends ListingController {}
```
Böylece frontend `/api/surplus` → backend `/api/v1/surplus` → listings işler.

## 4. Vendor Orders Endpoint
`apps/backend/src/modules/vendor/presentation/vendor.controller.ts` içine:
```typescript
@Get('orders')
@Roles('VENDOR')
@UseGuards(JwtAuthGuard, RolesGuard)
async getVendorOrders(@CurrentUser() user: any, @Query() query: any) {
  // TODO: vendor scope'unda order query
  return { success: true, data: [], total: 0 }
}
```

## 5. Auth — `GET /auth/me` alias
`auth.controller.ts` içine:
```typescript
@Public() // Değil — JWT korumalı
@Get('me')
async me(@Req() req: any) {
  return this.queryBus.execute(new GetUserQuery(req.user.id))
}
```
Bu sayede BFF rewrite gerekmez, frontend direkt `/api/auth/me` kullanabilir.

## Doğrulama
```bash
pnpm test    # tüm testler pass
pnpm build   # 0 error
```
```

---

## Yürütme Sırası ve Checkpoint'ler

```
[  ] FAZ 1  → Nitro BFF + Mock routes
              ✓ pnpm typecheck, ✓ pnpm build
              ✓ curl /api/auth/csrf dönüyor
              ✓ curl /api/settings dönüyor

[  ] FAZ 2  → Bağımlılıklar + Config
              ✓ pnpm install hatasız
              ✓ pnpm typecheck

[  ] FAZ 3  → Stores + Composables
              ✓ pnpm typecheck
              ✓ Auth store init çalışıyor

[  ] FAZ 4  → Layout sistemi
              ✓ pnpm typecheck
              ✓ Tüm layout'lar render oluyor

[  ] FAZ 5  → Auth akışı (backend bağlantısı)
              ✓ Login → token alınıyor
              ✓ /profile sayfası yükleniyor
              ✓ Google OAuth callback çalışıyor

[  ] FAZ 6  → Public sayfalar
              ✓ Ana sayfa bileşenleri render
              ✓ Ürün listesi backend'den geliyor
              ✓ Ürün detay sayfası çalışıyor

[  ] FAZ 7  → Kullanıcı paneli
              ✓ Profile güncelleme
              ✓ Adres CRUD
              ✓ Wallet bakiye görünüyor

[  ] FAZ 8  → Vendor paneli
              ✓ Vendor dashboard yüklüyor
              ✓ Ürün listesi + form çalışıyor

[  ] FAZ 9  → Admin paneli
              ✓ Admin guard çalışıyor
              ✓ User listesi geliyor

[  ] FAZ 10 → Barter/Auction + Chat
              ✓ Surplus ilanları listeleniyor
              ✓ Socket graceful fallback

[  ] FAZ 11 → Final polish
              ✓ pnpm typecheck → 0 hata
              ✓ pnpm build → başarılı
              ✓ PWA manifest geçerli

[  ] BACKEND FAZ → Eksik endpoint'ler
              ✓ pnpm test → tüm testler pass
              ✓ CommunicationModule aktif
              ✓ AuctionController eklendi
```

---

## Önemli Notlar

### Iyzico vs Stripe
Mevcut frontend `plugins/stripe.client.ts` ve `components/forms/StripePayment.vue` Stripe kullanıyor.
Geçiş planı konuşulmuştu. Şimdilik:
- **Stripe** yapıyı **iskelet** olarak koru
- Payment endpoint'lerini stub bırak (`/api/payment/*`)
- FAZ 12 olarak Iyzico entegrasyonu ayrı bir plan

### `@barterborsa/shared-types`
Frontend bu package'ı kullanıyor (`UserDTO`, `Product`, `ApiResponse` vb.).
Bu package monorepo içinde `packages/shared-types` olarak bulunmalı.
Eğer yoksa: `types/` klasöründeki local type'ları interface olarak kullan.

### SSR Dikkat Noktaları
- `localStorage` kullanımı: `process.client` guard'ı ile
- `window.*` kullanımı: `onMounted` içinde
- Cookie: `useCookie()` her iki tarafta çalışır (SSR safe)

### Socket.io + SSR
`composables/useSocket.ts` — sadece client-side çalıştır:
```typescript
if (process.server) return // Socket sadece client'ta
```
