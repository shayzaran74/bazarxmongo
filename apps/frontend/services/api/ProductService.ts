import { useApi } from '~/services/api'
import type { ApiResponse, Product, Review, PaginatedListingsDto } from '@barterborsa/shared-types'

export interface ReviewEligibilityResponse {
  canReview: boolean
  reason?: string
}

export interface DeliveryEstimateResponse {
  minDays: number
  maxDays: number
}

export const useProductService = () => {
  const { $api } = useApi()

  return {
    async getProducts(params: Record<string, unknown> = {}): Promise<ApiResponse<Product[]>> {
      const res = await $api<PaginatedListingsDto>('/api/products', { query: params })
      
      return {
        success: res.success,
        message: res.message,
        error: res.error,
        data: (res.data?.items || []) as Product[]
      }
    },

    async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
      return await $api<Product>(`/api/products/slug/${slug}`)
    },

    async getProductReviews(productId: string, params: Record<string, string | number | undefined> = {}): Promise<ApiResponse<Review[]>> {
      return await $api<Review[]>(`/api/products/${productId}/reviews`, { query: params })
    },

    async createProductReview(productId: string, body: Record<string, unknown>): Promise<ApiResponse<Review>> {
      return await $api<Review>(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body
      })
    },

    async getDeliveryEstimate(productId: string, body: { city: string, district?: string }): Promise<ApiResponse<DeliveryEstimateResponse>> {
      return await $api<DeliveryEstimateResponse>(`/api/products/${productId}/estimate-delivery`, {
        method: 'POST',
        body
      })
    },

    async checkReviewEligibility(productId: string): Promise<ApiResponse<ReviewEligibilityResponse>> {
      return await $api<ReviewEligibilityResponse>(`/api/reviews/can-review/${productId}`)
    }
  }
}
