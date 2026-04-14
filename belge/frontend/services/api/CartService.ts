import { useApi } from '~/services/api'
import type { ApiResponse, Product, CartItem, CartSummary, CartMergeItem } from '@barterborsa/shared-types'

export const useCartService = () => {
  const { $api } = useApi()

  return {
    async getCart(): Promise<ApiResponse<{ items: CartItem[], summary: CartSummary }>> {
      return await $api<ApiResponse<{ items: CartItem[], summary: CartSummary }>>('/api/cart')
    },

    async bulkFetchProducts(ids: string[]): Promise<ApiResponse<Product[]>> {
      return await $api<ApiResponse<Product[]>>('/api/products/bulk', {
        method: 'POST',
        body: { ids }
      })
    },

    async addToCart(productId: string, quantity: number, productVariantId?: string): Promise<ApiResponse<{ message: string }>> {
      return await $api<ApiResponse<{ message: string }>>('/api/cart', {
        method: 'POST',
        body: { productId, quantity, productVariantId }
      })
    },

    async mergeCart(items: CartMergeItem[]): Promise<ApiResponse<{ warnings?: string[] }>> {
      return await $api<ApiResponse<{ warnings?: string[] }>>('/api/cart/merge', {
        method: 'POST',
        body: { items }
      })
    },

    async updateQuantity(itemId: string, quantity: number): Promise<ApiResponse<void>> {
      return await $api<ApiResponse<void>>(`/api/cart/${itemId}`, {
        method: 'PUT',
        body: { quantity }
      })
    },

    async removeItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
      return await $api<ApiResponse<{ message: string }>>(`/api/cart/${itemId}`, {
        method: 'DELETE'
      })
    },

    async clearCart(): Promise<ApiResponse<{ message: string }>> {
      return await $api<ApiResponse<{ message: string }>>('/api/cart', {
        method: 'DELETE'
      })
    }
  }
}
