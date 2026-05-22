import { ref, computed } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useCheckoutService } from '~/services/checkoutService'
import { useI18n } from 'vue-i18n'
import type { CheckoutCoupon, CheckoutEscrowCoupon } from '@barterborsa/shared-types'

export const useCheckoutCart = (escrowCouponId: Ref<string | null>) => {
  const cartStore = useCartStore()
  const checkoutService = useCheckoutService()
  
  const shippingCost = ref(50)
  const couponCodeInput = ref('')
  const appliedCoupon = ref<CheckoutCoupon | null>(null)
  const appliedEscrowCoupon = ref<CheckoutEscrowCoupon | null>(null)
  const validatingCoupon = ref(false)
  const couponError = ref('')

  const finalAmountExcludingLoyalty = computed(() => {
    const discount = appliedCoupon.value ? Number(appliedCoupon.value.discountAmount) : 0
    const escrowDiscount = appliedEscrowCoupon.value ? Number(appliedEscrowCoupon.value.rewardValue) : 0
    return Math.max(0, Number(cartStore.total) + Number(shippingCost.value) - discount - escrowDiscount)
  })

  const applyCoupon = async (code?: string) => {
    const codeToUse = code || couponCodeInput.value
    if (!codeToUse) return { success: false, error: 'Kupon kodu giriniz.' }
    if (validatingCoupon.value) return { success: false, error: 'İşlem devam ediyor.' }
    
    validatingCoupon.value = true
    couponError.value = ''
    try {
      const res = await checkoutService.validateCoupon(codeToUse, cartStore.total)
      if (res.success && res.data) {
        appliedCoupon.value = res.data
        return { success: true }
      }
      throw new Error((res as { error?: string }).error || 'Geçersiz kupon')
    } catch (error: unknown) {
      couponError.value = (error as Error).message
      return { success: false, error: error.message }
    } finally {
      validatingCoupon.value = false
    }
  }

  const removeCoupon = () => {
    appliedCoupon.value = null
    couponCodeInput.value = ''
    return { success: true }
  }

  const fetchShippingCost = async () => {
    try {
      const settingsRes = await checkoutService.fetchSettings()
      if (settingsRes.success && settingsRes.data) {
        const settings = settingsRes.data as { shippingCost?: string }
        if (settings.shippingCost) shippingCost.value = parseFloat(settings.shippingCost)
      }
      shippingCost.value = cartStore.total >= 500 ? 0 : 50
    } catch (err) {
      shippingCost.value = 50
    }
  }

  const fetchEscrowCoupon = async () => {
    if (!escrowCouponId.value) return
    try {
      const res = await checkoutService.fetchEscrowCoupons()
      if (res.success && res.data) {
        const found = res.data.find((c) => c.id === escrowCouponId.value)
        if (found) appliedEscrowCoupon.value = found
      }
    } catch (err) { /* Silent */ }
  }

  return {
    shippingCost, couponCodeInput, appliedCoupon, appliedEscrowCoupon,
    validatingCoupon, couponError, finalAmountExcludingLoyalty,
    applyCoupon, removeCoupon, fetchShippingCost, fetchEscrowCoupon
  }
}
