import { ref, computed, onMounted } from 'vue'
import { useAuthStore, useApi } from '#imports'

export const useAuctionOverview = () => {
  const authStore = useAuthStore()
  const { $api } = useApi()

  // State
  const auctions = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const categories = ref<any[]>([])
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const statusFilter = ref('')
  const sortBy = ref('endTime_asc')
  const showCreateModal = ref(false)

  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(1)
  const itemsPerPage = ref(12)

  // Computed
  const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, start + 4)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  })

  // Methods
  const fetchAuctions = async () => {
    loading.value = true
    error.value = null

    try {
      const query: any = {
        page: currentPage.value,
        limit: itemsPerPage.value,
        sortBy: sortBy.value
      }

      if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
      if (selectedCategory.value) query.categoryId = selectedCategory.value
      if (statusFilter.value) query.status = statusFilter.value

      const data = await $api('/api/auctions', { query })
      if ((data as any).success) {
        auctions.value = (data as any).data
        totalPages.value = (data as any).pagination?.totalPages || 1
      } else {
        throw new Error(data.error || 'Açık artırmalar yüklenirken bir hata oluştu')
      }
    } catch (err: any) {
      error.value = err.message || 'Açık artırmalar yüklenirken bir hata oluştu'
      console.error('Fetch auctions error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await $api('/api/categories', { query: { all: true } })
      if ((data as any).success) categories.value = (data as any).data
    } catch (err) {
      console.error('Fetch categories error:', err)
    }
  }

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchAuctions()
    }
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    statusFilter.value = ''
    sortBy.value = 'endTime_asc'
    currentPage.value = 1
    fetchAuctions()
  }

  let searchTimeout: any = null
  const debounceSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1
      fetchAuctions()
    }, 500)
  }

  // Helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price || 0)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500 text-white'
      case 'Completed': return 'bg-blue-500 text-white'
      case 'Cancelled': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return '🔥 CANLI'
      case 'Completed': return '✅ BİTTİ'
      case 'Cancelled': return '❌ İPTAL'
      default: return status
    }
  }

  onMounted(() => {
    fetchCategories()
    fetchAuctions()
  })

  return {
    auctions, loading, error, categories, searchQuery, selectedCategory,
    statusFilter, sortBy, showCreateModal, currentPage, totalPages, visiblePages,
    fetchAuctions, changePage, clearFilters, debounceSearch, formatPrice,
    getStatusBadgeClass, getStatusText
  }
}
