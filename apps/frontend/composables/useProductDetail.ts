import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from '#app'
import { useProductService } from '~/services/api/ProductService'
import { useCategoryService } from '~/services/api/CategoryService'
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'
import { useI18n } from 'vue-i18n'
import type { Product, Category, ProductVariant } from '@barterborsa/shared-types'

// Sub-composables
import { useProductActions } from '~/composables/useProductActions'
import { useProductSocial } from '~/composables/useProductSocial'
import { useProductGallery } from '~/composables/useProductGallery'

export const useProductDetail = () => {
  const route = useRoute()
  const { t } = useI18n()
  const authStore = useAuthStore()
  const wishlistStore = useWishlistStore()
  const productService = useProductService()
  const categoryService = useCategoryService()

  // State
  const product = ref<Product | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const quantity = ref(1)
  const activeTab = ref('description')
  const relatedProducts = ref<Product[]>([])
  const loadingRelated = ref(false)
  const categories = ref<Category[]>([])
  const selectedOptions = ref<Record<string, string | number>>({})
  const showAddressModal = ref(false)
  const estimatedDelivery = ref<string | null>(null)
  const selectedCity = ref('')
  const selectedDistrict = ref('')

  // Computed
  const slugParam = computed(() => {
    const s = route.params.slug
    return Array.isArray(s) ? s[s.length - 1] : (s as string)
  })

  const selectedVariant = computed<ProductVariant | null>(() => {
    const p = product.value
    if (!p || !p.hasVariants || !p.variants?.length) return null
    return p.variants.find((v: ProductVariant) =>
      Object.entries(selectedOptions.value).every(([key, val]) => v.attributes?.[key] === val)
    ) || null
  })

  const displayPrice = computed(() => {
    if (!product.value) return 0
    return selectedVariant.value ? selectedVariant.value.price : product.value.price
  })

  const currentStock = computed(() => {
    if (selectedVariant.value) return selectedVariant.value.stock
    let stock = product.value?.stock || 0
    if (product.value?.maxPurchasePerMember) {
      const remaining = Math.max(0, product.value.maxPurchasePerMember - (product.value.purchasedCount || 0))
      stock = Math.min(stock, remaining)
    }
    return stock
  })

  // Sub-composable initialization
  const gallery = useProductGallery(product)
  const actions = useProductActions(product, quantity, selectedVariant, displayPrice)
  const social = useProductSocial(product)

  // Actions
  const fetchProduct = async () => {
    try {
      loading.value = true
      const response = await (productService as any).getProductBySlug(slugParam.value)
      if (response.success && response.data) {
        product.value = response.data
        gallery.setInitialImage()
        if (authStore.isLoggedIn) {
          wishlistStore.fetchWishlist()
          social.checkReviewEligibility()
          social.checkFollowStatus()
        }
        fetchRelatedProducts()
      } else {
        error.value = t('products.detail.notFound') || 'Ürün bulunamadı'
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      error.value = t('products.detail.errorLoading') || 'Ürün yüklenirken bir hata oluştu'
    } finally {
      loading.value = false
    }
  }

  const fetchRelatedProducts = async () => {
    if (!product.value?.Category?.slug) return
    try {
      loadingRelated.value = true
      const response = await (productService as any).getProducts({
        limit: 5,
        categorySlug: product.value.Category.slug
      })
      if (response.success && response.data) {
        relatedProducts.value = response.data.filter((p: Product) => p.id !== product.value?.id).slice(0, 4)
      }
    } catch (err) {
      console.error('Error fetching related products:', err)
    } finally {
      loadingRelated.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await (categoryService as any).getCategories({ all: true })
      if (response.success && response.data) categories.value = response.data
    } catch (err) {
      console.error('Fetch categories error:', err)
    }
  }

  const estimateDelivery = async (address: { city: string, district: string }) => {
    if (!product.value?.id) return
    try {
      const response = await (productService as any).getDeliveryEstimate(product.value.id.toString(), address)
      if (response.success && response.data) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + ((response.data as any).minDays || 2))
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + ((response.data as any).maxDays || 5))
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
        estimatedDelivery.value = `${startDate.toLocaleDateString('tr-TR', options)} - ${endDate.toLocaleDateString('tr-TR', options)}`
        showAddressModal.value = false
      }
    } catch (err) {
      estimatedDelivery.value = "2-5 iş günü"
    }
  }

  onMounted(() => {
    fetchCategories()
    if (!product.value) fetchProduct()
  })

  watch(() => route.params.slug, () => fetchProduct())

  // Tabs constant
  const tabs = [
    { id: 'description', name: t('products.detail.description') || 'Açıklama' },
    { id: 'specifications', name: t('products.detail.specifications') || 'Özellikler' },
    { id: 'reviews', name: t('products.detail.reviews') || 'Değerlendirmeler' }
  ]

  return {
    // State & Computed
    product, loading, error, quantity, activeTab, relatedProducts, loadingRelated,
    categories, selectedOptions, showAddressModal, estimatedDelivery, selectedCity,
    selectedDistrict, displayPrice, currentStock, tabs,
    
    // Sub-composable exports (Gallery)
    ...gallery,
    
    // Sub-composable exports (Actions)
    ...actions,

    // Sub-composable exports (Social)
    ...social,

    // Methods
    fetchProduct, estimateDelivery
  }
}
