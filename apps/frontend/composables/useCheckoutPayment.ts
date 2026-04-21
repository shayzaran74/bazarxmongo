import { ref, nextTick } from 'vue'
import { useNuxtApp } from '#app'
import { useCheckoutService } from '~/services/checkoutService'
import { useWalletService } from '~/services/api/WalletService'
import type { Stripe, StripeElements } from '@stripe/stripe-js'

export const useCheckoutPayment = (buildPayload: any) => {
  const checkoutService = useCheckoutService()
  const walletService = useWalletService()

  const processing = ref(false)
  const stripe = ref<Stripe | null>(null)
  const elements = ref<StripeElements | null>(null)
  const clientSecret = ref<string | null>(null)
  const selectedMethod = ref('card')
  const walletBalance = ref(0)
  const walletLoading = ref(false)
  const stripeError = ref<string | null>(null)
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

  const initializeStripe = async () => {
    try {
      const payload = buildPayload()
      const res = await checkoutService.createPaymentIntent(payload)
      if (res.success && res.data) {
        const data = res.data as any
        if (data.clientSecret) {
          clientSecret.value = data.clientSecret
          currentOrderId.value = data.orderId
          const { $stripe } = useNuxtApp()
          stripe.value = $stripe as unknown as Stripe
          if (!stripe.value) throw new Error('Stripe yüklenemedi.')
          elements.value = stripe.value.elements({
            clientSecret: clientSecret.value || undefined,
            appearance: { theme: 'stripe', variables: { colorPrimary: '#6366f1', borderRadius: '12px' } }
          })
          const paymentElement = elements.value.create('payment', { layout: 'tabs' })
          await nextTick()
          paymentElement.mount('#payment-element')
          return { success: true }
        }
        if (data.htmlContent) {
          paymentFormContent.value = data.htmlContent
          currentOrderId.value = data.orderId
          return { success: true }
        }
      }
      throw new Error('Ödeme başlatılamadı.')
    } catch (error: any) {
      stripeError.value = error.message
      return { success: false, error: error.message }
    }
  }

  return {
    processing, stripe, elements, clientSecret, selectedMethod, walletBalance, 
    walletLoading, stripeError, currentOrderId, paymentFormContent, fetchWallet, initializeStripe
  }
}
