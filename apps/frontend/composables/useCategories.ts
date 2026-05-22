import { useApi } from '~/composables/useApi'
import type { Category, ApiResponse } from '@barterborsa/shared-types'

export const useCategories = () => {
    const { $api } = useApi()
    
    return useAsyncData('mega-menu', async () => {
        const response = await $api<Category[]>('/api/v1/categories/mega-menu')
        return (response.data || []) as Category[]
    }, {
        lazy: true,
        server: false,
        transform: (data: Category[]) => data
    })
}
