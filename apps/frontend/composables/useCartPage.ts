export const useCartPage = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const cartStore = useCartStore ? useCartStore() : null

  const cartItems = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const bestSellers = ref<any[]>([])
  const bestSellersLoading = ref(false)
  const applicableEscrowCoupons = ref<any[]>([])
  const appliedEscrowCoupon = ref<any>(null)

  const cartSummary = computed(() => {
    const subtotal = cartItems.value.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity, 0
    )
    return { subtotal, total: subtotal, tax: 0, shipping: 0 }
  })

  const subtitleText = computed(() =>
    cartItems.value.length > 0
      ? `${cartItems.value.length} ürün sepetinizde`
      : 'Sepetiniz boş'
  )

  const fetchCart = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ success: boolean; data: any }>('/api/cart')
      const resAny = res as any
      cartItems.value = resAny.data?.items || resAny.data || resAny || []
    } catch (e: any) {
      error.value = 'Sepet yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  const fetchBestSellers = async () => {
    bestSellersLoading.value = true
    try {
      const res = await $api<{ success: boolean; data: any }>(
        '/api/catalog/products',
        { query: { limit: 4 } }
      )
      const resAny = res as any
      bestSellers.value = resAny.data?.items || resAny.data || resAny || []
    } catch { /* ignore */ } finally {
      bestSellersLoading.value = false
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await $api(`/api/cart/${itemId}`, {
        method: 'PATCH',
        body: { quantity }
      })
      await fetchCart()
    } catch {
      $toast.error('Güncelleme başarısız')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await $api(`/api/cart/${itemId}`, { method: 'DELETE' })
      cartItems.value = cartItems.value.filter(i => i.id !== itemId)
      $toast.success('Ürün sepetten kaldırıldı')
    } catch {
      $toast.error('Kaldırma başarısız')
    }
  }

  const applyEscrowCoupon = async (couponId: string) => {
    appliedEscrowCoupon.value = applicableEscrowCoupons.value.find(
      c => c.id === couponId
    ) || null
  }

  const removeEscrowCoupon = () => {
    appliedEscrowCoupon.value = null
  }

  const checkout = () => navigateTo('/checkout')

  const quickCheckout = async () => navigateTo('/checkout')

  const init = async () => {
    await Promise.all([fetchCart(), fetchBestSellers()])
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
