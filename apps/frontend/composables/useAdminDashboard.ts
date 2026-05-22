export const useAdminDashboard = () => {
  const { $api } = useApi()

  const loading = ref(false)

  const stats = reactive({
    products: 0,
    categories: 0,
    auctions: 0,
    lotteries: 0,
    users: 0,
    orders: 0,
    pendingProducts: 0,
    vendorProducts: 0,
  })

  const financialStats = reactive({
    totalCommissionXP: 0,
    totalAdXP: 0,
    totalServiceXP: 0,
    totalBarterBalance: 0,
    totalXPEarned: 0,
    totalAdXPSpent: 0,
    totalServiceXPSpent: 0,
  })

  const recentActivities = ref<Record<string, unknown>[]>([])

  const fetchStats = async () => {
    loading.value = true
    try {
      const [products, users, orders, auctions, lotteries] = await Promise.allSettled([
        $api<{ pagination?: { total: number } }>('/api/v1/admin/products', { query: { limit: 1 } }),
        $api<{ pagination?: { total: number } }>('/api/v1/admin/users', { query: { limit: 1 } }),
        $api<{ data?: { total: number } }>('/api/v1/admin/orders', { query: { limit: 1 } }),
        $api<{ data: unknown[] }>('/api/v1/admin/auctions', { query: { limit: 1 } }),
        $api<{ data?: { items: unknown[] } }>('/api/v1/admin/lotteries', { query: { limit: 1 } }),
      ])

      if (products.status === 'fulfilled')
        stats.products = products.value?.pagination?.total || 0
      if (users.status === 'fulfilled')
        stats.users = users.value?.pagination?.total || 0
      if (orders.status === 'fulfilled')
        stats.orders = orders.value?.data?.total || 0
      if (auctions.status === 'fulfilled')
        stats.auctions = (auctions.value?.data || []).length
      if (lotteries.status === 'fulfilled')
        stats.lotteries = (lotteries.value?.data?.items || []).length
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const fetchFinancialStats = async () => {
    // Financial stats financial-service'den gelir
    // Şimdilik sıfır dönüyor, gerçek entegrasyon Faz 6'da yapıldı
    // Bu composable gelecekte financial gateway'e bağlanacak
    try {
      const res = await $api<{ data?: { items: Record<string, unknown>[] } }>('/api/v1/admin/wallet/transactions', {
        query: { limit: 5 }
      })
      recentActivities.value = res?.data?.items || []
    } catch { /* ignore */ }
  }

  const refreshData = async () => {
    await Promise.all([fetchStats(), fetchFinancialStats()])
  }

  return {
    stats, financialStats, recentActivities, loading,
    fetchStats, fetchFinancialStats, refreshData,
  }
}
