import { ref, computed } from 'vue'

export const useAdminLedger = () => {
  const { $api } = useApi()
  const loading = ref(false)
  const selectedDays = ref(30)
  const periods = [
    { label: '7G', value: 7 },
    { label: '30G', value: 30 },
    { label: '90G', value: 90 }
  ]

  // Data
  const ledgerData = ref({ daily: [] as any[], distribution: [] as any[] })
  const recentEntries = ref([])
  
  // Anomalies
  const anomalyAlerts = ref([])
  const anomalySummary = ref({ total: 0, high: 0, medium: 0, low: 0 })
  const anomalyLoading = ref(false)
  const anomalySeverityFilter = ref('')
  const anomalyLastScanned = ref(null)

  // Reconciliation
  const reconLoading = ref(false)
  const reconResult = ref<any>(null)

  const formatNumber = (val: number) => new Intl.NumberFormat('tr-TR').format(val || 0)
  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
  const formatCurrencyShort = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₺`
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K ₺`
    return `${val} ₺`
  }

  const kpis = computed(() => {
    if (!ledgerData.value.daily?.length) return null
    return {
      totalVolume: ledgerData.value.daily.reduce((sum, d) => sum + (d.totalTxVolume || 0), 0),
      walletTxCount: ledgerData.value.daily.reduce((sum, d) => sum + (d.WALLET_TX || 0), 0),
      orderEventCount: ledgerData.value.daily.reduce((sum, d) => sum + (d.ORDER_STATUS || 0), 0),
      totalEvents: ledgerData.value.distribution.reduce((sum, d) => sum + (d.value || 0), 0)
    }
  })

  // Chart Mappings
  const dailyCategories = computed(() =>
    ledgerData.value.daily.map(d => {
      const dt = new Date(d.date)
      return `${dt.getDate()} ${dt.toLocaleString('tr-TR', { month: 'short' })}`
    })
  )

  const fetchLedgerData = async () => {
    loading.value = true
    try {
      const [lRes, rRes] = await Promise.all([
        $api(`/api/admin/analytics/ledger?days=${selectedDays.value}`),
        $api('/api/admin/wallet/transactions?page=1&limit=20')
      ])
      if (lRes?.success) ledgerData.value = lRes.data
      if (rRes?.success) recentEntries.value = rRes.data || []
    } finally {
      loading.value = false
    }
  }

  const fetchAnomalies = async () => {
    anomalyLoading.value = true
    try {
      const params = new URLSearchParams({ window: '60' })
      if (anomalySeverityFilter.value) params.set('severity', anomalySeverityFilter.value)
      const res = await $api(`/api/admin/analytics/anomalies?${params.toString()}`)
      if (res?.success) {
        anomalyAlerts.value = res.data.alerts || []
        anomalySummary.value = res.data.summary || { total: 0, high: 0, medium: 0, low: 0 }
        anomalyLastScanned.value = res.data.scannedAt
      }
    } finally {
      anomalyLoading.value = false
    }
  }

  const triggerReconciliation = async () => {
    if (!confirm('Tüm sistemi denetlemek (Audit) sunucu yükünü artırabilir. Devam?')) return
    reconLoading.value = true
    try {
      const res = await $api('/api/admin/wallet/reconcile', { method: 'POST', body: { autoSuspend: false } })
      if (res) reconResult.value = res.data
    } finally {
      reconLoading.value = false
    }
  }

  // Chart Options Boilerplate (Simplified)
  const getDailyChartOptions = () => ({
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#6366f1', '#f59e0b', '#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: dailyCategories.value, labels: { style: { fontSize: '10px' } } },
    yaxis: { labels: { style: { fontSize: '10px' } } },
    legend: { position: 'top' },
    grid: { strokeDashArray: 4 }
  })

  return {
    loading, selectedDays, periods, ledgerData, recentEntries, kpis,
    anomalyAlerts, anomalySummary, anomalyLoading, anomalySeverityFilter, anomalyLastScanned,
    reconLoading, reconResult,
    fetchLedgerData, fetchAnomalies, triggerReconciliation,
    formatCurrency, formatNumber, formatCurrencyShort,
    getDailyChartOptions
  }
}
