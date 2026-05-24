import { ref, reactive, computed } from 'vue'
import { useApi } from './useApi'

export const useAdminAdvertising = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const campaigns = ref<any[]>([])
  const bannerAds = ref<any[]>([])
  const loading = ref(false)
  const selectedAd = ref<any>(null)
  const isRejecting = ref(false)
  const activeTab = ref('PRODUCT_ADS')
  const activeFilter = ref('ALL')
  const searchQuery = ref('')

  const stats = reactive({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpend: 0,
    totalImpressions: 0,
    totalPlatformRevenue: 0
  })

  /**
   * Fetches all ad campaigns and filters them into categories
   */
  const fetchCampaigns = async () => {
    loading.value = true
    try {
      // Fix: Corrected API path to match AdvertisingAdminController
      const res = await $api<any>('/api/v1/admin/ads/campaigns')
      console.log('[useAdminAdvertising] fetchCampaigns response:', JSON.stringify(res, null, 2))
      const allAds = res.data || []
      
      // Separate product ads (including Ad-Swap) and banner ads (API uses 'type', not 'adType')
      campaigns.value = allAds.filter((ad: any) => ad.type !== 'BANNER' && ad.type !== 'SIDE_AD')
      bannerAds.value = allAds.filter((ad: any) => ad.type === 'BANNER' || ad.type === 'SIDE_AD')
      
      // Update Stats
      stats.totalCampaigns = allAds.length
      stats.activeCampaigns = allAds.filter((c: any) => c.status === 'ENABLED').length
      stats.totalSpend = allAds.reduce((acc: number, c: any) => {
        const spent = parseFloat(c.budget) - parseFloat(c.remainingBudget)
        return acc + (isNaN(spent) ? 0 : spent)
      }, 0)
      stats.totalPlatformRevenue = stats.totalSpend // Simplification
    } catch (e) {
      console.error('[useAdminAdvertising] fetchCampaigns error:', JSON.stringify(e, null, 2))
      $toast.error('Reklam kampanyaları yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  // Wrapper to match component expectations
  const fetchBanners = async () => {
    return fetchCampaigns()
  }

  const filteredCampaigns = computed(() => {
    let filtered = [...campaigns.value]
    if (activeFilter.value !== 'ALL') {
      filtered = filtered.filter(c => c.status === activeFilter.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(q) || 
        c.vendor?.businessName?.toLowerCase().includes(q)
      )
    }
    return filtered
  })

  const filteredBanners = computed(() => {
    let filtered = [...bannerAds.value]
    // Filter logic can be added here if needed
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(b => 
        b.name?.toLowerCase().includes(q) || 
        b.vendor?.businessName?.toLowerCase().includes(q)
      )
    }
    return filtered
  })

  const updateStatus = async (id: string, status: string) => {
    try {
      console.log('[useAdminAdvertising] updateStatus called:', { id, status })
      if (status === 'ENABLED') {
        const res = await $api(`/api/v1/admin/ads/campaigns/${id}/approve`, { method: 'POST' })
        console.log('[useAdminAdvertising] approve response:', JSON.stringify(res, null, 2))
        $toast.success('Reklam onaylandı')
      } else if (status === 'REJECTED') {
        // Handled by rejectAd
      }
      await fetchCampaigns()
    } catch (e) {
      console.error('[useAdminAdvertising] updateStatus error:', JSON.stringify(e, null, 2))
      $toast.error('İşlem başarısız')
    }
  }

  const updateBannerStatus = async (id: string, status: string) => {
    return updateStatus(id, status)
  }

  const rejectAd = async (id: string, reason: string, isBanner: boolean = false) => {
    try {
      console.log('[useAdminAdvertising] rejectAd called:', { id, reason, isBanner })
      const res = await $api(`/api/v1/admin/ads/campaigns/${id}/reject`, {
        method: 'POST',
        body: { reason }
      })
      console.log('[useAdminAdvertising] reject response:', JSON.stringify(res, null, 2))
      $toast.success('Reklam reddedildi')
      selectedAd.value = null
      await fetchCampaigns()
    } catch (e) {
      console.error('[useAdminAdvertising] rejectAd error:', JSON.stringify(e, null, 2))
      $toast.error('Red işlemi başarısız')
    }
  }

  return {
    campaigns, 
    bannerAds, 
    loading, 
    selectedAd,
    isRejecting,
    activeTab, 
    activeFilter,
    searchQuery,
    stats,
    fetchCampaigns, 
    fetchBanners,
    updateStatus, 
    updateBannerStatus,
    rejectAd,
    filteredCampaigns,
    filteredBanners
  }
}
