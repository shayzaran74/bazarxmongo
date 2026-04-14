import { useApi } from '~/services/api'
import type { ApiResponse } from '@barterborsa/shared-types'
import type { Brand } from '@barterborsa/shared-types'

export const useBrandService = () => {
  const { $api } = useApi()

  return {
    async getBrands(): Promise<ApiResponse<Brand[]>> {
      return await $api<ApiResponse<Brand[]>>('/api/brands')
    },

    async getBrandBySlug(slug: string): Promise<ApiResponse<Brand>> {
      return await $api<ApiResponse<Brand>>(`/api/brands/public/${slug}`)
    }
  }
}
