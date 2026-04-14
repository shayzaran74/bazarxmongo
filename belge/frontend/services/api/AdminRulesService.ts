import { useApi } from '~/services/api'

export const useAdminRulesService = () => {
    const { $api } = useApi()
    return {
        getXpDistributionRules: () => $api('/api/admin/rules/xp-distribution'),
        saveXpDistributionRule: (data: Record<string, unknown>) => $api('/api/admin/rules/xp-distribution', { method: 'POST', body: data }),
        getSpendingLimitRules: () => $api('/api/admin/rules/spending-limit'),
        saveSpendingLimitRule: (tier: string, data: Record<string, unknown>) => $api(`/api/admin/rules/spending-limit/${tier}`, { method: 'PUT', body: data }),
    }
}
