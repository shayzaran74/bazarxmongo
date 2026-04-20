import { useAuthStore } from '~/stores/auth'

interface UtmParams {
    source?: string
    medium?: string
    campaign?: string
}

export const useAnalytics = () => {
    const config = useRuntimeConfig()
    const route = useRoute()
    const { $api } = useApi()

    const getSessionId = (): string | null => {
        if (process.server) return null
        let sid = sessionStorage.getItem('analytics_sid')
        if (!sid) {
            sid = 'sid_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
            sessionStorage.setItem('analytics_sid', sid)
        }
        return sid
    }

    const captureUtmParams = (): void => {
        if (process.server) return
        const query = route.query
        const utmParams: UtmParams = {
            source:   (query.utm_source  || query.source)   as string | undefined,
            medium:   (query.utm_medium  || query.medium)   as string | undefined,
            campaign: (query.utm_campaign || query.campaign) as string | undefined,
        }
        if (utmParams.source || utmParams.medium || utmParams.campaign) {
            const current: UtmParams = JSON.parse(sessionStorage.getItem('utm_params') || '{}')
            const newParams = { ...current, ...utmParams }
            Object.keys(newParams).forEach(k => {
                if ((newParams as Record<string, unknown>)[k] === undefined)
                    delete (newParams as Record<string, unknown>)[k]
            })
            sessionStorage.setItem('utm_params', JSON.stringify(newParams))
        }
    }

    const track = async (eventType: string, metadata: Record<string, unknown> = {}): Promise<void> => {
        if (process.server) return
        try {
            const sid = getSessionId()
            const utm: UtmParams = JSON.parse(sessionStorage.getItem('utm_params') || '{}')
            await $api('/api/analytics/track', {
                method: 'POST',
                body: {
                    eventType, sessionId: sid,
                    url: window.location.pathname,
                    referrer: document.referrer,
                    source: utm.source ?? null,
                    medium: utm.medium ?? null,
                    campaign: utm.campaign ?? null,
                    metadata
                }
            })
        } catch (error: unknown) {
            console.error('Analytics error:', error)
        }
    }

    const getRealTimeStats     = () => $api('/api/analytics/realtime')
    const getCampaignPerformance = () => $api('/api/analytics/campaigns')
    const getChannelBreakdown  = () => $api('/api/analytics/channels')
    const getUserTrends        = () => $api('/api/analytics/trends')

    const createCampaign = (data: Record<string, unknown>) =>
        $api('/api/analytics/campaigns', { method: 'POST', body: data })

    const updateCampaign = (id: string, data: Record<string, unknown>) =>
        $api(`/api/analytics/campaigns/${id}`, { method: 'PUT', body: data })

    const deleteCampaign = (id: string) =>
        $api(`/api/analytics/campaigns/${id}`, { method: 'DELETE' })

    return {
        track, captureUtmParams,
        getRealTimeStats, getCampaignPerformance, getChannelBreakdown, getUserTrends,
        createCampaign, updateCampaign, deleteCampaign
    }
}
