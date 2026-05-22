import { ref, reactive, computed } from 'vue'
import { useApi } from './useApi'

export const useAdminLedger = () => {
  const { $api } = useApi()

  const loading = ref(false)
  const selectedDays = ref(30)
  const periods = [
    { label: '7 GÜN', value: 7 },
    { label: '30 GÜN', value: 30 },
    { label: '90 GÜN', value: 90 },
  ]

  // IMPORTANT: Initialize with empty structures to prevent 'undefined' reading '.value' errors
  // This resolves the "Cannot read properties of undefined (reading 'value')" errors in the template
  const ledgerData = ref({
    daily: [] as Record<string, unknown>[],
    distribution: [] as Record<string, unknown>[]
  })

  const recentEntries = ref<Record<string, unknown>[]>([])
  
  const kpis = ref({
    totalVolume: 0,
    todayVolume: 0,
    pendingCount: 0,
    anomalyScore: 0
  })

  const anomalyAlerts = ref<Record<string, unknown>[]>([])
  const anomalySummary = ref({ critical: 0, warning: 0, info: 0 })
  const anomalyLoading = ref(false)
  const anomalySeverityFilter = ref('ALL')
  const anomalyLastScanned = ref(new Date().toISOString())

  const reconLoading = ref(false)
  const reconResult = ref<Record<string, unknown> | null>(null)

  /**
   * Fetches ledger analytics and recent transactions
   * Renamed from fetchLedger to fetchLedgerData to match component expectation
   */
  const fetchLedgerData = async () => {
    loading.value = true
    try {
      // 1. Fetch Analytics Data (Charts)
      const res = await $api<{ success: boolean; data: { daily: Record<string, unknown>[]; distribution: Record<string, unknown>[] } }>('/api/v1/admin/analytics/ledger', {
        query: { days: selectedDays.value }
      })

      if (res.success && res.data) {
        ledgerData.value = {
          daily: res.data.daily || [],
          distribution: res.data.distribution || []
        }
      } else {
        ledgerData.value = { daily: [], distribution: [] }
      }

      // 2. Fetch Recent Transactions
      const txRes = await $api<{ data?: { items: Record<string, unknown>[] } }>('/api/v1/admin/wallet/transactions', {
        query: { limit: 10 }
      })
      recentEntries.value = txRes.data?.items || []

      // 3. Fetch KPI Stats
      const statsRes = await $api<{ success: boolean; data: { users?: Record<string, unknown> } }>('/api/v1/admin/analytics/wallet/stats')
      if (statsRes.success && statsRes.data) {
        const u = statsRes.data.users || {}
        kpis.value = {
          totalVolume: u.totalBarterBalance || 0,
          todayVolume: u.totalXPEarned || 0,
          pendingCount: u.pendingCount || 0,
          anomalyScore: 0
        }
      }

    } catch {
      /* sessiz hata */
    } finally {
      loading.value = false
    }
  }

  const fetchAnomalies = async () => {
    anomalyLoading.value = true
    try {
      const res = await $api<{ success: boolean; data: { items: Record<string, unknown>[]; summary: { critical: number; warning: number; info: number } } }>('/api/v1/admin/analytics/anomalies')
      if (res.success && res.data) {
        anomalyAlerts.value = res.data.items || []
        anomalySummary.value = res.data.summary || { critical: 0, warning: 0, info: 0 }
      }
      anomalyLastScanned.value = new Date().toISOString()
    } catch {
      /* sessiz hata */
    } finally {
      anomalyLoading.value = false
    }
  }

  const triggerReconciliation = async () => {
    reconLoading.value = true
    try {
      // Mocking reconciliation for now
      setTimeout(() => {
        reconResult.value = {
          success: true,
          matched: 1250,
          mismatched: 0,
          total: 1250,
          status: 'HEALTHY'
        }
        reconLoading.value = false
      }, 2000)
    } catch {
      reconLoading.value = false
    }
  }

  // Formatting helpers used by the dashboard
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(val || 0)
  }

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('tr-TR').format(val || 0)
  }

  const formatCurrencyShort = (val: number) => {
    if (!val) return '0 ₺'
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M ₺'
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K ₺'
    return Math.round(val) + ' ₺'
  }

  return {
    loading,
    selectedDays,
    periods,
    ledgerData,
    recentEntries,
    kpis,
    anomalyAlerts,
    anomalySummary,
    anomalyLoading,
    anomalySeverityFilter,
    anomalyLastScanned,
    reconLoading,
    reconResult,
    fetchLedgerData,
    fetchAnomalies,
    triggerReconciliation,
    formatCurrency,
    formatNumber,
    formatCurrencyShort
  }
}
