import { useApi } from '~/services/api'

export const useWantedItemService = () => {
    const { $api } = useApi()
    return {
        getMyItems: () => $api('/api/wanted-items/me'),
        getItem: (id: string) => $api(`/api/wanted-items/${id}`),
        createItem: (data: Record<string, unknown>) => $api('/api/wanted-items', { method: 'POST', body: data }),
        updateItem: (id: string, data: Record<string, unknown>) => $api(`/api/wanted-items/${id}`, { method: 'PUT', body: data }),
        deleteItem: (id: string) => $api(`/api/wanted-items/${id}`, { method: 'DELETE' }),
    }
}
