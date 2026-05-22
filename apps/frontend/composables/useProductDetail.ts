export const useProductDetail = () => {
  const route = useRoute()
  const { $api } = useApi()
  const { $toast } = useNuxtApp()
  const authStore = useAuthStore()

  const product = ref<Record<string, unknown> | null>(null)
  const listing = ref<Record<string, unknown> | null>(null)
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

  const relatedProducts = ref<Record<string, unknown>[]>([])
  const submittingReview = ref(false)
  const reviewDraft = reactive({ rating: 5, comment: '' })
  const canReview = ref(false)
  const canReviewReason = ref('')
  const loadingReviewEligibility = ref(false)

  interface DeliveryEstimate {
    city?: string; district?: string; estimatedDays?: number
    estimatedDate?: string; carrier?: string; freeShipping?: boolean; freeShippingThreshold?: number
  }
  const estimatedDelivery = ref<DeliveryEstimate | null>(null)
  const selectedCity = ref('')
  const selectedDistrict = ref('')

  const allImages = computed(() => {
    if (!product.value) return []
    const imgs: string[] = []
    const rawProduct = product.value
    // 1. images dizisi (backend handler'dan gelir) - Vue Proxy'siz raw hali
    const imagesArr = Array.isArray(rawProduct.images) ? rawProduct.images : []
    if (imagesArr.length) imgs.push(...imagesArr)
    // 2. Tek image alanı
    if (rawProduct.image) imgs.push(rawProduct.image)
    // 3. media dizisi (Prisma media tablosu - productMedia)
    const mediaArr = Array.isArray(rawProduct.media) ? rawProduct.media : []
    if (mediaArr.length) imgs.push(...mediaArr.map((m: { url: string }) => m.url))
    // 4. productMedia dizisi (alternatif ad)
    const pmArr = Array.isArray(rawProduct.productMedia) ? rawProduct.productMedia : []
    if (pmArr.length) imgs.push(...pmArr.map((m: { url: string }) => m.url))
    return [...new Set(imgs.filter(Boolean))]
  })

  // İlk görsel hazır olduğunda selectedImage'ı otomatik doldur
  watch(allImages, (imgs) => {
    if (imgs.length && !selectedImage.value) {
      selectedImage.value = imgs[0]
    }
  }, { immediate: true })

  // Mongoose Decimal128 → { $numberDecimal: "199.99" } şeklinde gelebilir
  const toNum = (val: unknown): number => {
    if (val == null) return 0
    if (typeof val === 'number') return isNaN(val) ? 0 : val
    if (typeof val === 'string') return parseFloat(val) || 0
    if (typeof val === 'object' && '$numberDecimal' in (val as object)) {
      return parseFloat((val as { $numberDecimal: string }).$numberDecimal) || 0
    }
    return parseFloat(String(val)) || 0
  }

  const displayPrice = computed(() => {
    if (listing.value?.price) return toNum(listing.value.price)
    if (product.value?.price) return toNum(product.value.price)
    return toNum(product.value?.basePrice)
  })
  const currentStock = computed(() => toNum(listing.value?.stock ?? product.value?.stock))
  const averageRating = computed(() => toNum(product.value?.rating ?? product.value?.averageRating))

  // Watch for product changes to sync listing
  watch(product, (newVal) => {
    if (newVal && newVal.listings?.length > 0) {
      listing.value = newVal.listings[0]
    }
  }, { immediate: true })
  
  const reviewCount = computed(() => {
    const r = product.value
    return r?.reviews_count ?? r?.reviewsCount ?? r?.Review?.length ?? 0
  })

  const tabs = computed(() => [
    { id: 'description', name: 'Ürün Açıklaması' },
    { id: 'specifications', name: 'Ürün Özellikleri' },
    { id: 'reviews', name: `Yorumlar (${reviewCount.value})` },
  ])

  const slug = computed(() => {
    const s = route.params.slug
    return Array.isArray(s) ? s[s.length - 1] : (s as string)
  })

  const fetchProduct = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ success: boolean; data: Record<string, unknown> }>(`/api/v1/products/slug/${slug.value}`)
      if (res.success && res.data) {
        product.value = res.data
        listing.value = res.data.listings?.[0] || null
        selectedImage.value = allImages.value[0] || ''
        fetchRelated()
      } else {
        error.value = 'Ürün bulunamadı'
      }
    } catch (e: unknown) {
      error.value = (e as { data?: { message?: string } }).data?.message || 'Ürün yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  const fetchRelated = async () => {
    if (!product.value) return
    try {
      const res = await $api<{ data?: { items?: Record<string, unknown>[] } | Record<string, unknown>[] }>('/api/v1/products', {
        query: { categoryId: product.value?.categoryId, limit: 4 }
      })
      relatedProducts.value = res.data?.items || res.data || []
    } catch { /* ignore */ }
  }

  const addToCart = async () => {
    if (!authStore.isLoggedIn) return navigateTo('/auth/login')
    addingToCart.value = true
    try {
      const payload: Record<string, unknown> = {
        listingId: listing.value?.id,
        quantity: quantity.value
      }
      if (route.query.campaignId) {
        payload.campaignId = route.query.campaignId
      }
      
      await $api('/api/v1/cart', {
        method: 'POST',
        body: payload
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
      await $api('/api/v1/favorites/toggle', {
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
    if (!loc.city) return
    try {
      const res = await $api<{ success: boolean; data: DeliveryEstimate }>('/api/v1/delivery/estimate', { query: loc })
      if (res.success) estimatedDelivery.value = res.data
    } catch { /* teslimat tahmini opsiyonel — hata sessizce geçilir */ }
  }

  const submitReview = async () => {
    submittingReview.value = true
    try {
      await $api('/api/v1/reviews', {
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
