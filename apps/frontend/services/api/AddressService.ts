import { useApi } from '~/services/api'
import type { ApiResponse, Address } from '@barterborsa/shared-types'

export const useAddressService = () => {
  const { $api } = useApi()

  return {
    async getAddresses(): Promise<ApiResponse<Address[]>> {
      return await $api<Address[]>('/api/addresses')
    },
    async createAddress(data: Partial<Address>): Promise<ApiResponse<Address>> {
      return await $api<Address>('/api/addresses', {
        method: 'POST',
        body: data
      })
    },
    async updateAddress(id: string | number, data: Partial<Address>): Promise<ApiResponse<Address>> {
      return await $api<Address>(`/api/addresses/${id}`, {
        method: 'PUT',
        body: data
      })
    },
    async deleteAddress(id: string | number): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/addresses/${id}`, {
        method: 'DELETE'
      })
    },
    async setDefaultAddress(id: string | number): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/addresses/${id}/default`, {
        method: 'POST'
      })
    }
  }
}
