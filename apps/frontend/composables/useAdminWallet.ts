import { ref, watch, onMounted } from 'vue'

export const useAdminWallet = () => {
  const { $api } = useApi()
  const route = useRoute()
  const toast = useNuxtApp().$toast

  const activeTab = ref(route.query.tab === 'withdrawal' ? 'withdrawal' : 'topup')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const requests = ref<any[]>([])
  const processingRequests = ref(new Set())

  const stats = ref({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  })

  const filters = ref({
    status: '',
    user: '',
    minAmount: ''
  })

  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const changeTab = (tab: string) => {
    activeTab.value = tab
    navigateTo({ query: { ...route.query, tab } })
    fetchRequests()
  }

  const fetchRequests = async () => {
    loading.value = true
    error.value = null
    const endpoint = activeTab.value === 'topup' ? '/api/admin/wallet/requests' : '/api/admin/wallet/withdrawals'
    
    try {
      const res: any = await $api(endpoint, {
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          ...filters.value
        }
      })
      if (res.success) {
        requests.value = res.items || (Array.isArray(res.data) ? res.data : (res.data?.items || []))
        stats.value = res.stats || res.data?.stats || stats.value
        pagination.value = { ...pagination.value, ...(res.pagination || res.data?.pagination) }
      }
    } catch (err: any) {
      error.value = err.message || 'Talepler yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  const processRequest = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    processingRequests.value.add(id)
    const base = activeTab.value === 'topup' ? '/api/admin/wallet/requests' : '/api/admin/wallet/withdrawals'
    const endpoint = `${base}/${id}/${action}`
    
    try {
      const res: any = await $api(endpoint, { method: 'POST', body: { reason } })
      if (res.success) {
        toast.success(`Talep başarıyla ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`)
        await fetchRequests()
      }
    } catch (err: any) {
      toast.error(err.message || 'İşlem başarısız')
    } finally {
      processingRequests.value.delete(id)
    }
  }

  watch(() => route.query.tab, (val) => {
    if (val && val !== activeTab.value) {
      activeTab.value = val as string
      fetchRequests()
    }
  })

  return {
    activeTab, loading, error, requests, stats, filters, pagination, processingRequests,
    changeTab, fetchRequests, processRequest
  }
}
