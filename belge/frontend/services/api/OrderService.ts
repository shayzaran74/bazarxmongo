import { useApi } from '~/services/api'
import type { ApiResponse, Order } from '@barterborsa/shared-types'

export const useOrderService = () => {
    const { $api } = useApi()
    
    return {
        async getOrder(id: string | number): Promise<ApiResponse<Order>> {
            return await $api<ApiResponse<Order>>(`/api/orders/${id}`)
        },
        async getMyOrders(params: Record<string, unknown> = {}): Promise<ApiResponse<Order[]>> {
            return await $api<ApiResponse<Order[]>>('/api/orders', { params })
        },
        async cancelOrder(id: string | number, reason?: string): Promise<ApiResponse<void>> {
            return await $api<ApiResponse<void>>(`/api/orders/${id}/cancel`, { 
                method: 'POST', 
                body: { reason } 
            })
        },
        async getPaymentStatus(paymentIntentId: string): Promise<ApiResponse<{ status: string }>> {
            return await $api<ApiResponse<{ status: string }>>(`/api/payment/status/${paymentIntentId}`)
        },
    }
}
