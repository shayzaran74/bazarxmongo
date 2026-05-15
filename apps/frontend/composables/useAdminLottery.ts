// composables/useAdminLottery.ts

interface LotteryItem {
  id: string
  title: string
  prizeDescription?: string
  ticketPrice: number
  prizeValue?: number
  totalTickets: number
  maxTicketsPerUser: number
  ticketDigits: number
  numbersPerTicket: number
  status: string
  startTime: string
  endTime: string
  ownerId: string
  listingId?: string
  _count?: { tickets: number }
  listing?: {
    catalogProduct?: {
      name: string
      media?: Array<{ url: string; type: string }>
    }
  }
}

export const useAdminLottery = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const lotteries = ref<LotteryItem[]>([])
  const selectedLottery = ref<LotteryItem | null>(null)
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
    totalPrizeValue: 0,
    totalParticipants: 0,
  })

  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0,
  })

  const fetchLotteries = async () => {
    loading.value = true
    try {
      const res = await $api<{ items: LotteryItem[]; total: number }>('/api/v1/admin/lotteries', {
        query: {
          status: filters.status || undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
      })

      const raw = (res as any).data?.items || (res as any).data || []
      lotteries.value = raw
      pagination.total = (res as any).data?.total || raw.length

      stats.total = raw.length
      stats.active = raw.filter((l: LotteryItem) => l.status === 'ACTIVE').length
      stats.ended = raw.filter((l: LotteryItem) => l.status === 'ENDED').length
      stats.drawn = raw.filter((l: LotteryItem) => l.status === 'DRAWN').length
      stats.totalPrizeValue = raw.reduce((sum: number, l: LotteryItem) => sum + Number(l.prizeValue || 0), 0)
      stats.totalParticipants = raw.reduce((sum: number, l: LotteryItem) => sum + (l._count?.tickets || 0), 0)
    } catch {
      $toast.error('Çekilişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const editLottery = (lottery: LotteryItem) => {
    selectedLottery.value = { ...lottery }
    showCreateModal.value = true
  }

  const deleteLottery = async (id: string) => {
    if (!confirm('Bu çekilişi silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/lotteries/${id}`, { method: 'DELETE' })
      $toast.success('Çekiliş silindi')
      fetchLotteries()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  const endLottery = async (id: string) => {
    try {
      await $api(`/api/v1/admin/lotteries/${id}/end`, { method: 'POST' })
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
