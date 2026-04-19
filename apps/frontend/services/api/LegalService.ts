import { useApi } from '~/services/api'
import type { ApiResponse, LegalDocument } from '@barterborsa/shared-types'

export const useLegalService = () => {
  const { $api } = useApi()

  return {
    getPolicy: (slug: string): Promise<ApiResponse<LegalDocument>> => $api<LegalDocument>(`/api/dynamic/policies/${slug}`),
    async getLegalDocuments(): Promise<ApiResponse<LegalDocument[]>> {
      return await $api<LegalDocument[]>('/api/legal')
    }
  }
}
