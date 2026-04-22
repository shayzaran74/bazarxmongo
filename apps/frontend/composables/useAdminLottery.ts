export const useAdminLottery = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const lotteries = ref<any[]>([])
  const selectedLottery = ref<any>(null)
  const loading = ref(false)
  const showCreateModal = ref(false)

  const filters = reactive({
    status: '',
    search: '',
  })

  const stats = reactive({
    total: 0,
    active: 0,
    ended: 0,
    drawn: 0,
  })

  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0,
  })

  const fetchLotteries = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/admin/lotteries', {
        query: {
          status: filters.status || undefined,
          page: pagination.page,
          limit: pagination.limit,
        }
      })
      lotteries.value = res.data?.items || res.data || []
      pagination.total = res.data?.total || lotteries.value.length
      stats.total = lotteries.value.length
      stats.active = lotteries.value.filter((l: any) => l.status === 'ACTIVE').length
      stats.ended = lotteries.value.filter((l: any) => l.status === 'ENDED').length
      stats.drawn = lotteries.value.filter((l: any) => l.status === 'DRAWN').length
    } catch {
      $toast.error('Çekilişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const editLottery = (lottery: any) => {
    selectedLottery.value = { ...lottery }
    showCreateModal.value = true
  }

  const deleteLottery = async (id: string) => {
    if (!confirm('Bu çekilişi silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/admin/lotteries/${id}`, { method: 'DELETE' })
      $toast.success('Çekiliş silindi')
      fetchLotteries()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  const endLottery = async (id: string) => {
    try {
      await $api(`/api/admin/lotteries/${id}/end`, { method: 'POST' })
      $toast.success('Çekiliş sonlandırıldı ve kazanan belirlendi')
      fetchLotteries()
    } catch {
      $toast.error('Sonlandırılamadı')
    }
  }

  const closeModal = () => {
    showCreateModal.value = false
    selectedLottery.value = null
  }

  const onLotterySaved = () => {
    closeModal()
    fetchLotteries()
  }

  return {
    lotteries, selectedLottery, loading, showCreateModal,
    filters, stats, pagination,
    fetchLotteries, editLottery, deleteLottery, endLottery,
    closeModal, onLotterySaved,
  }
}
