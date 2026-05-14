export const useAds = () => {
  const { $api } = useApi()

  const ads = ref<any[]>([])
  const sideAds = ref<any[]>([])
  const loading = ref(false)

  const fetchAds = async (params: any = {}) => {
    loading.value = true
    try {
      const query = typeof params === 'string' ? { slot: params } : params
      const res = await $api<any>('/api/ads', { query })
      ads.value = res.data?.items || res.data || res || []
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const fetchCampaigns = async (): Promise<any> => {
    loading.value = true
    try {
      const res = await $api<any>('/api/vendors/ads/campaigns')
      ads.value = res.data || []
      return res
    } catch { return { success: false } } finally {
      loading.value = false
    }
  }

  const createAdCampaign = async (data: any): Promise<any> => {
    try {
      const res = await $api<any>('/api/vendors/ads/campaigns', {
        method: 'POST',
        body: data
      })
      return res
    } catch (e) { return { success: false } }
  }

  const updateAdCampaign = async (id: string, data: any) => {
    try {
      await $api(`/api/ads/${id}`, { method: 'PATCH', body: data })
      return { success: true }
    } catch { return { success: false } }
  }

  const deleteAdCampaign = async (id: string) => {
    try {
      await $api(`/api/ads/${id}`, { method: 'DELETE' })
      return { success: true }
    } catch { return { success: false } }
  }

  const uploadBanner = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await $api<any>('/api/v1/upload', {
        method: 'POST',
        body: formData
      })
      return res
    } catch { return { success: false } }
  }

  const fetchSideAds = async (side?: 'left' | 'right') => {
    try {
      const res = await $api<any>('/api/side-ads', { query: side ? { side } : {} })
      sideAds.value = res.data || res || []
    } catch { /* ignore */ }
  }

  const trackImpression = async (adId: string) => {
    try {
      await $api(`/api/ads/${adId}/impression`, { method: 'POST' })
    } catch { /* ignore */ }
  }

  const trackClick = async (adId: string) => {
    try {
      await $api(`/api/ads/${adId}/click`, { method: 'POST' })
    } catch { /* ignore */ }
  }

  const getAdSummary = async (days: number = 30): Promise<any> => {
    try {
      const res = await $api<any>(`/api/vendors/ads/summary`, { query: { days } })
      return res || { success: true, data: {} }
    } catch { return { success: false, data: {} } }
  }

  const fetchBanners = async (params: any = {}): Promise<any> => {
    try {
      const res = await $api<any>(`/api/vendors/ads/banners`, { query: params })
      return res || { success: true, data: [] }
    } catch { return { success: false, data: [] } }
  }

  return {
    ads, sideAds, loading,
    fetchAds, fetchCampaigns, createAdCampaign, updateAdCampaign, deleteAdCampaign,
    uploadBanner, fetchSideAds, trackImpression, trackClick, recordClick: trackClick,
    updateBanner: updateAdCampaign, createBanner: createAdCampaign,
    getAdSummary, fetchBanners
  }
}
