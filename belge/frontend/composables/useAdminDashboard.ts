import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { ApiResponse, AdminWalletStats, PaginatedResponse, AdminAuditLog } from '@barterborsa/shared-types'

interface ActivityItem {
  id: string | number
  title: string
  description: string
  time: string
  icon: string
  color: string
}

export const useAdminDashboard = () => {
  const { $api } = useApi()
  const { $toast: toast } = useNuxtApp()

  const stats = ref({
    products: 0,
    categories: 0,
    users: 0,
    auctions: 0,
    lotteries: 0,
    orders: 0,
    pendingProducts: 0,
    vendorProducts: 0
  })

  const financialStats = ref({
    totalCommissionXP: 0,
    totalAdXP: 0,
    totalServiceXP: 0,
    totalBarterBalance: 0,
    totalXPEarned: 0,
    totalAdXPSpent: 0,
    totalServiceXPSpent: 0
  })

  const recentActivities = ref<ActivityItem[]>([])
  const loading = ref(false)

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes, auctionsRes, lotteriesRes, pendingProductsRes] = await Promise.all([
        $api<PaginatedResponse<unknown>>('/api/products', { query: { limit: 1 } }),
        $api<PaginatedResponse<unknown>>('/api/categories', { query: { limit: 1 } }),
        $api<PaginatedResponse<unknown>>('/api/auctions', { query: { limit: 1 } }),
        $api<PaginatedResponse<unknown>>('/api/lotteries', { query: { limit: 1 } }),
        $api<PaginatedResponse<unknown>>('/api/admin/products/pending', { query: { limit: 1 } }).catch(() => ({ success: false, pagination: { total: 0 } } as PaginatedResponse<unknown>))
      ])

      const getCount = (res: PaginatedResponse<unknown>) => res.success ? (res.pagination?.total ?? 0) : 0

      stats.value = {
        ...stats.value,
        products: getCount(productsRes),
        categories: getCount(categoriesRes),
        auctions: getCount(auctionsRes),
        lotteries: getCount(lotteriesRes),
        pendingProducts: getCount(pendingProductsRes),
        vendorProducts: productsRes.success && productsRes.pagination?.totalVendorProducts ? productsRes.pagination.totalVendorProducts : 0
      }

      const activitiesRes = await $api<ApiResponse<AdminAuditLog[]>>('/api/admin/logs/audit', { query: { limit: 10 } }).catch(() => ({ success: false, data: [] } as ApiResponse<AdminAuditLog[]>))
      if (activitiesRes.success && activitiesRes.data) {
        recentActivities.value = activitiesRes.data.map(log => ({
          id: log.id,
          title: log.action || 'Aktivite',
          description: log.reason || log.targetId || '-',
          time: log.createdAt,
          icon: 'BoltIcon',
          color: 'blue'
        }))
      }

    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    }
  }

  const fetchFinancialStats = async () => {
    try {
      const res = await $api<ApiResponse<AdminWalletStats>>('/api/admin/wallet/stats')
      if (res.success && res.data) {
        financialStats.value = {
          totalCommissionXP: res.data.users?.totalCommissionXP || 0,
          totalAdXP: res.data.users?.totalAdXP || 0,
          totalServiceXP: res.data.users?.totalServiceXP || 0,
          totalBarterBalance: res.data.users?.totalBarterBalance || 0,
          totalXPEarned: res.data.users?.totalXPEarned || 0,
          totalAdXPSpent: res.data.users?.totalAdXPSpent || 0,
          totalServiceXPSpent: res.data.users?.totalServiceXPSpent || 0
        }
        if (res.data.users?.total !== undefined) {
          stats.value.users = res.data.users.total
        }
      }
    } catch (e) {
      console.error('Failed to fetch financial stats:', e)
    }
  }

  const refreshData = async () => {
    loading.value = true
    try {
      await Promise.all([fetchStats(), fetchFinancialStats()])
      toast.success('İstatistikler güncellendi!')
    } catch (error) {
      toast.error('Guncelleme sirasinda hata olustu')
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    financialStats,
    recentActivities,
    loading,
    fetchStats,
    fetchFinancialStats,
    refreshData
  }
}
