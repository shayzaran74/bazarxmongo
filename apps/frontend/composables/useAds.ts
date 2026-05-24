// apps/frontend/composables/useAds.ts

interface AdCampaign {
  id: string
  name?: string
  adType?: string
  adStatus?: string
  budget?: number
  remainingBudget?: number
  startDate?: string
  endDate?: string
  imageUrl?: string
  linkUrl?: string
  platform?: string
  [key: string]: unknown
}

interface SideAd {
  id: string
  side?: string
  title?: string
  subtitle?: string
  image?: string
  emoji?: string
  link?: string
  order?: number
  category?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
}

export const useAds = () => {
  const { $api } = useApi()

  const ads      = ref<AdCampaign[]>([])
  const sideAds  = ref<SideAd[]>([])
  const loading  = ref(false)

  // Slot bazlı reklam listesi — GET /api/v1/ads/slot/:slotType
  const fetchAds = async (params: Record<string, unknown> | string = {}): Promise<void> => {
    loading.value = true
    try {
      const query    = typeof params === 'string' ? { slot: params } : params
      const slotType = (query.slot as string) || 'HOMEPAGE_BANNER'
      const platform = (query.platform as string) || 'BAZARX'
      const res      = await $api<ApiResponse<AdCampaign[]>>(
        `/api/v1/ads/slot/${slotType}`,
        { query: { platform } },
      )
      ads.value = (res as ApiResponse<AdCampaign[]>).data ?? []
    } catch { /* hata filtresi tarafından işlenir */ } finally {
      loading.value = false
    }
  }

  // Vendor'un kendi kampanyaları — GET /api/v1/vendors/me/campaigns
  const fetchCampaigns = async (): Promise<ApiResponse<AdCampaign[]>> => {
    loading.value = true
    try {
      const res = await $api<ApiResponse<AdCampaign[]>>('/api/v1/vendors/me/campaigns')
      console.log('[useAds] fetchCampaigns raw response:', JSON.stringify(res, null, 2))
      ads.value = res.data ?? []
      return res
    } catch (e) {
      console.error('[useAds] fetchCampaigns error:', e)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // Yeni kampanya oluştur — POST /api/v1/vendors/me/campaigns
  const createAdCampaign = async (data: Record<string, unknown>): Promise<ApiResponse<{ id: string }>> => {
    try {
      console.log('[useAds] createAdCampaign payload:', JSON.stringify(data, null, 2))
      const res = await $api<ApiResponse<{ id: string }>>('/api/v1/vendors/me/campaigns', {
        method: 'POST',
        body:   data,
      })
      console.log('[useAds] createAdCampaign response:', JSON.stringify(res, null, 2))
      return res
    } catch (e) {
      console.error('[useAds] createAdCampaign error:', e)
      return { success: false }
    }
  }

  // Kampanya güncelle — admin endpoint üzerinden (approve/reject dışı update mevcut değil)
  const updateAdCampaign = async (id: string, data: Record<string, unknown>): Promise<{ success: boolean }> => {
    try {
      await $api(`/api/v1/admin/ads/campaigns/${id}`, { method: 'PATCH', body: data })
      return { success: true }
    } catch { return { success: false } }
  }

  // Kampanya sil
  const deleteAdCampaign = async (id: string): Promise<{ success: boolean }> => {
    try {
      await $api(`/api/v1/admin/ads/campaigns/${id}`, { method: 'DELETE' })
      return { success: true }
    } catch { return { success: false } }
  }

  // Banner yükle — POST /api/v1/upload
  const uploadBanner = async (file: File): Promise<ApiResponse<{ url?: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      console.log('[useAds] uploadBanner file:', file.name, 'size:', file.size)
      const res = await $api<ApiResponse<{ url?: string }>>('/api/v1/upload?type=product', {
        method: 'POST',
        body:   formData,
      })
      console.log('[useAds] uploadBanner response:', JSON.stringify(res, null, 2))
      return res
    } catch (e) {
      console.error('[useAds] uploadBanner error:', e)
      return { success: false }
    }
  }

  // Yan panel reklamları — GET /api/v1/settings/side-ads
  const fetchSideAds = async (side?: 'left' | 'right'): Promise<void> => {
    try {
      const res = await $api<ApiResponse<SideAd[]>>(
        '/api/v1/settings/side-ads',
        { query: side ? { side } : {} },
      )
      sideAds.value = res.data ?? []
    } catch { /* hata filtresi tarafından işlenir */ }
  }

  // Görüntülenme izle — POST /api/v1/ads/:id/impression
  const trackImpression = async (adId: string): Promise<void> => {
    try {
      await $api(`/api/v1/ads/${adId}/impression`, { method: 'POST' })
    } catch { /* hata filtresi tarafından işlenir */ }
  }

  // Tıklanma izle — POST /api/v1/ads/:id/click
  const trackClick = async (adId: string): Promise<void> => {
    try {
      await $api(`/api/v1/ads/${adId}/click`, { method: 'POST' })
    } catch { /* hata filtresi tarafından işlenir */ }
  }

  // Kampanya özeti (kampanya listesi üzerinden hesaplanır)
  const getAdSummary = async (days: number = 30): Promise<ApiResponse<Record<string, unknown>>> => {
    try {
      return await $api<ApiResponse<Record<string, unknown>>>(`/api/v1/vendors/ads/summary`, {
        query: { days },
      })
    } catch { return { success: false, data: {} } }
  }

  // Banner listesi (kampanyalardan filtrele)
  const fetchBanners = async (_params: Record<string, unknown> = {}): Promise<ApiResponse<AdCampaign[]>> => {
    const res = await fetchCampaigns()
    const banners = (res.data ?? []).filter(c => c.adType === 'BANNER')
    return { success: res.success, data: banners }
  }

  return {
    ads, sideAds, loading,
    fetchAds, fetchCampaigns, createAdCampaign, updateAdCampaign, deleteAdCampaign,
    uploadBanner, fetchSideAds, trackImpression, trackClick, recordClick: trackClick,
    updateBanner: updateAdCampaign, createBanner: createAdCampaign,
    getAdSummary, fetchBanners,
  }
}
