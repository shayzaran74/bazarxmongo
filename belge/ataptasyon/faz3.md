FAZ 3 — Core Stores + Composables

Hedef: stores/auth.ts, stores/cart.ts, stores/wishlist.ts ve composables/useApi.ts'ı
mevcut dosyalarla karşılaştırarak eksik logic'leri tamamla.


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