import { useApi } from '~/services/api'
import type { ApiResponse, Address } from '@barterborsa/shared-types'

export const useAddressService = () => {
  const { $api } = useApi()

  return {
    async getAddresses(): Promise<ApiResponse<Address[]>> {
      return await $api<Address[]>('/api/addresses')
    },
    async createAddress(data: Partial<Address>): Promise<ApiResponse<Address>> {
      const payload = this.mapToDto(data)
      return await $api<Address>('/api/addresses', {
        method: 'POST',
        body: payload
      })
    },
    async updateAddress(id: string | number, data: Partial<Address>): Promise<ApiResponse<Address>> {
      const payload = this.mapToDto(data)
      return await $api<Address>(`/api/addresses/${id}`, {
        method: 'PUT',
        body: payload
      })
    },
    mapToDto(data: Partial<Address>) {
      const names = (data.fullName || '').split(' ')
      const firstName = data.firstName || names[0] || 'İsimsiz'
      const lastName = data.lastName || names.slice(1).join(' ') || 'Soyisimsiz'
      
      const payload: any = {
        title: data.title || data.name || 'Adresim',
        firstName,
        lastName,
        phone: data.phone || '',
        addressLine1: data.addressLine || data.address || data.addressLine1 || '',
        city: data.city || '',
        district: data.district || '',
        isDefault: !!data.isDefault
      }

      if (data.addressLine2) payload.addressLine2 = data.addressLine2
      if ((data as any).neighborhood) payload.neighborhood = (data as any).neighborhood
      if ((data as any).postalCode) payload.postalCode = (data as any).postalCode

      return payload
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
