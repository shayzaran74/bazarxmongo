import { ref, computed, onMounted } from 'vue'

export const useAdminAuctions = () => {
  const { $api } = useApi()
  const nuxtApp = useNuxtApp()
  
  const loading = ref(false)
  const participationsLoading = ref(false)
  const auctions = ref<any[]>([])
  const participations = ref<any[]>([])
  const activeTab = ref('auctions')
  const categories = ref<any[]>([])
  
  const filters = ref({
    status: '',
    category: '',
    search: ''
  })

  const fetchAuctions = async () => {
    loading.value = true
    try {
      const res: any = await $api('/api/auctions', { query: { page: 1, limit: 1000 } })
      if (res.success) {
        auctions.value = (res.data as any[]).map((a: any) => ({
          ...a,
          status: a.status || 'Active',
          currentPrice: a.currentPrice || a.startingPrice,
          bidCount: a._count?.AuctionBid || 0,
          startDate: a.createdAt,
          endDate: a.endTime,
          category: a.Product?.Category?.name || 'electronics',
          image: a.Product?.image || 'https://placehold.co/400x400?text=No+Image'
        }))
      }
    } catch (err: any) {
      console.error('Fetch auctions error:', err)
      nuxtApp.$toast.error('Açık artırmalar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchParticipations = async () => {
    participationsLoading.value = true
    try {
      const res: any = await $api('/api/auctions/admin/participations')
      participations.value = res.data || []
    } catch (err) {
      console.error('Fetch participations error:', err)
    } finally {
      participationsLoading.value = false
    }
  }

  const approveParticipation = async (id: string) => {
    try {
      await $api(`/api/auctions/admin/participations/${id}/approve`, { method: 'POST' })
      nuxtApp.$toast.success('Başvuru onaylandı')
      await fetchParticipations()
    } catch (err: any) {
      nuxtApp.$toast.error(err.data?.error || 'Onaylama başarısız')
    }
  }

  const rejectParticipation = async (id: string) => {
    try {
      await $api(`/api/auctions/admin/participations/${id}/reject`, { method: 'POST' })
      nuxtApp.$toast.success('Başvuru reddedildi')
      await fetchParticipations()
    } catch (err: any) {
      nuxtApp.$toast.error(err.data?.error || 'Reddetme başarısız')
    }
  }

  const advanceWinner = async (id: string) => {
    try {
      const res: any = await $api(`/api/auctions/${id}/advance-winner`, { method: 'POST' })
      if (res.success) {
        nuxtApp.$toast.success('Hakkı devredildi / Cezai işlem uygulandı.')
        await fetchAuctions()
      }
    } catch (err: any) {
      nuxtApp.$toast.error(err.data?.error || 'İşlem başarısız')
    }
  }

  const deleteAuction = async (id: string) => {
    try {
      const res: any = await $api(`/api/auctions/${id}`, { method: 'DELETE' })
      if (res.success) {
        nuxtApp.$toast.success('Açık artırma silindi')
        await fetchAuctions()
      }
    } catch (err) {
      console.error('Delete error:', err)
      nuxtApp.$toast.error('Silme işlemi başarısız')
    }
  }

  const filteredAuctions = computed(() => {
    let filtered = auctions.value
    if (filters.value.status) filtered = filtered.filter(a => a.status === filters.value.status)
    if (filters.value.category) filtered = filtered.filter(a => a.category === filters.value.category)
    if (filters.value.search) {
      const s = filters.value.search.toLowerCase()
      filtered = filtered.filter(a => a.title.toLowerCase().includes(s) || a.description?.toLowerCase().includes(s))
    }
    return filtered
  })

  const stats = computed(() => ({
    total: auctions.value.length,
    active: auctions.value.filter(a => a.status === 'Active').length,
    completed: auctions.value.filter(a => a.status === 'Completed' || a.status === 'Ended').length,
    revenue: auctions.value.filter(a => a.status === 'Completed' || a.status === 'Ended').reduce((s, a) => s + (a.currentBid || a.startingPrice || 0), 0),
    pendingParticipations: participations.value.filter(p => p.status === 'Pending').length
  }))

  const init = async () => {
    await Promise.all([fetchAuctions(), fetchParticipations()])
  }

  return {
    loading, participationsLoading, auctions, participations, activeTab, categories, filters,
    filteredAuctions, stats,
    init, fetchAuctions, fetchParticipations, approveParticipation, rejectParticipation, advanceWinner, deleteAuction
  }
}
