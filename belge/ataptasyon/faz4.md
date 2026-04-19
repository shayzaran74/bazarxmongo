FAZ 4 — Layout Sistemi

Hedef: layouts/default.vue, layouts/auth.vue, layouts/vendor.vue, layouts/admin.vue'yu
belge/frontend'deki UI ile birebir uyumlu hale getir.

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
