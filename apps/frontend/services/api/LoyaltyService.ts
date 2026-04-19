import { useApi } from '~/services/api'
import type { ApiResponse, LoyaltyProgressResponse, EscrowCoupon, LoyaltyHistoryItem } from '@barterborsa/shared-types'

export const useLoyaltyService = () => {
  const { $api } = useApi()

  return {
    async getLoyaltyStatus(): Promise<ApiResponse<LoyaltyProgressResponse>> {
      return await $api<LoyaltyProgressResponse>('/api/loyalty/status')
    },
    async getLoyaltyHistory(): Promise<ApiResponse<LoyaltyHistoryItem[]>> {
      return await $api<LoyaltyHistoryItem[]>('/api/loyalty/history')
    },
    async getEscrowCoupons(): Promise<ApiResponse<EscrowCoupon[]>> {
      return await $api<EscrowCoupon[]>('/api/escrow-coupons')
    }
  }
}
