import { useApi } from '~/services/api'
import type { ApiResponse } from '@barterborsa/shared-types'
import type { Category } from '@barterborsa/shared-types'

export const useCategoryService = () => {
  const { $api } = useApi()

  return {
    async getCategories(params: Record<string, string | number | boolean> = {}): Promise<ApiResponse<Category[]>> {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value))
        }
      })
      return await $api<ApiResponse<Category[]>>(`/api/categories?${query.toString()}`)
    }
  }
}
