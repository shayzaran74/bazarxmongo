import { useApi } from '~/composables/useApi'
import type { ApiResponse } from '@barterborsa/shared-types'

export const useAds = () => {
    const { $api } = useApi()

    const fetchAds = (params: Record<string, unknown> = {}) =>
        $api<ApiResponse<unknown[]>>('/api/ads', { query: params })

    const createAdCampaign = (data: FormData | Record<string, unknown>) =>
        $api<ApiResponse<unknown>>('/api/ads', { method: 'POST', body: data })

    const getAdCampaign = (id: string) =>
        $api<ApiResponse<unknown>>(`/api/ads/${id}`)

    const updateAdCampaign = (id: string, data: Record<string, unknown>) =>
        $api<ApiResponse<unknown>>(`/api/ads/${id}`, { method: 'PUT', body: data })

    const deleteAdCampaign = (id: string) =>
        $api<ApiResponse<void>>(`/api/ads/${id}`, { method: 'DELETE' })

    const getAdSummary = (period: number = 30) =>
        $api<ApiResponse<unknown>>('/api/ads/dashboard/summary', { query: { period } })

    const seedDemoAds = () =>
        $api<ApiResponse<unknown>>('/api/ads/seed-demo', { method: 'POST' })

    const fetchBanners = (params: Record<string, unknown> = {}) =>
        $api<ApiResponse<unknown[]>>('/api/vendor-banners', { query: params })

    const createBanner = (data: Record<string, unknown>) =>
        $api<ApiResponse<unknown>>('/api/vendor-banners', { method: 'POST', body: data })

    const updateBanner = (id: string, data: Record<string, unknown>) =>
        $api<ApiResponse<unknown>>(`/api/vendor-banners/${id}`, { method: 'PUT', body: data })

    const uploadBanner = (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return $api<ApiResponse<{ url: string }>>('/api/vendor-banners/upload', { method: 'POST', body: formData })
    }

    const recordClick = (productId: string) => {
        $api('/api/ad-metrics/click', { method: 'POST', body: { productId } })
            .catch((err: unknown) => console.error('Click tracking failed', err))
    }

    return {
        fetchAds, createAdCampaign, getAdCampaign, updateAdCampaign,
        deleteAdCampaign, getAdSummary, seedDemoAds, fetchBanners,
        createBanner, updateBanner, uploadBanner, recordClick
    }
}
