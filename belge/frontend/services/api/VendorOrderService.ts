import { useApi } from '~/services/api'
import type { ApiResponse } from '@barterborsa/shared-types'

export interface VendorOrderListItem {
  id: string | number
  orderNumber: string
  status: string
  createdAt: string
  totalAmount: number
  User?: {
    name: string
    email: string
    phone?: string
  }
  Address?: {
    fullName: string
    addressLine: string
    city: string
    district: string
    postalCode: string
    phone: string
  }
  shippingAddress?: string
  OrderItem: Array<{
    id: string | number
    quantity: number
    price: number
    status?: string
    trackingNumber?: string
    shippingCarrier?: string
    Listing?: {
      CatalogProduct?: {
        name: string
        images: string[]
      }
    }
  }>
  packingVideoUrl?: string
  packingPhotoUrl?: string
}

export const useVendorOrderService = () => {
  const { $api } = useApi()

  return {
    async getOrders(): Promise<ApiResponse<VendorOrderListItem[]>> {
      return await $api<ApiResponse<VendorOrderListItem[]>>('/api/vendors/orders')
    },

    async updateItemShipping(itemId: string | number, data: { status?: string, trackingNumber?: string, shippingCarrier?: string }): Promise<ApiResponse<unknown>> {
      return await $api<ApiResponse<unknown>>(`/api/vendors/orders/items/${itemId}/shipping`, {
        method: 'PATCH',
        body: data
      })
    },

    async saveDispatchProof(orderId: string | number, data: { packingVideoUrl?: string, packingPhotoUrl?: string }): Promise<ApiResponse<unknown>> {
      return await $api<ApiResponse<unknown>>(`/api/returns/${orderId}/dispatch-proof`, {
        method: 'POST',
        body: data
      })
    }
  }
}
