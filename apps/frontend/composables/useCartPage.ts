export const useCartPage = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const cartStore = useCartStore ? useCartStore() : null

  const cartItems = computed(() => cartStore?.items || [])
  const loading = computed(() => cartStore?.loading || false)
  const error = computed(() => cartStore?.error || null)
  const bestSellers = ref<any[]>([])
  const bestSellersLoading = ref(false)
  const applicableEscrowCoupons = computed(() => cartStore?.availableEscrowCoupons || [])
  const appliedEscrowCoupon = ref<any>(null)

  const cartSummary = computed(() => {
    if (cartStore?.summary) {
      return {
        ...cartStore.summary,
        totalPrice: cartStore.summary.totalPrice || cartStore.summary.total || cartStore.summary.subtotal || 0,
        totalItems: cartStore.summary.totalItems || cartStore.count || 0
      }
    }
    const totalItems = cartItems.value.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = cartItems.value.reduce(
      (sum, item) => sum + Number(item.price || item.Product?.price || 0) * item.quantity, 0
    )
    return { 
      subtotal, 
      total: subtotal, 
      totalPrice: subtotal, 
      totalItems,
      tax: 0, 
      shipping: 0 
    }
  })

  const subtitleText = computed(() =>
    cartItems.value.length > 0
      ? `${cartItems.value.length} ürün sepetinizde`
      : 'Sepetiniz boş'
  )

  const fetchCart = async () => {
    if (cartStore) {
      await cartStore.fetchCart()
    }
  }

  const fetchBestSellers = async () => {
    bestSellersLoading.value = true
    try {
      const res = await $api<{ success: boolean; data: any }>(
        '/api/v1/products',
        { query: { limit: 4 } }
      )
      const resAny = res as any
      bestSellers.value = resAny.data?.items || resAny.data || resAny || []
    } catch { /* ignore */ } finally {
      bestSellersLoading.value = false
    }
  }

  const updateQuantity = async (payload: { id: string; quantity: number }) => {
    if (cartStore) {
      const res = await cartStore.updateQuantity(payload.id, payload.quantity)
      if (!res.success) {
        $toast.error('Güncelleme başarısız')
      }
    }
  }

  const removeItem = async (itemId: string) => {
    if (cartStore) {
      await cartStore.removeItem(itemId)
      $toast.success('Ürün sepetten kaldırıldı')
    }
  }

  const applyEscrowCoupon = async (couponId: string) => {
    if (cartStore) {
      await cartStore.applyEscrowCoupon(couponId)
      appliedEscrowCoupon.value = cartStore.appliedEscrowCoupon
    }
  }

  const removeEscrowCoupon = async () => {
    if (cartStore) {
      await cartStore.removeEscrowCoupon()
      appliedEscrowCoupon.value = null
    }
  }

  const checkout = () => navigateTo('/checkout')

  const quickCheckout = async () => navigateTo('/checkout')

  const init = async () => {
    await Promise.all([
      fetchCart(), 
      fetchBestSellers(),
      cartStore?.fetchEscrowCoupons()
    ])
  }

  return {
    cartItems, cartSummary, loading, error,
    bestSellers, bestSellersLoading,
    subtitleText, applicableEscrowCoupons, appliedEscrowCoupon,
    init, updateQuantity, removeItem,
    applyEscrowCoupon, removeEscrowCoupon,
    checkout, quickCheckout,
  }
}
