import { useApi } from '~/services/api'
import type { ApiResponse } from '@barterborsa/shared-types'

export interface Address {
  id: string
  userId: string
  title: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  district: string
  neighborhood?: string
  postalCode?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface AddressResponse extends ApiResponse {
  addresses?: Address[]
  address?: Address
}

export const useAddressService = () => {
  const { $api } = useApi()

  return {
    async getAddresses(): Promise<AddressResponse> {
      return await $api('/api/addresses')
    },
    async createAddress(data: Record<string, unknown>): Promise<AddressResponse> {
      return await $api('/api/addresses', {
        method: 'POST',
        body: data
      })
    },
    async updateAddress(id: string | number, data: Record<string, unknown>): Promise<AddressResponse> {
      return await $api(`/api/addresses/${id}`, {
        method: 'PUT',
        body: data
      })
    },
    async deleteAddress(id: string | number): Promise<AddressResponse> {
      return await $api(`/api/addresses/${id}`, {
        method: 'DELETE'
      })
    },
    async setDefaultAddress(id: string | number): Promise<AddressResponse> {
      return await $api(`/api/addresses/${id}/default`, {
        method: 'POST'
      })
    }
  }
}
