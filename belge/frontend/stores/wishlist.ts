import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useWishlistService, type WishlistItem } from '~/services/api/WishlistService'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as WishlistItem[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    itemCount: (state) => state.items.length,
    isEmpty: (state) => state.items.length === 0,
    getItemById: (state) => (productId: string) => state.items.find(item => item.productId === productId),
    isInWishlist: (state) => (productId: string) => state.items.some(item => item.productId === productId)
  },

  actions: {
    async initialize() {
      await this.fetchWishlist()
    },

    async fetchWishlist() {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) {
        this.items = []
        return
      }

      this.loading = true
      this.error = null
      const wishlistService = useWishlistService()

      try {
        const data = await wishlistService.getWishlist()
        if (data.success) {
          this.items = data.data || []
          return { success: true }
        }
        throw new Error(data.error || 'Favoriler yüklenirken bir hata oluştu')
      } catch (err: unknown) {
        const errObj = err as { message: string; status?: number }
        this.error = errObj.message || 'Favoriler yüklenirken bir hata oluştu'
        this.items = []
        return { success: false, error: this.error, status: errObj.status }
      } finally {
        this.loading = false
      }
    },

    async toggleWishlist(productId: string) {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) {
        return { success: false, needsLogin: true }
      }

      const wishlistService = useWishlistService()
      try {
        const isAlreadyInWishlist = this.isInWishlist(productId)
        let response
        if (isAlreadyInWishlist) {
          response = await wishlistService.removeFromWishlist(productId)
        } else {
          response = await wishlistService.addToWishlist(productId)
        }

        if (response.success) {
          await this.fetchWishlist()
          return {
            success: true,
            message: response.data?.message || (isAlreadyInWishlist ? 'Ürün favorilerden kaldırıldı' : 'Ürün favorilere eklendi'),
            removed: isAlreadyInWishlist
          }
        }
        throw new Error(response.error || 'Favori işlemi sırasında bir hata oluştu')
      } catch (err: unknown) {
        const errObj = err as { message: string }
        return { success: false, error: errObj.message || 'Favori işlemi sırasında bir hata oluştu' }
      }
    },

    async removeFromWishlist(productId: string) {
      const wishlistService = useWishlistService()
      try {
        const data = await wishlistService.removeFromWishlist(productId)
        if (data.success) {
          await this.fetchWishlist()
          return { success: true, message: data.data?.message || 'Ürün favorilerden kaldırıldı' }
        }
        throw new Error(data.error || 'Ürün favorilerden kaldırılırken bir hata oluştu')
      } catch (err: unknown) {
        const errObj = err as { message: string }
        return { success: false, error: errObj.message || 'Ürün favorilerden kaldırılırken bir hata oluştu' }
      }
    },

    async clearWishlist() {
      const wishlistService = useWishlistService()
      try {
        const data = await wishlistService.clearWishlist()
        if (data.success) {
          this.items = []
          return { success: true, message: data.data?.message || 'Favoriler temizlendi' }
        }
        throw new Error(data.error || 'Favoriler temizlenirken bir hata oluştu')
      } catch (err: unknown) {
        const errObj = err as { message: string }
        return { success: false, error: errObj.message || 'Favoriler temizlenirken bir hata oluştu' }
      }
    }
  }
})