import { useApi } from '~/composables/useApi'
import { useVendorService } from '~/services/api/VendorService'
import type { ApiResponse, BrandEcosystem, Product, Vendor } from '@barterborsa/shared-types'
import { useNuxtApp, navigateTo, useAuthStore } from '#imports'

export interface VendorStats {
  products: number
  orders: number
  sales: number
  rating: number
  users: number
  pendingOrders: number
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

export const useVendorDashboard = () => {
  const { $api } = useApi()
  const vendorService = useVendorService()
  const authStore = useAuthStore()
  const { $toast: toast } = useNuxtApp()

  const stats = ref<VendorStats>({
    products: 0,
    orders: 0,
    sales: 0,
    rating: 0,
    users: 0,
    pendingOrders: 0
  })
  const recentActivities = ref<ActivityItem[]>([])
  const loading = ref(false)
  const myEcosystem = ref<BrandEcosystem | null>(null)

  const fetchEcosystemStatus = async () => {
    try {
      const response = await $api<BrandEcosystem>('/api/ecosystem/my')
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
        const res = await $api<BrandEcosystem>('/api/ecosystem/create', {
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
      } catch (err: any) {
        toast.error(err.data?.message || 'Ekosistem oluşturulamadı')
      }
    }
  }

  const fetchStats = async () => {
    loading.value = true
    try {
      const [dashboardRes, productsRes] = await Promise.all([
        vendorService.getDashboard(),
        vendorService.getMyListings({ limit: 5 })
      ])

      if (dashboardRes.success && dashboardRes.data) {
        const d = dashboardRes.data
        stats.value = {
          products: d.activeListings || 0,
          orders: d.orderCount || 0,
          sales: d.totalSales || 0,
          rating: d.rating || 0,
          users: 0, // Not provided by dashboard DTO yet
          pendingOrders: d.recentOrders?.length || 0
        }
      }

      if (productsRes.success && productsRes.data) {
        const productsItems = (productsRes.data as any).items || (productsRes.data as any).data || productsRes.data || [];
        recentActivities.value = productsItems.map((item: any) => ({
          id: `listing-${item.id}`,
          title: 'Yeni ürün eklendi',
          description: item.name,
          status: 'Yayında',
          createdAt: item.createdAt
        })).slice(0, 5)
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
