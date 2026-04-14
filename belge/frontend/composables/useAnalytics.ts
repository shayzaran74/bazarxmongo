import { useAuthStore } from '~/stores/auth'

interface UtmParams {
    source?: string
    medium?: string
    campaign?: string
}

export const useAnalytics = () => {
    const config = useRuntimeConfig()
    const route = useRoute()

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
            await $fetch('/api/analytics/track', {
                method: 'POST',
                baseURL: config.public.apiBase as string,
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

    const authHeader = () => ({
        Authorization: `Bearer ${useAuthStore().token}`
    })

    const base = config.public.apiBase as string

    const getRealTimeStats     = () => $fetch('/api/analytics/realtime',  { baseURL: base, headers: authHeader() })
    const getCampaignPerformance = () => $fetch('/api/analytics/campaigns', { baseURL: base, headers: authHeader() })
    const getChannelBreakdown  = () => $fetch('/api/analytics/channels',  { baseURL: base, headers: authHeader() })
    const getUserTrends        = () => $fetch('/api/analytics/trends',    { baseURL: base, headers: authHeader() })

    const createCampaign = (data: Record<string, unknown>) =>
        $fetch('/api/analytics/campaigns', { method: 'POST', body: data, baseURL: base, headers: authHeader() })

    const updateCampaign = (id: string, data: Record<string, unknown>) =>
        $fetch(`/api/analytics/campaigns/${id}`, { method: 'PUT', body: data, baseURL: base, headers: authHeader() })

    const deleteCampaign = (id: string) =>
        $fetch(`/api/analytics/campaigns/${id}`, { method: 'DELETE', baseURL: base, headers: authHeader() })

    return {
        track, captureUtmParams,
        getRealTimeStats, getCampaignPerformance, getChannelBreakdown, getUserTrends,
        createCampaign, updateCampaign, deleteCampaign
    }
}
