import { useApi } from '~/services/api'
import type { ApiResponse, PaginatedResponse } from '@barterborsa/shared-types'
import type { AdminOrder, AdminVendor } from '@barterborsa/shared-types'

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
    async getOrders(params: AdminOrderFilterParams = {}): Promise<PaginatedResponse<AdminOrder>> {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value))
        }
      })
      return await $api<PaginatedResponse<AdminOrder>>(`/api/admin/orders?${query.toString()}`)
    },

    async getVendors(): Promise<ApiResponse<AdminVendor[]>> {
      return await $api<ApiResponse<AdminVendor[]>>('/api/admin/vendors')
    },

    async bulkUpdateStatus(ids: (string | number)[], status: string): Promise<ApiResponse<void>> {
      return await $api<ApiResponse<void>>('/api/admin/orders/bulk-status', {
        method: 'PATCH',
        body: { ids, status }
      })
    }
  }
}
