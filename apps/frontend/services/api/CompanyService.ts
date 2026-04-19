import { useApi } from '~/services/api'

export const useCompanyService = () => {
    const { $api } = useApi()
    return {
        getMyCompany: () => $api('/api/companies/me'),
        updateCompany: (data: Record<string, unknown>) => $api('/api/companies/me', { method: 'PUT', body: data }),
    }
}
