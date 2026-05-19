import { ref } from 'vue'
import { useCheckoutService } from '~/services/checkoutService'
import { useWalletService } from '~/services/api/WalletService'

export const useCheckoutPayment = (buildPayload: any) => {
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
        const data = res.data as any
        if (data.htmlContent) {
          paymentFormContent.value = data.htmlContent
          currentOrderId.value = data.orderId
          return { success: true }
        }
      }
      throw new Error('Ödeme başlatılamadı.')
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    processing, selectedMethod, walletBalance, 
    walletLoading, currentOrderId, paymentFormContent, fetchWallet, initializePayment
  }
}
