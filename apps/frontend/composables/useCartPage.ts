import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useProductService } from '~/services/api/ProductService'
import { navigateTo, useNuxtApp } from '#imports'
import type { Product, EscrowCoupon } from '@barterborsa/shared-types'

export const useCartPage = () => {
  const { t, tm, rt } = useI18n()
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const productService = useProductService()
  const { $toast: toast } = useNuxtApp();

  // State
  const { items: cartItems, summary: cartSummary, loading, error, availableEscrowCoupons, appliedEscrowCoupon } = storeToRefs(cartStore)
  const bestSellers = ref<Product[]>([])
  const bestSellersLoading = ref(false)

  // Computed
  const subtitleText = computed(() => {
    const options = tm('personalized.subtitleOptions') as unknown as string[] | Record<string, unknown>
    if (Array.isArray(options) && options.length > 0) {
      const val = options[0]
      // Use explicit type narrowing instead of 'any'
      return typeof val === 'string' ? val : rt(val as string)
    }
    return t('personalized.description')
  })

  const applicableEscrowCoupons = computed(() => {
    if (!availableEscrowCoupons.value?.length || !cartItems.value?.length) return []
    return availableEscrowCoupons.value.filter(coupon => {
      return (coupon.status === 'ACTIVE' || !coupon.status) && cartItems.value.some(item => item.productId === coupon.listingId)
    })
  })

  // Actions
  const fetchBestSellers = async () => {
    bestSellersLoading.value = true
    try {
      const response = await productService.getProducts({ limit: 4, sort: 'popular' })
      if (response.success && response.data) {
        bestSellers.value = response.data
      }
    } catch (err) {
      console.error('Fetch best sellers error:', err)
    } finally {
      bestSellersLoading.value = false
    }
  }

  const applyEscrowCoupon = (coupon: EscrowCoupon) => {
    cartStore.applyEscrowCoupon(coupon.id)
    toast.success(t('cart.appliedEscrowCouponSuccess'))
  }

  const removeEscrowCoupon = () => {
    cartStore.removeEscrowCoupon()
    if (toast) toast.success(t('cart.couponRemoved'))
  }

  const updateQuantity = async (data: { id: string | number, quantity: number }) => {
    await cartStore.updateQuantity(String(data.id), data.quantity)
  }

  const removeItem = async (itemId: string | number) => {
    await cartStore.removeItem(String(itemId))
  }

  const checkout = () => {
    if (appliedEscrowCoupon.value) {
      navigateTo({ path: '/checkout', query: { escrowCouponId: appliedEscrowCoupon.value.id } })
    } else {
      navigateTo('/checkout')
    }
  }

  const quickCheckout = () => {
    if (toast) toast.info(t('cart.quickCheckoutSim'))
    navigateTo('/payment-success?status=succeeded&type=quick')
  }

  const init = async () => {
    if (!authStore.isLoggedIn) {
      await navigateTo('/auth/login')
      return
    }
    
    await Promise.allSettled([
      cartStore.fetchCart(),
      fetchBestSellers(),
      cartStore.fetchEscrowCoupons()
    ])
  }

  return {
    cartItems,
    cartSummary,
    loading,
    error,
    bestSellers,
    bestSellersLoading,
    subtitleText,
    applicableEscrowCoupons,
    appliedEscrowCoupon,
    init,
    updateQuantity,
    removeItem,
    applyEscrowCoupon,
    removeEscrowCoupon,
    checkout,
    quickCheckout
  }
}
