export const useVendorDashboard = () => {
  const { $api } = useApi()

  const stats = reactive({
    sales: 0,
    rating: 0,
    products: 0,
    totalSales: 0,
    orderCount: 0,
    productCount: 0,
    recentActivity: [] as any[],
    stats: { views: 0, conversions: 0 },
    pendingOrders: 0,
    totalRevenue: 0,
  })

  const recentActivities = ref<any[]>([])
  const myEcosystem = ref<any>(null)

  const fetchStats = async () => {
    try {
      const res = await $api<any>(
        '/api/vendors/me/dashboard'
      )
      if (res.success && res.data) {
        Object.assign(stats, res.data)
        recentActivities.value = res.data.recentActivity || []
      }
    } catch { /* ignore */ }
  }

  const fetchEcosystemStatus = async () => {
    try {
      const res = await $api<any>(
        '/api/ecosystem/my'
      )
      const resAny = res as any
      if (resAny.success) {
        myEcosystem.value = resAny.ecosystem || null
      }
    } catch { /* ignore */ }
  }

  const createDefaultEcosystem = async (nameOrEvent?: string | any) => {
    const { $toast } = useNuxtApp() as any
    const name = typeof nameOrEvent === 'string' ? nameOrEvent : 'Yeni Ekosistem'
    try {
      await $api('/api/ecosystem/create', {
        method: 'POST',
        body: { name }
      })
      $toast.success('Ekosistem oluşturuldu')
      await fetchEcosystemStatus()
    } catch {
      $toast.error('Ekosistem oluşturulamadı')
    }
  }

  return {
    stats, recentActivities, myEcosystem,
    fetchStats, fetchEcosystemStatus, createDefaultEcosystem,
  }
}
