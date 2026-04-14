import { useApi } from '~/services/api'
import type { ApiResponse, PaginatedResponse, Vendor, Product } from '@barterborsa/shared-types'

export const useVendorService = () => {
    const { $api } = useApi()

    return {
        async getVendors(params: Record<string, unknown> = {}): Promise<ApiResponse<Vendor[]>> {
            return $api<ApiResponse<Vendor[]>>('/api/vendors', { params })
        },

        async getVendor(vendorId: string): Promise<ApiResponse<Vendor>> {
            return $api<ApiResponse<Vendor>>(`/api/vendors/${vendorId}`)
        },

        async getVendorPublic(vendorIdOrSlug: string): Promise<ApiResponse<Vendor>> {
            return $api<ApiResponse<Vendor>>(`/api/vendors/public/${vendorIdOrSlug}`)
        },

        async getVendorProducts(vendorId: string | number, params: Record<string, unknown> = {}): Promise<PaginatedResponse<Product>> {
            return $api<PaginatedResponse<Product>>('/api/products', { params: { vendorId, ...params } })
        },

        async followVendor(vendorId: string | number): Promise<ApiResponse<unknown>> {
            return $api<ApiResponse<unknown>>(`/api/vendors/${vendorId}/follow`, { method: 'POST' })
        },

        async unfollowVendor(vendorId: string | number): Promise<ApiResponse<unknown>> {
            return $api<ApiResponse<unknown>>(`/api/vendors/${vendorId}/follow`, { method: 'DELETE' })
        },

        async checkFollowStatus(vendorId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
            return $api(`/api/vendors/${vendorId}/is-following`)
        }
    }
}
