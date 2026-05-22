export const useAdminAuditLogs = () => {
  const { $api } = useApi()

  const logs = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const isModalOpen = ref(false)
  const selectedLog = ref<Record<string, unknown> | null>(null)
  const actionTypes = ref<string[]>([
    'LOGIN', 'LOGOUT', 'UPDATE_PRODUCT', 'DELETE_USER', 'APPROVE_VENDOR', 'SYSTEM_UPDATE'
  ])

  const filters = reactive({
    search: '',
    action: '',
    severity: '',
    page: 1,
    limit: 20,
  })

  const pagination = reactive({
    total: 0,
    pages: 1,
    page: 1,
    limit: 20
  })

  const fetchLogs = async () => {
    loading.value = true
    try {
      const res = await $api<{ data?: { items: Record<string, unknown>[]; total: number } }>('/api/v1/admin/audit-logs', {
        query: {
          page: filters.page,
          limit: filters.limit,
          action: filters.action || undefined,
          severity: filters.severity || undefined,
          q: filters.search || undefined,
        }
      })
      logs.value = res.data?.items || []
      pagination.total = res.data?.total || 0
      pagination.pages = Math.ceil(pagination.total / filters.limit)
      pagination.page = filters.page
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const changePage = (page: number) => {
    filters.page = page
    fetchLogs()
  }

  const showDetails = (log: Record<string, unknown>) => {
    selectedLog.value = log
    isModalOpen.value = true
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'DELETE': return 'bg-red-500/20 text-red-400'
      case 'UPDATE': return 'bg-blue-500/20 text-blue-400'
      case 'CREATE': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  return {
    logs, loading, pagination, filters, isModalOpen, selectedLog, actionTypes,
    fetchLogs, changePage, showDetails, formatDate, formatTime, getActionBadgeClass
  }
}
