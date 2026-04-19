import { useApi } from '~/services/api'
import type { ApiResponse, PaginatedResponse, AdminOrder, AdminVendor } from '@barterborsa/shared-types'

export interface AdminOrderFilterParams {
  page?: number
  limit?: number
  status?: string
  vendorId?: string
  search?: string
}

export const useAdminOrderService = () => {
  const { $api } = useApi()

  return {
    async getOrders(params: AdminOrderFilterParams = {}): Promise<ApiResponse<PaginatedResponse<AdminOrder>>> {
      return await $api<PaginatedResponse<AdminOrder>>('/api/admin/orders', { query: params })
    },

    async getVendors(): Promise<ApiResponse<AdminVendor[]>> {
      return await $api<AdminVendor[]>('/api/admin/vendors')
    },

    async bulkUpdateStatus(ids: (string | number)[], status: string): Promise<ApiResponse<void>> {
      return await $api<void>('/api/admin/orders/bulk-status', {
        method: 'PATCH',
        body: { ids, status }
      })
    }
  }
}
