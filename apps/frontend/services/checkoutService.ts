import { useApi } from '~/services/api'
import type { 
  ApiResponse,
  CheckoutPaymentPayload, 
  CheckoutPaymentIntentResponse, 
  CheckoutWalletPaymentResponse,
  CheckoutCoupon,
  CheckoutLoyaltyStatus,
  CheckoutLegalDoc,
  CheckoutSettings,
  CheckoutEscrowCoupon
} from '@barterborsa/shared-types'

export const useCheckoutService = () => {
  const { $api } = useApi()

  return {
    async createPaymentIntent(payload: CheckoutPaymentPayload): Promise<ApiResponse<CheckoutPaymentIntentResponse>> {
      return await $api<CheckoutPaymentIntentResponse>('/api/payment/create-payment-intent', {
        method: 'POST',
        body: payload
      })
    },

    async processWalletPayment(payload: CheckoutPaymentPayload): Promise<ApiResponse<CheckoutWalletPaymentResponse>> {
      return await $api<CheckoutWalletPaymentResponse>('/api/payment/wallet-checkout', {
        method: 'POST',
        body: payload
      })
    },

    async validateCoupon(code: string, totalAmount: number): Promise<ApiResponse<CheckoutCoupon>> {
      return await $api<CheckoutCoupon>('/api/coupons/validate', {
        method: 'POST',
        body: { code, totalAmount }
      })
    },

    async fetchLoyaltyStatus(): Promise<ApiResponse<CheckoutLoyaltyStatus>> {
      return await $api<CheckoutLoyaltyStatus>('/api/loyalty/status')
    },

    async fetchLegalDocuments(): Promise<ApiResponse<CheckoutLegalDoc[]>> {
      return await $api<CheckoutLegalDoc[]>('/api/legal')
    },

    async fetchSettings(): Promise<ApiResponse<CheckoutSettings>> {
      return await $api<CheckoutSettings>('/api/settings')
    },

    async fetchEscrowCoupons(): Promise<ApiResponse<CheckoutEscrowCoupon[]>> {
      return await $api<CheckoutEscrowCoupon[]>('/api/loyalty/escrow-coupons')
    }
  }
}
