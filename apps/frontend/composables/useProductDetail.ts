export const useProductDetail = () => {
  const route = useRoute()
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const authStore = useAuthStore()

  const product = ref<any>(null)
  const listing = ref<any>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  
  const quantity = ref(1)
  const selectedImage = ref('')
  const activeTab = ref('description')
  const isFavorite = ref(false)
  const isFollowing = ref(false)
  const followLoading = ref(false)
  const addingToCart = ref(false)
  const processingBarter = ref(false)
  const showAddressModal = ref(false)
  
  const relatedProducts = ref<any[]>([])
  const submittingReview = ref(false)
  const reviewDraft = reactive({ rating: 5, comment: '' })
  const canReview = ref(false)
  const canReviewReason = ref('')
  const loadingReviewEligibility = ref(false)
  
  const estimatedDelivery = ref<any>(null)
  const selectedCity = ref('')
  const selectedDistrict = ref('')

  const allImages = computed(() => {
    if (!product.value) return []
    const imgs = []
    if (product.value.image) imgs.push(product.value.image)
    if (product.value.media) imgs.push(...product.value.media.map((m: any) => m.url))
    return [...new Set(imgs)]
  })

  const displayPrice = computed(() => listing.value?.price || product.value?.basePrice || 0)
  const currentStock = computed(() => listing.value?.stock || 0)
  const averageRating = computed(() => product.value?.averageRating || 0)
  
  const tabs = computed(() => [
    { id: 'description', name: 'Açıklama' },
    { id: 'features', name: 'Özellikler' },
    { id: 'reviews', name: `Değerlendirmeler (${product.value?.reviewsCount || 0})` },
    { id: 'vendor', name: 'Satıcı Bilgisi' }
  ])

  const slug = computed(() => {
    const s = route.params.slug
    return Array.isArray(s) ? s[s.length - 1] : (s as string)
  })

  const fetchProduct = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $api<any>(`/api/catalog/products/slug/${slug.value}`)
      if (res.success && res.data) {
        product.value = res.data
        listing.value = res.data.listings?.[0] || null
        selectedImage.value = allImages.value[0] || ''
        fetchRelated()
      } else {
        error.value = 'Ürün bulunamadı'
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Ürün yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  const fetchRelated = async () => {
    if (!product.value) return
    try {
      const res = await $api<any>('/api/catalog/products', {
        query: { categoryId: product.value?.categoryId, limit: 4 }
      })
      relatedProducts.value = res.data?.items || res.data || []
    } catch { /* ignore */ }
  }

  const addToCart = async () => {
    if (!authStore.isLoggedIn) return navigateTo('/auth/login')
    addingToCart.value = true
    try {
      await $api('/api/cart', {
        method: 'POST',
        body: { listingId: listing.value?.id, quantity: quantity.value }
      })
      $toast.success('Ürün sepete eklendi')
    } catch {
      $toast.error('Sepete eklenemedi')
    } finally {
      addingToCart.value = false
    }
  }

  const buyNow = async () => {
    await addToCart()
    return navigateTo('/checkout')
  }

  const toggleFavorite = async () => {
    if (!authStore.isLoggedIn) return
    isFavorite.value = !isFavorite.value
    try {
      await $api('/api/favorites/toggle', {
        method: 'POST',
        body: { productId: product.value.id }
      })
    } catch {
      isFavorite.value = !isFavorite.value
    }
  }

  const toggleFollow = async () => {
    if (!authStore.isLoggedIn) return
    followLoading.value = true
    try {
      isFollowing.value = !isFollowing.value
    } finally {
      followLoading.value = false
    }
  }

  const buyWithBarter = () => {
    if (!authStore.isLoggedIn) return navigateTo('/auth/login')
    return navigateTo(`/barter/create?productId=${product.value.id}`)
  }

  const estimateDelivery = async (loc: { city: string; district: string }) => {
    try {
      const res: any = await $api('/api/shipping/estimate', { query: loc })
      estimatedDelivery.value = res.data
    } catch { /* ignore */ }
  }

  const submitReview = async () => {
    submittingReview.value = true
    try {
      await $api('/api/reviews', {
        method: 'POST',
        body: { productId: product.value.id, ...reviewDraft }
      })
      $toast.success('Değerlendirmeniz alındı')
      reviewDraft.comment = ''
    } catch {
      $toast.error('Giriş başarısız')
    } finally {
      submittingReview.value = false
    }
  }

  const shareProduct = () => {
    if (process.client) {
      navigator.clipboard.writeText(window.location.href)
      $toast.success('Link kopyalandı')
    }
  }

  return {
    product, listing, loading, error, quantity, selectedImage,
    activeTab, relatedProducts, submittingReview, reviewDraft,
    canReview, canReviewReason, loadingReviewEligibility,
    processingBarter, showAddressModal, estimatedDelivery,
    selectedCity, selectedDistrict, isFollowing, followLoading,
    tabs, displayPrice, averageRating, isFavorite, currentStock, allImages,
    fetchProduct, addToCart, buyNow, toggleFavorite, toggleFollow,
    buyWithBarter, estimateDelivery, submitReview, shareProduct
  }
}
