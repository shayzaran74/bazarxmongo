import { useApi } from '~/services/api'
import type { ApiResponse } from '~/types/api'

export interface WishlistItem {
  id: string
  productId: string
  Product: {
    id: string
    name: string
    price: number
    image: string
  }
}

export const useWishlistService = () => {
  const { $api } = useApi()

  return {
    async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
      return await $api<ApiResponse<WishlistItem[]>>('/api/favorites')
    },
    async addToWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
      return await $api('/api/favorites', {
        method: 'POST',
        body: { productId }
      })
    },
    async removeFromWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
      return await $api(`/api/favorites/${productId}`, {
        method: 'DELETE'
      })
    },
    async clearWishlist(): Promise<ApiResponse<{ message: string }>> {
      return await $api('/api/favorites', {
        method: 'DELETE'
      })
    }
  }
}
