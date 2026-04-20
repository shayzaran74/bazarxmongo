import { ref, computed } from 'vue'

export const useAdminAdvertising = () => {
    const { $api } = useApi()
    const { $toast: toast } = useNuxtApp()

    const campaigns = ref<any[]>([])
    const banners = ref<any[]>([])
    const stats = ref<any>({
        activeCount: 0,
        pendingCount: 0,
        totalPlatformRevenue: 0
    })

    const activeTab = ref('PRODUCT_ADS')
    const activeFilter = ref('ALL')
    const activeBannerFilter = ref('ALL')
    const searchQuery = ref('')
    const selectedAd = ref<any>(null)
    const isRejecting = ref(false)

    const fetchCampaigns = async () => {
        try {
            const [res, statsRes]: [any, any] = await Promise.all([
                $api('/api/v1/admin/ads'),
                $api('/api/v1/admin/ads/stats')
            ])
            if (res.success) campaigns.value = res.data
            if (statsRes.success) stats.value = statsRes.stats
        } catch (err) {
            console.error('Fetch error:', err)
            toast.error('Veriler yüklenemedi')
        }
    }

    const fetchBanners = async () => {
        try {
            const res: any = await $api('/api/v1/admin/ads/banners')
            if (res.success) banners.value = res.data
        } catch (err) {
            console.error('Fetch banners error:', err)
            toast.error('Banner verileri yüklenemedi')
        }
    }

    const updateStatus = async (id: string | number, status: string) => {
        try {
            const res: any = await $api(`/api/v1/admin/ads/${id}/status`, {
                method: 'PATCH',
                body: { status }
            })
            if (res.success) {
                toast.success('Reklam durumu güncellendi')
                fetchCampaigns()
                if (selectedAd.value) selectedAd.value = null
            }
        } catch (err) {
            toast.error('Güncelleme başarısız')
        }
    }

    const updateBannerStatus = async (id: string | number, status: string) => {
        try {
            const res: any = await $api(`/api/v1/admin/ads/banners/${id}/status`, {
                method: 'PATCH',
                body: { status }
            })
            if (res.success) {
                toast.success('Banner durumu güncellendi')
                fetchBanners()
                if (selectedAd.value) selectedAd.value = null
            }
        } catch (err) {
            toast.error('Güncelleme başarısız')
        }
    }

    const rejectAd = async (id: string | number, reason: string, isBanner = false) => {
        try {
            const endpoint = isBanner ? `/api/v1/admin/ads/banners/${id}/reject` : `/api/v1/admin/ads/${id}/reject`
            const res: any = await $api(endpoint, {
                method: 'POST',
                body: { reason }
            })
            if (res.success) {
                toast.success('Reklam reddedildi')
                isBanner ? fetchBanners() : fetchCampaigns()
                selectedAd.value = null
                isRejecting.value = false
            }
        } catch (err) {
            toast.error('İşlem başarısız')
        }
    }

    const filteredCampaigns = computed(() => {
        let result = campaigns.value
        if (activeFilter.value !== 'ALL') {
            result = result.filter((c: any) => c.status === activeFilter.value)
        }
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter((c: any) =>
                c.name.toLowerCase().includes(query) ||
                (c.vendor?.businessName || '').toLowerCase().includes(query)
            )
        }
        return result
    })

    const filteredBanners = computed(() => {
        let result = banners.value
        if (activeBannerFilter.value !== 'ALL') {
            result = result.filter((b: any) => b.status === activeBannerFilter.value)
        }
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter((b: any) =>
                (b.vendor?.businessName || '').toLowerCase().includes(query)
            )
        }
        return result
    })

    return {
        campaigns,
        banners,
        stats,
        activeTab,
        activeFilter,
        activeBannerFilter,
        searchQuery,
        selectedAd,
        isRejecting,
        fetchCampaigns,
        fetchBanners,
        updateStatus,
        updateBannerStatus,
        rejectAd,
        filteredCampaigns,
        filteredBanners
    }
}
