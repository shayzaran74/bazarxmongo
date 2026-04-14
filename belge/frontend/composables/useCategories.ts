import { useApi } from '~/composables/useApi'
import type { Category, ApiResponse } from '@barterborsa/shared-types'

export const useCategories = () => {
    const { $api } = useApi()
    
    return useAsyncData('mega-menu', async () => {
        const response = await $api<ApiResponse<Category[]>>('/api/categories/mega-menu')
        return response.success ? response.data : []
    }, {
        lazy: true,
        server: false, // only for client-side
        transform: (data: Category[]) => data
    })
}
