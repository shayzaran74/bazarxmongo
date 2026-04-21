import { ref, computed, watch } from 'vue'
import { useAddressStore } from '~/stores/address'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from '#app'
import { useCheckoutService } from '~/services/checkoutService'

// Sub-composables
import { useCheckoutCart } from '~/composables/useCheckoutCart'
import { useCheckoutAddress } from '~/composables/useCheckoutAddress'
import { useCheckoutLegal } from '~/composables/useCheckoutLegal'
import { useCheckoutPayment } from '~/composables/useCheckoutPayment'

export const useCheckout = () => {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const addressStore = useAddressStore()
  const route = useRoute()
  const checkoutService = useCheckoutService()

  // Base State
  const escrowCouponId = ref(route.query.escrowCouponId as string || null)
  const loyaltyStatus = ref<any>(null)
  const loyaltyXpDiscount = ref(0)
  const useWalletBalance = ref(false)

  // Sub-composable initialization
  const cart = useCheckoutCart(escrowCouponId)
  const address = useCheckoutAddress()
  
  const finalAmount = computed(() => Math.max(0, cart.finalAmountExcludingLoyalty.value - Number(loyaltyXpDiscount.value)))
  
  const legal = useCheckoutLegal(finalAmount, addressStore, authStore, address.selectedAddressId, address.showNewAddressForm, address.newAddress)
  
  const buildPaymentPayload = () => ({
    cartItems: cartStore.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
    selectedAddressId: address.selectedAddressId.value && !address.showNewAddressForm.value ? (address.selectedAddressId.value as string) : null,
    customAddress: address.showNewAddressForm.value || addressStore.addresses.length === 0 ? address.newAddress.value : null,
    saveAddress: address.saveNewAddress.value,
    couponCode: cart.appliedCoupon.value?.code || undefined,
    escrowCouponId: cart.appliedEscrowCoupon.value?.id,
    paidWithXP: Number(loyaltyXpDiscount.value),
    pendingOrderId: payment.currentOrderId.value
  })

  const payment = useCheckoutPayment(buildPaymentPayload)

  // Bridge Computed
  const xpToUse = computed(() => {
    if (!useWalletBalance.value) return 0
    return Math.min(Number(payment.walletBalance.value), Number(finalAmount.value))
  })

  const cashToPay = computed(() => Math.max(0, Number(finalAmount.value) - Number(xpToUse.value)))

  const isFormValid = computed(() => {
    if (!address.isAddressReady.value || !legal.acceptedAgreements.value) return false
    if (payment.selectedMethod.value === 'card') return !!payment.clientSecret.value
    return true
  })

  // Mixed Actions
  const handlePayment = async () => {
    if (payment.processing.value) return { success: false, error: 'İşlem devam ediyor.' }
    if (payment.selectedMethod.value === 'wallet' && Number(payment.walletBalance.value) < Number(finalAmount.value) && cashToPay.value > 0) {
      return { success: false, error: 'Cüzdan bakiyeniz yetersiz.' }
    }

    payment.processing.value = true
    try {
      if (payment.selectedMethod.value === 'card') {
        if (!payment.stripe.value || !payment.elements.value) throw new Error('Stripe hazır değil.')
        const { error } = await payment.stripe.value.confirmPayment({
          elements: payment.elements.value,
          confirmParams: { return_url: `${window.location.origin}/payment-success` }
        })
        if (error) throw new Error(error.message)
        return { success: true }
      } else {
        const payload = buildPaymentPayload()
        const res = await checkoutService.processWalletPayment(payload)
        if (res.success && res.data) {
          await cartStore.fetchCart()
          return { success: true, orderId: res.data.orderId, type: 'wallet' }
        }
        throw new Error(res.error || 'Ödeme başarısız.')
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      payment.processing.value = false
    }
  }

  const init = async () => {
    if (cartStore.items.length === 0) await cartStore.fetchCart()
    if (cartStore.items.length === 0) return { success: false, redirect: '/cart' }

    Promise.allSettled([
      legal.fetchLegalDocs(),
      checkoutService.fetchLoyaltyStatus().then(res => { if (res.success) loyaltyStatus.value = res.data }),
      addressStore.fetchAddresses().then(() => address.getDefaultAddress()),
      payment.fetchWallet(),
      cart.fetchShippingCost(),
      cart.fetchEscrowCoupon()
    ])

    return { success: true }
  }

  // Common Watchers
  watch([address.selectedAddressId, address.showNewAddressForm, address.isAddressReady, useWalletBalance, payment.selectedMethod], () => {
    if (address.isAddressReady.value && payment.selectedMethod.value === 'card') {
      payment.initializeStripe()
    }
  }, { deep: true })

  watch(() => cartStore.total, () => cart.fetchShippingCost())

  return {
    cartStore, addressStore,
    ...cart, ...address, ...legal, ...payment,
    loyaltyStatus, loyaltyXpDiscount, useWalletBalance, 
    finalAmount, xpToUse, cashToPay, isFormValid, init, handlePayment
  }
}
