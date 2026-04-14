import { useApi } from '~/services/api'
import type { ApiResponse } from '@barterborsa/shared-types'
import type { Product, Review } from '@barterborsa/shared-types'

export interface ReviewEligibilityResponse extends ApiResponse<unknown> {
  canReview: boolean
  reason?: string
}

export interface DeliveryEstimateResponse extends ApiResponse<unknown> {
  minDays: number
  maxDays: number
}

export const useProductService = () => {
  const { $api } = useApi()

  return {
    async getProducts(params: Record<string, unknown> = {}): Promise<ApiResponse<Product[]>> {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value))
        }
      })
      const queryString = query.toString()
      return await $api<ApiResponse<Product[]>>(`/api/products${queryString ? '?' + queryString : ''}`)
    },

    async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
      return await $api<ApiResponse<Product>>(`/api/products/${slug}`)
    },

    async getProductReviews(productId: string, params: Record<string, string | number | undefined> = {}): Promise<ApiResponse<Review[]>> {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value))
        }
      })
      const queryString = query.toString()
      return await $api<ApiResponse<Review[]>>(`/api/products/${productId}/reviews${queryString ? '?' + queryString : ''}`)
    },

    async createProductReview(productId: string, body: Record<string, unknown>): Promise<ApiResponse<Review>> {
      return await $api<ApiResponse<Review>>(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body
      })
    },

    async getDeliveryEstimate(productId: string, body: { city: string, district?: string }): Promise<DeliveryEstimateResponse> {
      return await $api<DeliveryEstimateResponse>(`/api/products/${productId}/estimate-delivery`, {
        method: 'POST',
        body
      })
    },

    async checkReviewEligibility(productId: string): Promise<ReviewEligibilityResponse> {
      return await $api<ReviewEligibilityResponse>(`/api/reviews/can-review/${productId}`)
    }
  }
}
