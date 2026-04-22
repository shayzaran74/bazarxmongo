export const useAdminLedger = () => {
  const { $api } = useApi()

  const kpis = ref<any>({})
  const recentEntries = ref<any[]>([])
  const anomalies = ref<any[]>([])
  const loading = ref(false)

  const fetchLedger = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/admin/wallet/transactions', {
        query: { limit: 20 }
      })
      recentEntries.value = res.data?.items || []
      kpis.value = {
        totalVolume: 0,
        todayVolume: 0,
        pendingCount: 0,
      }
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  return {
    kpis, recentEntries, anomalies, loading,
    fetchLedger,
  }
}
