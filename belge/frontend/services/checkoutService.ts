import { useApi } from '~/services/api'
import type { 
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

  const createPaymentIntent = async (payload: CheckoutPaymentPayload): Promise<CheckoutPaymentIntentResponse> => {
    const response = await $api<{ success: boolean; data: CheckoutPaymentIntentResponse; error?: string }>('/api/payment/create-payment-intent', {
      method: 'POST',
      body: payload
    })
    if (!response.success) throw new Error(response.error || 'Ödeme altyapısı başlatılamadı.')
    return response.data
  }

  const processWalletPayment = async (payload: CheckoutPaymentPayload): Promise<CheckoutWalletPaymentResponse> => {
    const response = await $api<{ success: boolean; data: CheckoutWalletPaymentResponse; error?: string }>('/api/payment/wallet-checkout', {
      method: 'POST',
      body: payload
    })
    if (!response.success) throw new Error(response.error || 'Cüzdan ile ödeme başarısız.')
    return response.data
  }

  const validateCoupon = async (code: string, totalAmount: number): Promise<CheckoutCoupon> => {
    const response = await $api<{ success: boolean; data: CheckoutCoupon; error?: string }>('/api/coupons/validate', {
      method: 'POST',
      body: { code, totalAmount }
    })
    if (!response.success) throw new Error(response.error || 'Geçersiz kupon kodu.')
    return response.data
  }

  const fetchLoyaltyStatus = async (): Promise<CheckoutLoyaltyStatus> => {
    const response = await $api<{ success: boolean; data: CheckoutLoyaltyStatus; error?: string }>('/api/loyalty/status')
    if (!response.success) throw new Error(response.error || 'Sadakat statüsü getirilemedi.')
    return response.data
  }

  const fetchLegalDocuments = async (): Promise<CheckoutLegalDoc[]> => {
    const response = await $api<{ success: boolean; data: CheckoutLegalDoc[]; error?: string }>('/api/legal')
    if (!response.success) throw new Error(response.error || 'Yasal metinler getirilemedi.')
    return response.data
  }

  const fetchSettings = async (): Promise<CheckoutSettings> => {
    const response = await $api<{ success: boolean; data: CheckoutSettings; error?: string }>('/api/settings')
    if (!response.success) throw new Error(response.error || 'Ayarlar getirilemedi.')
    return response.data
  }

  const fetchEscrowCoupons = async (): Promise<CheckoutEscrowCoupon[]> => {
    const response = await $api<{ success: boolean; data: CheckoutEscrowCoupon[]; error?: string }>('/api/loyalty/escrow-coupons')
    if (!response.success) throw new Error(response.error || 'Emanet kuponları getirilemedi.')
    return response.data
  }

  return {
    createPaymentIntent,
    processWalletPayment,
    validateCoupon,
    fetchLoyaltyStatus,
    fetchLegalDocuments,
    fetchSettings,
    fetchEscrowCoupons
  }
}
