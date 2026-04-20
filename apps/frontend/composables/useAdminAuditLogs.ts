import { ref, onMounted } from 'vue'

export const useAdminAuditLogs = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  
  const loading = ref(false)
  const logs = ref<any[]>([])
  const isModalOpen = ref(false)
  const selectedLog = ref<any>(null)

  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const filters = ref({
    action: '',
    search: ''
  })

  const actionTypes = [
    'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
    'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
    'APPROVE_TOPUP', 'REJECT_TOPUP',
    'APPROVE_WITHDRAWAL', 'REJECT_WITHDRAWAL',
    'MANUAL_BALANCE_CHANGE', 'MANUAL_XP_CHANGE',
    'UPDATE_USER', 'DELETE_USER',
    'APPROVE_CHAIN', 'DELETE_CHAIN',
    'CONNECT_MATCH', 'UPDATE_MATCH_STATUS',
    'UPDATE_ORDER_STATUS', 'APPROVE_PAYOUT',
    'RECONCILE', 'ANOMALY_BURST_REQUESTS'
  ]

  const fetchLogs = async () => {
    loading.value = true
    try {
      const params = new URLSearchParams({
        page: pagination.value.page.toString(),
        limit: pagination.value.limit.toString(),
        ...filters.value
      })

      const response: any = await $api(`/api/v1/admin/logs/audit?${params.toString()}`)
      if (response.success) {
        logs.value = response.data
        pagination.value = response.pagination
      }
    } catch (error) {
      console.error('Audit Logs Fetch Error:', error)
      toast.error('Kayıtlar yüklenirken bir hata oluştu.')
    } finally {
      loading.value = false
    }
  }

  const changePage = (page: number) => {
    pagination.value.page = page
    fetchLogs()
  }

  const showDetails = (log: any) => {
    selectedLog.value = log
    isModalOpen.value = true
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
    if (action.includes('UPDATE')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (action.includes('DELETE')) return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
    if (action.includes('APPROVE')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (action.includes('REJECT')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (action.includes('XP') || action.includes('BALANCE')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    if (action.includes('ANOMALY')) return 'bg-slate-900 text-yellow-400 border-black animate-pulse font-black ring-2 ring-yellow-400/20'
    return 'bg-slate-800 text-slate-400 border-slate-700'
  }

  onMounted(fetchLogs)

  return {
    logs, loading, pagination, filters, isModalOpen, selectedLog, actionTypes,
    fetchLogs, changePage, showDetails, formatDate, formatTime, getActionBadgeClass
  }
}
