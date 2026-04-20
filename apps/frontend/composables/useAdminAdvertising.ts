import { ref, computed } from 'vue'

export const useAdminAdvertising = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const campaigns = ref<any[]>([])
  const banners = ref<any[]>([])
  const stats = ref({ activeCount: 0, pendingCount: 0, totalPlatformRevenue: 0 })
  const activeTab = ref('PRODUCT_ADS')
  const activeFilter = ref('ALL')
  const activeBannerFilter = ref('ALL')
  const searchQuery = ref('')

  const fetchAll = async () => {
    try {
      const [cRes, sRes, bRes]: any[] = await Promise.all([
        $api('/api/admin/ads'),
        $api('/api/admin/ads/stats'),
        $api('/api/admin/vendor-banners')
      ])
      if (cRes.success) campaigns.value = cRes.data
      if (sRes.success) stats.value = sRes.stats
      if (bRes.success) banners.value = bRes.data
    } catch (err) {
      $toast.error('Reklam verileri yüklenemedi')
    }
  }

  const updateAdStatus = async (id: string, status: string, reason: string | null = null) => {
    try {
      const res = await $api(`/api/admin/ads/${id}/status`, {
        method: 'PATCH',
        body: { status, rejectionReason: reason }
      })
      if (res.success) {
        $toast.success('Reklam durumu güncellendi')
        await fetchAll()
        return true
      }
    } catch { $toast.error('Güncelleme hatası') }
    return false
  }

  const updateBannerStatus = async (id: string, status: string, reason: string | null = null) => {
    try {
      const res = await $api(`/api/admin/vendor-banners/${id}/status`, {
        method: 'PATCH',
        body: { status, rejectionReason: reason }
      })
      if (res.success) {
        $toast.success('Banner durumu güncellendi')
        await fetchAll()
        return true
      }
    } catch { $toast.error('Banner güncelleme hatası') }
    return false
  }

  const filteredCampaigns = computed(() => {
    let res = campaigns.value
    if (activeFilter.value !== 'ALL') res = res.filter(c => c.status === activeFilter.value)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      res = res.filter(c => c.name.toLowerCase().includes(q) || (c.vendor?.businessName || '').toLowerCase().includes(q))
    }
    return res
  })

  const filteredBanners = computed(() => {
    let res = banners.value
    if (activeBannerFilter.value !== 'ALL') res = res.filter(b => b.status === activeBannerFilter.value)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      res = res.filter(b => (b.vendor?.businessName || '').toLowerCase().includes(q))
    }
    return res
  })

  return {
    campaigns, banners, stats, activeTab, activeFilter, activeBannerFilter, searchQuery,
    filteredCampaigns, filteredBanners,
    fetchAll, updateAdStatus, updateBannerStatus
  }
}
