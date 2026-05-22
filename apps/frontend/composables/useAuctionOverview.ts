// composables/useAuctionOverview.ts
import { useAuctionStore } from '~/stores/auction'
import { useAuthStore } from '~/stores/auth'

export const useAuctionOverview = () => {
  const auctionStore = useAuctionStore()
  const authStore = useAuthStore()

  const searchQuery = ref('')
  const selectedCategory = ref('')
  const statusFilter = ref('ACTIVE')
  const sortBy = ref('endTime_asc')
  const showCreateModal = ref(false)
  const currentPage = ref(1)
  const pageSize = 12

  const categories = ref<Array<{ id: string; name: string }>>([])

  // Computed
  const auctions = computed(() => auctionStore.auctions)
  const loading = computed(() => auctionStore.loading)
  const error = computed(() => auctionStore.error)
  const total = computed(() => auctionStore.total)
  const totalPages = computed(() => Math.ceil(total.value / pageSize))

  const visiblePages = computed(() => {
    const pages: number[] = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  })

  const fetchAuctions = async () => {
    await auctionStore.fetchAuctions({
      page: currentPage.value,
      limit: pageSize,
      status: statusFilter.value || undefined,
      categoryId: selectedCategory.value || undefined,
      search: searchQuery.value || undefined,
      sortBy: sortBy.value,
    })
  }

  const fetchCategories = async () => {
    try {
      const { $api } = useApi()
      const res = await $api<{ data: Array<{ id: string; name: string }> }>(
        '/api/v1/listings/categories'
      )
      categories.value = res.data || []
    } catch { /* ignore */ }
  }

  const changePage = (page: number) => {
    currentPage.value = page
    fetchAuctions()
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    statusFilter.value = 'ACTIVE'
    sortBy.value = 'endTime_asc'
    currentPage.value = 1
    fetchAuctions()
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const debounceSearch = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      currentPage.value = 1
      fetchAuctions()
    }, 400)
  }

  const formatPrice = (price: string | number) => {
    const num = Number(price);
    if (isNaN(num)) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(num);
  }

  const getStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      SCHEDULED: 'bg-blue-100 text-blue-700',
      ENDED: 'bg-gray-100 text-gray-600',
      COMPLETED: 'bg-purple-100 text-purple-700',
      CANCELLED: 'bg-red-100 text-red-600',
    }
    return map[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'AKTİF',
      SCHEDULED: 'PLANLI',
      ENDED: 'BİTTİ',
      COMPLETED: 'TAMAMLANDI',
      CANCELLED: 'İPTAL',
    }
    return map[status] || status
  }

  onMounted(() => {
    fetchAuctions()
    fetchCategories()
  })

  return {
    auctions, loading, error, categories,
    searchQuery, selectedCategory, statusFilter, sortBy,
    showCreateModal, currentPage, totalPages, visiblePages,
    authStore,
    fetchAuctions, changePage, clearFilters, debounceSearch,
    formatPrice, getStatusBadgeClass, getStatusText,
  }
}
