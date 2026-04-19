import { useApi } from '~/services/api'
import type { ApiResponse, AdminVendor } from '@barterborsa/shared-types'

export const useAdminVendorService = () => {
  const { $api } = useApi()

  return {
    async getVendors(): Promise<ApiResponse<AdminVendor[]>> {
      return await $api<AdminVendor[]>('/api/admin/vendors')
    },

    async approveVendor(vendorId: string | number): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/vendors/${vendorId}/approve`, {
        method: 'PUT'
      })
    },

    async rejectVendor(vendorId: string | number, rejectionReason: string): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/vendors/${vendorId}/reject`, {
        method: 'PUT',
        body: { rejectionReason }
      })
    },

    async toggleFeatured(vendorId: string | number, isFeatured: boolean): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/vendors/${vendorId}`, {
        method: 'PUT',
        body: { isFeatured }
      })
    },

    async updateB2BSettings(vendorId: string | number, payload: Record<string, unknown>): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/vendors/${vendorId}`, {
        method: 'PUT',
        body: payload
      })
    },

    async addCategory(vendorId: string | number, categoryId: string | number): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/vendors/${vendorId}/categories`, {
        method: 'POST',
        body: { categoryId }
      })
    },

    async removeCategory(vendorId: string | number, categoryId: string | number): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/vendors/${vendorId}/categories/${categoryId}`, {
        method: 'DELETE'
      })
    }
  }
}
