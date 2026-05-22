import { ref } from 'vue'
import { useCheckoutService } from '~/services/checkoutService'
import { useWalletService } from '~/services/api/WalletService'

export const useCheckoutPayment = (buildPayload: () => Record<string, unknown>) => {
  const checkoutService = useCheckoutService()
  const walletService = useWalletService()

  const processing = ref(false)
  const selectedMethod = ref('card')
  const walletBalance = ref(0)
  const walletLoading = ref(false)
  const currentOrderId = ref<string | null>(null)
  const paymentFormContent = ref('')

  const fetchWallet = async () => {
    walletLoading.value = true
    try {
      const response = await walletService.getWallet()
      if (response?.success && response.data) {
        const addr = response.data
        walletBalance.value = (Number(addr.balance ?? 0) - Number(addr.blockedBalance ?? 0))
      }
    } catch (err) { /* Silent */ }
    finally { walletLoading.value = false }
  }

  const initializePayment = async () => {
    try {
      const payload = buildPayload()
      const res = await checkoutService.createPaymentIntent(payload)
      if (res.success && res.data) {
        const data = res.data as { htmlContent?: string; orderId?: string }
        if (data.htmlContent) {
          paymentFormContent.value = data.htmlContent
          currentOrderId.value = data.orderId
          return { success: true }
        }
      }
      throw new Error('Ödeme başlatılamadı.')
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message }
    }
  }

  return {
    processing, selectedMethod, walletBalance, 
    walletLoading, currentOrderId, paymentFormContent, fetchWallet, initializePayment
  }
}
