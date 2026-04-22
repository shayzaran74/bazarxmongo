export const useAdminAdvertising = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const campaigns = ref<any[]>([])
  const bannerAds = ref<any[]>([])
  const loading = ref(false)
  const selectedCampaign = ref<any>(null)
  const showDetailModal = ref(false)
  const activeTab = ref<'campaigns' | 'banners'>('campaigns')

  const stats = reactive({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpend: 0,
    totalImpressions: 0,
  })

  const fetchCampaigns = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/admin/ad-campaigns')
      campaigns.value = res.data || []
      stats.totalCampaigns = campaigns.value.length
      stats.activeCampaigns = campaigns.value.filter(
        (c: any) => c.adStatus === 'ACTIVE'
      ).length
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const approveCampaign = async (id: string) => {
    try {
      await $api(`/api/admin/ad-campaigns/${id}/approve`, { method: 'POST' })
      $toast.success('Kampanya onaylandı')
      fetchCampaigns()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectCampaign = async (id: string, reason: string) => {
    try {
      await $api(`/api/admin/ad-campaigns/${id}/reject`, {
        method: 'POST',
        body: { rejectionReason: reason }
      })
      $toast.success('Kampanya reddedildi')
      fetchCampaigns()
    } catch {
      $toast.error('Reddedilemedi')
    }
  }

  const init = async () => {
    await fetchCampaigns()
  }

  return {
    campaigns, bannerAds, loading, selectedCampaign,
    showDetailModal, activeTab, stats,
    fetchCampaigns, approveCampaign, rejectCampaign, init,
  }
}
