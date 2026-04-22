export const useAdminWallet = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const requests = ref<any[]>([])
  const loading = ref(false)
  const processingRequests = ref<string[]>([])
  const activeTab = ref<'topup' | 'withdrawal'>('topup')

  const stats = reactive({
    pendingTopups: 0,
    pendingWithdrawals: 0,
    totalTopupAmount: 0,
    totalWithdrawalAmount: 0,
  })

  const filters = reactive({
    search: '',
    status: '',
    minAmount: '',
  })

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(p)

  const fetchRequests = async () => {
    loading.value = true
    try {
      const endpoint = activeTab.value === 'topup'
        ? '/api/admin/wallet/requests'
        : '/api/admin/wallet/withdrawals'

      const res = await $api<any>(endpoint, {
        query: {
          status: filters.status || undefined,
          user: filters.search || undefined,
          minAmount: filters.minAmount || undefined,
        }
      })
      requests.value = res.data?.items || []

      // Stats
      stats.pendingTopups = requests.value.filter(
        (r: any) => r.type === 'TOPUP' && r.status === 'PENDING'
      ).length
      stats.pendingWithdrawals = requests.value.filter(
        (r: any) => r.type === 'WITHDRAWAL' && r.status === 'PENDING'
      ).length
    } catch {
      $toast.error('Talepler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const changeTab = (tab: 'topup' | 'withdrawal') => {
    activeTab.value = tab
    fetchRequests()
  }

  const resetFilters = () => {
    filters.search = ''
    filters.status = ''
    filters.minAmount = ''
    fetchRequests()
  }

  return {
    requests, loading, processingRequests, activeTab,
    stats, filters,
    formatPrice, fetchRequests, changeTab, resetFilters,
  }
}
