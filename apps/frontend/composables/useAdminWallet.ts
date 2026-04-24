import { ref, reactive, computed } from 'vue'

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

  const filters = ref({
    search: '',
    status: '',
    minAmount: '',
  })

  const pagination = ref({
    page: 1,
    pages: 1,
    total: 0,
  })

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(p || 0)

  const fetchRequests = async () => {
    loading.value = true
    try {
      const endpoint = activeTab.value === 'topup'
        ? '/api/admin/wallet/requests'
        : '/api/admin/wallet/withdrawals'

      const res = await $api<any>(endpoint, {
        params: {
          status: filters.value.status || undefined,
          user: filters.value.search || undefined,
          minAmount: filters.value.minAmount || undefined,
          page: pagination.value.page,
          limit: 10,
        }
      })

      const items = res.data?.items || res.data || []
      requests.value = Array.isArray(items) ? items : []

      // Update pagination
      pagination.value.total = res.data?.total || items.length
      pagination.value.pages = Math.ceil(pagination.value.total / 10) || 1

      // Stats
      stats.pendingTopups = requests.value.filter(
        (r: any) => r.type === 'TOPUP' && r.status === 'PENDING'
      ).length
      stats.pendingWithdrawals = requests.value.filter(
        (r: any) => r.type === 'WITHDRAWAL' && r.status === 'PENDING'
      ).length
      stats.totalTopupAmount = requests.value
        .filter((r: any) => r.status === 'APPROVED')
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
      stats.totalWithdrawalAmount = requests.value
        .filter((r: any) => r.type === 'WITHDRAWAL' && r.status === 'APPROVED')
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0)

    } catch (err: any) {
      console.error('[AdminWallet] fetchRequests error:', err)
      requests.value = []
      // Don't toast error - silently fail and show empty state
    } finally {
      loading.value = false
    }
  }

  const processRequest = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    processingRequests.value.push(id)
    try {
      const endpoint = activeTab.value === 'topup'
        ? `/api/admin/wallet/requests/${id}/${action}`
        : `/api/admin/wallet/withdrawals/${id}/${action}`

      await $api(endpoint, {
        method: 'POST',
        body: reason ? { reason } : {}
      })

      $toast.success(action === 'approve' ? 'Talep onaylandı' : 'Talep reddedildi')
      await fetchRequests()
    } catch (err: any) {
      $toast.error(err?.data?.message || 'İşlem başarısız')
    } finally {
      processingRequests.value = processingRequests.value.filter(r => r !== id)
    }
  }

  const changeTab = (tab: 'topup' | 'withdrawal') => {
    activeTab.value = tab
    pagination.value.page = 1
    fetchRequests()
  }

  const resetFilters = () => {
    filters.value = { search: '', status: '', minAmount: '' }
    pagination.value.page = 1
    fetchRequests()
  }

  return {
    requests, loading, processingRequests, activeTab,
    stats, filters, pagination,
    formatPrice, fetchRequests, changeTab, resetFilters, processRequest,
  }
}
