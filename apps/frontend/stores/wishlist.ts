import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface WishlistItem {
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
    isInWishlist: (state) => (productId: string) => state.items.some((i) => i.productId === productId),
  },
  actions: {
    async fetchWishlist() {
      const { $api } = useApi()
      this.loading = true
      try {
        const res = await $api<WishlistItem[]>('/api/favorites')
        if (res.success && res.data) {
          this.items = res.data
        }
      } finally { this.loading = false }
    },
    async toggle(productId: string) {
      const { $api } = useApi()
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) { 
        navigateTo('/login')
        return 
      }
      
      if (this.isInWishlist(productId)) {
        const res = await $api<void>(`/api/favorites/${productId}`, { method: 'DELETE' })
        if (res.success) {
          this.items = this.items.filter((i) => i.productId !== productId)
        }
      } else {
        const res = await $api<WishlistItem>('/api/favorites', { method: 'POST', body: { productId } })
        if (res.success && res.data) {
          this.items.push(res.data)
        }
      }
    },
  },
})