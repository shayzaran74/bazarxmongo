import { ref, computed } from 'vue'

export const useSurplusList = () => {
  const { $api } = useApi()
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  const items = ref<any[]>([])
  const categories = ref<any[]>([])
  const loading = ref(false)
  const availableSpecs = ref({
    materials: [],
    units: [],
    locations: [],
    wantedCategories: [],
    tradeModes: []
  })
  
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const currentFilters = ref<Record<string, any>>({})

  // Showcase States
  const showcase = ref({
    bestSellers: [],
    mostVisited: [],
    mostRepurchased: [],
    mostFavorited: [],
    mostRated: [],
    activeGroupBuy: null as any,
    specialOffers: [],
    loading: false,
    specialLoading: false
  })

  const homeSettings = ref({
    showFlashSales: 'true',
    showSpecialOffers: 'true',
    showAds: 'true',
    showHomeSlider: 'true',
    showBarterPool: 'true',
    showPerformanceShowcase: 'true',
    showGroupBuy: 'true'
  })

  const fetchItems = async (page = 1, filters = {}) => {
    loading.value = true
    try {
      const cleanFilters: any = {}
      Object.keys(filters).forEach(key => {
        const val = (filters as any)[key]
        if (val !== undefined && val !== null && val !== '' && val !== false) cleanFilters[key] = val
      })

      if (cleanFilters.nearMe && authStore.user?.city && !cleanFilters.location) {
        cleanFilters.location = authStore.user.city
      }

      const res = await $api('/api/surplus', {
        query: { page, limit: pagination.value.limit, ...cleanFilters }
      })

      if (res.success) {
        items.value = res.items || []
        pagination.value = {
          ...pagination.value,
          page: res.pagination?.page || page,
          total: res.pagination?.total || 0,
          pages: res.pagination?.pages || 0
        }
      }
    } finally {
      loading.value = false
    }
  }

  const fetchShowcaseData = async () => {
    showcase.value.specialLoading = true
    showcase.value.loading = true
    try {
      const [specialRes, bestRes, visitRes, repRes, favRes, ratedRes, gbRes] = await Promise.all([
        $api('/api/products', { query: { limit: 6, isSpecialOffer: true } }),
        $api('/api/products/stats/bestsellers', { query: { limit: 6 } }),
        $api('/api/products/stats/most-visited', { query: { limit: 6 } }),
        $api('/api/products/stats/most-repurchased', { query: { limit: 6 } }).catch(() => ({ data: [] })),
        $api('/api/products/stats/most-favorited', { query: { limit: 6 } }).catch(() => ({ data: [] })),
        $api('/api/products/stats/most-rated', { query: { limit: 6 } }).catch(() => ({ data: [] })),
        $api('/api/group-buys/active').catch(() => ({ success: false }))
      ])

      showcase.value.specialOffers = specialRes.data || []
      showcase.value.bestSellers = bestRes.data || []
      showcase.value.mostVisited = visitRes.data || []
      showcase.value.mostRepurchased = repRes.data || []
      showcase.value.mostFavorited = favRes.data || []
      showcase.value.mostRated = ratedRes.data || []
      if (gbRes.success) showcase.value.activeGroupBuy = gbRes.data
    } finally {
      showcase.value.specialLoading = false
      showcase.value.loading = false
    }
  }

  const fetchHomeSettings = async () => {
    const res = await $api('/api/settings?ecosystem=ticaritakas')
    if (res.success) homeSettings.value = { ...homeSettings.value, ...res.data }
  }

  const fetchCategoriesAndSpecs = async () => {
    const [catRes, specRes] = await Promise.all([
      $api('/api/surplus/categories'),
      $api('/api/surplus/specs')
    ])
    if (catRes.success) categories.value = catRes.data.filter((c: any) => c.isActive)
    if (specRes.success) availableSpecs.value = specRes.data
  }

  const updateFilters = (newFilters: any) => {
    currentFilters.value = newFilters
    const query: any = {}
    Object.keys(newFilters).forEach(k => { if (newFilters[k]) query[k] = newFilters[k] })
    router.push({ query })
    fetchItems(1, newFilters)
  }

  const syncFilters = () => {
    const filters: any = {}
    Object.keys(route.query).forEach(k => { filters[k] = route.query[k] })
    currentFilters.value = filters
    fetchItems(1, filters)
  }

  return {
    items, categories, availableSpecs, loading, pagination, currentFilters,
    showcase, homeSettings,
    fetchItems, fetchShowcaseData, fetchHomeSettings, fetchCategoriesAndSpecs,
    updateFilters, syncFilters
  }
}
