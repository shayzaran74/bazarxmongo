import { useApi } from '~/services/api'
import type { ApiResponse, LegalDocument } from '@barterborsa/shared-types'

export const useLegalService = () => {
  const { $api } = useApi()

  return {
    getPolicy: (slug: string) => $api<ApiResponse<LegalDocument>>(`/api/dynamic/policies/${slug}`),
    async getLegalDocuments() {
      return await $api<ApiResponse<LegalDocument[]>>('/api/legal')
    }
  }
}
