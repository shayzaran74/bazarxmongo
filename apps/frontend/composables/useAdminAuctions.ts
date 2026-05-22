// composables/useAdminAuctions.ts

interface CatalogMedia {
  url: string
  type: string
}

interface AdminAuction {
  id: string
  title?: string
  status: string
  startingPrice: number | string
  currentPrice: number | string
  participationDeposit?: number | string
  startTime: string
  endTime: string
  listingId: string
  listing?: {
    title?: string
    description?: string
    catalogProduct?: {
      name: string
      categoryId?: string
      category?: { id: string; name: string } | null
      media?: CatalogMedia[]
    }
  }
  _count?: { bids: number }
  // Hesaplanmış (frontend-only)
  Product?: {
    name: string
    image: string | null
    category: { id: string; name: string } | null
  } | null
}

interface Participation {
  id: string
  status: string
  createdAt: string
  user?: {
    id: string
    email?: string
    profile?: { firstName?: string; lastName?: string }
  }
  auction?: {
    id: string
    participationDeposit?: number | string
    listing?: { title?: string }
  }
}

interface Category {
  id: string
  name: string
}

interface Pagination {
  page: number
  limit: number
  total: number
}

interface AuctionStats {
  total: number
  active: number
  scheduled: number
  ended: number
  completed: number
  revenue: number
  pendingParticipations: number
}

interface Filters {
  search: string
  status: string
  category: string
}

export const useAdminAuctions = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const auctions = ref<AdminAuction[]>([])
  const participations = ref<Participation[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const participationsLoading = ref(false)
  const activeTab = ref<'auctions' | 'participations'>('auctions')

  const filters = reactive<Filters>({
    search: '',
    status: '',
    category: '',
  })

  const stats = reactive<AuctionStats>({
    total: 0,
    active: 0,
    scheduled: 0,
    ended: 0,
    completed: 0,
    revenue: 0,
    pendingParticipations: 0,
  })

  const pagination = reactive<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
  })

  const filteredAuctions = computed(() => {
    let list = auctions.value
    if (filters.category) {
      list = list.filter(a => a.listing?.catalogProduct?.categoryId === filters.category)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(a =>
        a.listing?.title?.toLowerCase().includes(q) ||
        a.listing?.catalogProduct?.name?.toLowerCase().includes(q),
      )
    }
    return list
  })

  const mapAuctionAdmin = (raw: AdminAuction): AdminAuction => {
    const media = raw.listing?.catalogProduct?.media || []
    const image = media.find(m => m.type === 'IMAGE')?.url || media[0]?.url || null
    return {
      ...raw,
      startingPrice: Number(raw.startingPrice || 0),
      currentPrice: Number(raw.currentPrice ?? raw.startingPrice ?? 0),
      Product: raw.listing?.catalogProduct
        ? {
            name: raw.listing.catalogProduct.name,
            image,
            category: raw.listing.catalogProduct.category || null,
          }
        : null,
    }
  }

  const fetchAuctions = async () => {
    loading.value = true
    try {
      const res = await $api<{ data?: { items: AdminAuction[]; total: number } }>('/api/v1/admin/auctions', {
        query: {
          status: filters.status || undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
      })

      const raw = res.data?.items || res.data || []
      auctions.value = raw.map(mapAuctionAdmin)
      pagination.total = res.data?.total ?? raw.length

      stats.total = auctions.value.length
      stats.active = auctions.value.filter(a => a.status === 'ACTIVE').length
      stats.scheduled = auctions.value.filter(a => a.status === 'SCHEDULED').length
      stats.ended = auctions.value.filter(a => a.status === 'ENDED').length
      stats.completed = auctions.value.filter(a => a.status === 'COMPLETED').length
      stats.revenue = auctions.value
        .filter(a => a.status === 'ENDED' || a.status === 'COMPLETED')
        .reduce((sum, a) => sum + Number(a.currentPrice || 0), 0)
    } catch {
      $toast.error('Artırmalar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchParticipations = async () => {
    participationsLoading.value = true
    try {
      const res = await $api<{ data: Participation[] }>('/api/v1/admin/auctions/participations')
      participations.value = res.data || []
      stats.pendingParticipations = participations.value.filter(p => p.status === 'PENDING').length
    } catch {
      $toast.error('Katılımlar yüklenemedi')
    } finally {
      participationsLoading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<{ data: Category[] }>('/api/v1/listings/categories')
      categories.value = res.data || []
    } catch {
      $toast.warning('Kategoriler yüklenemedi')
    }
  }

  const approveParticipation = async (id: string) => {
    try {
      await $api(`/api/v1/admin/auctions/participations/${id}/approve`, { method: 'POST' })
      $toast.success('Katılım onaylandı')
      fetchParticipations()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectParticipation = async (id: string) => {
    try {
      await $api(`/api/v1/admin/auctions/participations/${id}/reject`, { method: 'POST' })
      $toast.success('Katılım reddedildi')
      fetchParticipations()
    } catch {
      $toast.error('Reddedilemedi')
    }
  }

  const advanceWinner = async (auctionId: string) => {
    try {
      await $api(`/api/v1/admin/auctions/${auctionId}/advance-winner`, { method: 'POST' })
      $toast.success('Sıradaki kazanan belirlendi')
      fetchAuctions()
    } catch {
      $toast.error('İşlem başarısız')
    }
  }

  const deleteAuction = async (id: string) => {
    try {
      await $api(`/api/v1/admin/auctions/${id}`, { method: 'DELETE' })
      $toast.success('Artırma silindi')
      fetchAuctions()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  const resetFilters = () => {
    Object.assign(filters, { search: '', status: '', category: '' })
    pagination.page = 1
    fetchAuctions()
  }

  // Status değişiminde sayfa 1'e dön ve backend'den yeniden çek (filters.status backend filtresi)
  watch(() => filters.status, () => {
    pagination.page = 1
    fetchAuctions()
  })

  // Sayfa numarası değişiminde yeniden çek
  watch(() => pagination.page, () => {
    fetchAuctions()
  })

  const init = async () => {
    await Promise.all([fetchAuctions(), fetchParticipations(), fetchCategories()])
  }

  return {
    auctions, participations, categories, loading, participationsLoading,
    activeTab, filters, stats, filteredAuctions, pagination,
    init, fetchAuctions, fetchParticipations, resetFilters,
    approveParticipation, rejectParticipation,
    advanceWinner, deleteAuction,
  }
}
