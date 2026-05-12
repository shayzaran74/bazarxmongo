export const useAdminAuctions = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const auctions = ref<any[]>([])
  const participations = ref<any[]>([])
  const categories = ref<any[]>([])
  const loading = ref(false)
  const participationsLoading = ref(false)
  const activeTab = ref<'auctions' | 'participations'>('auctions')

  const filters = reactive({
    search: '',
    status: '',
    category: '',
  })

  const stats = reactive({
    total: 0,
    active: 0,
    scheduled: 0,
    ended: 0,
    completed: 0,
    revenue: 0,
    pendingParticipations: 0,
  })

  const filteredAuctions = computed(() => {
    let list = auctions.value
    if (filters.status) list = list.filter((a: any) => a.status === filters.status)
    if (filters.category) list = list.filter((a: any) => a.listing?.catalogProduct?.categoryId === filters.category)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter((a: any) =>
        a.listing?.title?.toLowerCase().includes(q) ||
        a.listing?.catalogProduct?.name?.toLowerCase().includes(q)
      )
    }
    return list
  })

  const fetchAuctions = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/v1/admin/auctions')
      
      // Admin tablosu için Product formatlaması
      const mapAuctionAdmin = (raw: any) => {
        if (!raw) return {}
        const media = raw.listing?.catalogProduct?.media || []
        const image = media.find((m: any) => m.type === 'IMAGE')?.url || media[0]?.url || null
        return {
          ...raw,
          startingPrice: Number(raw.startingPrice || 0),
          currentPrice: Number(raw.currentPrice ?? raw.startingPrice ?? 0),
          Product: raw.listing?.catalogProduct ? {
            name: raw.listing.catalogProduct.name,
            image,
            category: raw.listing.catalogProduct.category || null
          } : null
        }
      }

      auctions.value = (res.data || []).map(mapAuctionAdmin)
      stats.total = auctions.value.length
      stats.active = auctions.value.filter((a: any) => a.status === 'ACTIVE').length
      stats.scheduled = auctions.value.filter((a: any) => a.status === 'SCHEDULED').length
      stats.ended = auctions.value.filter((a: any) => a.status === 'ENDED').length
      stats.completed = stats.ended
    } catch {
      $toast.error('Artırmalar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchParticipations = async () => {
    participationsLoading.value = true
    try {
      const res = await $api<any>('/api/v1/admin/auctions/participations')
      participations.value = res.data || []
      stats.pendingParticipations = participations.value.filter((p: any) => p.status === 'PENDING').length
    } catch { /* ignore */ } finally {
      participationsLoading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<any>('/api/listings/categories')
      categories.value = res.data || []
    } catch { /* ignore */ }
  }

  const approveParticipation = async (id: string) => {
    try {
      await $api(`/api/admin/auctions/participations/${id}/approve`, {
        method: 'POST'
      })
      $toast.success('Katılım onaylandı')
      fetchParticipations()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectParticipation = async (id: string) => {
    try {
      await $api(`/api/admin/auctions/participations/${id}/reject`, {
        method: 'POST'
      })
      $toast.success('Katılım reddedildi')
      fetchParticipations()
    } catch {
      $toast.error('Reddedilemedi')
    }
  }

  const advanceWinner = async (auctionId: string) => {
    try {
      await $api(`/api/admin/auctions/${auctionId}/advance-winner`, {
        method: 'POST'
      })
      $toast.success('Sıradaki kazanan belirlendi')
      fetchAuctions()
    } catch {
      $toast.error('İşlem başarısız')
    }
  }

  const deleteAuction = async (id: string) => {
    if (!confirm('Bu artırmayı silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/admin/auctions/${id}`, { method: 'DELETE' })
      $toast.success('Artırma silindi')
      fetchAuctions()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  const init = async () => {
    await Promise.all([
      fetchAuctions(),
      fetchParticipations(),
      fetchCategories(),
    ])
  }

  return {
    auctions, participations, categories, loading, participationsLoading,
    activeTab, filters, stats, filteredAuctions,
    init, fetchAuctions, fetchParticipations,
    approveParticipation, rejectParticipation,
    advanceWinner, deleteAuction,
  }
}
