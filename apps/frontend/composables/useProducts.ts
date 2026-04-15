import type { Product } from '~/types/catalog'
import type { PaginatedResponse, PaginationMeta } from '~/types/api'

export interface ProductFilters {
  page?: number
  limit?: number
  sort?: string
  search?: string
  categorySlug?: string
  brandSlug?: string
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  isFlashSale?: boolean
  freeShipping?: boolean
}

export function useProducts() {
  const { $api } = useApi()
  const route = useRoute()
  const router = useRouter()

  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const meta = ref<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  /** URL query'den filtre nesnesine dönüştür */
  function filtersFromQuery(): ProductFilters {
    const q = route.query
    return {
      page: q.page ? Number(q.page) : 1,
      limit: q.limit ? Number(q.limit) : 20,
      sort: (q.sort as string) || undefined,
      search: (q.search as string) || undefined,
      categorySlug: (q.categorySlug as string) || undefined,
      brandSlug: (q.brandSlug as string) || undefined,
      minPrice: q.minPrice ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
      isFeatured: q.isFeatured === 'true' ? true : undefined,
      isFlashSale: q.isFlashSale === 'true' ? true : undefined,
      freeShipping: q.freeShipping === 'true' ? true : undefined,
    }
  }

  /** Filtre nesnesini URL query'ye yaz */
  function updateQuery(filters: ProductFilters) {
    const query: Record<string, string> = {}
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== false) {
        query[key] = String(val)
      }
    })
    router.push({ query })
  }

  /** Ürünleri API'den çek */
  async function fetchProducts(filters?: ProductFilters) {
    const activeFilters = filters || filtersFromQuery()
    loading.value = true
    error.value = null

    try {
      // Boş değerleri temizle
      const query: Record<string, string | number | boolean | undefined> = {}
      Object.entries(activeFilters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query[key] = val as string | number | boolean | undefined
        }
      })

      const response = await $api<Product[]>('products', { query })

      if (response.success) {
        products.value = response.data || []
        if (response.meta) {
          meta.value = response.meta
        }
      }
    } catch (err) {
      error.value = 'Ürünler yüklenirken hata oluştu'
      console.error('fetchProducts error:', err)
    } finally {
      loading.value = false
    }
  }

  /** Sayfayı değiştir */
  function goToPage(page: number) {
    const filters = filtersFromQuery()
    filters.page = page
    updateQuery(filters)
  }

  /** Filtreleri sıfırla */
  function clearFilters() {
    router.push({ query: {} })
  }

  return {
    products,
    loading,
    error,
    meta,
    filtersFromQuery,
    updateQuery,
    fetchProducts,
    goToPage,
    clearFilters,
  }
}
