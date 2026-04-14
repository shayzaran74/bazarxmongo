import { useApi } from '~/composables/useApi'
import type { ApiResponse, BrandEcosystem, Product } from '@barterborsa/shared-types'
import { useNuxtApp, navigateTo, useAuthStore } from '#imports'

interface VendorStats {
  products: number
  orders: number
  sales: number
  rating: number
  users: number
}

interface ActivityItem {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

export const useVendorDashboard = () => {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const { $toast: toast } = useNuxtApp()

  const stats = ref<VendorStats>({
    products: 0,
    orders: 0,
    sales: 0,
    rating: 0,
    users: 0
  })
  const recentActivities = ref<ActivityItem[]>([])
  const loading = ref(false)
  const myEcosystem = ref<BrandEcosystem | null>(null)

  const fetchEcosystemStatus = async () => {
    try {
      const response = await $api<ApiResponse<BrandEcosystem>>('/api/ecosystem/my')
      if (response && response.success && response.data) {
        myEcosystem.value = response.data
      }
    } catch (err) {
      console.warn('Ecosystem status fetch failed:', err)
    }
  }

  const createDefaultEcosystem = async () => {
    if (confirm('Henüz bir Ekosisteminiz bulunmuyor. Şirket isminizle bir tane oluşturulsun mu?')) {
      try {
        const res = await $api<ApiResponse<BrandEcosystem>>('/api/ecosystem/create', {
          method: 'POST',
          body: {
            name: authStore.user?.vendor?.businessName || 'Marka Ekosistemim',
            description: 'Bayilerimiz için özel ürün ve kampanya kataloğudur.'
          }
        })
        if (res && res.success && res.data) {
          myEcosystem.value = res.data
          toast.success('Ekosisteminiz başarıyla oluşturuldu!')
          navigateTo(`/ecosystem/${res.data.id}`)
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Ekosistem oluşturulamadı'
        toast.error(error)
      }
    }
  }

  const fetchStats = async () => {
    loading.value = true
    try {
      const [statsRes, productsRes] = await Promise.all([
        $api<ApiResponse<Record<string, number>>>('/api/vendors/stats'),
        $api<ApiResponse<Product[]>>('/api/vendors/products', {
          query: { limit: 5 }
        })
      ])

      if (statsRes && statsRes.success && statsRes.data) {
        stats.value = {
          products: statsRes.data.totalProducts || 0,
          orders: statsRes.data.pendingOrders || 0,
          sales: statsRes.data.totalSales || 0,
          rating: statsRes.data.averageRating || 0,
          users: statsRes.data.totalUsers || 0
        }
      }

      if (productsRes && productsRes.success && productsRes.data) {
        recentActivities.value = productsRes.data.map((product) => ({
          id: `product-${product.id}`,
          title: 'Yeni ürün eklendi',
          description: product.name,
          status: 'Yayında',
          createdAt: String((product as Product & { createdAt?: string | Date }).createdAt || new Date().toISOString())
        })).sort((a: ActivityItem, b: ActivityItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
      }

    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      loading.value = false
    }
  }

  const refreshStats = async () => {
    await fetchStats()
    toast.success('İstatistikler güncellendi!')
  }

  return {
    stats, recentActivities, loading, myEcosystem,
    fetchStats, fetchEcosystemStatus, createDefaultEcosystem, refreshStats
  }
}
