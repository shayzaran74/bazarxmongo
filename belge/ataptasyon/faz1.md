FAZ 1 — Backend Taraf: Nitro BFF + API Bridge

Hedef: Frontend servislerin /api/... isteklerini backend /api/v1/... endpointlerine
yönlendirmek; backend'de olmayan ama frontend'in beklediği endpointleri Nitro server route olarak mock etmek.
Backend'e tek satır dokunulmaz.

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