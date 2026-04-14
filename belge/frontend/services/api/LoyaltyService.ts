import { useApi } from '~/services/api'
import type { ApiResponse, LoyaltyProgressResponse, EscrowCoupon, LoyaltyHistoryItem } from '@barterborsa/shared-types'

export const useLoyaltyService = () => {
  const { $api } = useApi()

  return {
    async getLoyaltyStatus(): Promise<ApiResponse<LoyaltyProgressResponse>> {
      return await $api<ApiResponse<LoyaltyProgressResponse>>('/api/loyalty/status')
    },
    async getLoyaltyHistory(): Promise<ApiResponse<LoyaltyHistoryItem[]>> {
      return await $api<ApiResponse<LoyaltyHistoryItem[]>>('/api/loyalty/history')
    },
    async getEscrowCoupons(): Promise<ApiResponse<EscrowCoupon[]>> {
      return await $api<ApiResponse<EscrowCoupon[]>>('/api/escrow-coupons')
    }
  }
}
