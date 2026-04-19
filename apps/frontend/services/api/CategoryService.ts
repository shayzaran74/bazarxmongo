import { useApi } from '~/services/api'
import type { ApiResponse } from '@barterborsa/shared-types'
import type { Category } from '@barterborsa/shared-types'

export const useCategoryService = () => {
  const { $api } = useApi()

  return {
    async getCategories(params: Record<string, any> = {}): Promise<ApiResponse<Category[]>> {
      return await $api<Category[]>('/api/categories', { query: params })
    }
  }
}
