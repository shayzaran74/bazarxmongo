import { useApi } from '~/services/api'
import type { ApiResponse, PaginatedResponse, Vendor, Product } from '@barterborsa/shared-types'

export interface VendorDashboardStats {
  totalSales: number;
  orderCount: number;
  activeListings: number;
  rating: number;
  recentOrders: any[];
}

export interface VendorAnalytics {
  stats: {
    totalRevenue: number;
    totalSalesCount: number;
    uniqueOrders: number;
    averageOrderValue: number;
  };
  topProducts: any[];
  chartData: any[];
  distribution: any[];
  returns: any[];
}

export const useVendorService = () => {
    const { $api } = useApi()

    return {
        // Consumer perspective
        async getVendors(params: Record<string, unknown> = {}): Promise<ApiResponse<Vendor[]>> {
            return $api<Vendor[]>('/api/vendors', { params })
        },

        async getVendor(vendorId: string): Promise<ApiResponse<Vendor>> {
            return $api<Vendor>(`/api/vendors/${vendorId}`)
        },

        async getVendorPublic(vendorIdOrSlug: string): Promise<ApiResponse<Vendor>> {
            return $api<Vendor>(`/api/vendors/public/${vendorIdOrSlug}`)
        },

        // Vendor perspective (Panel)
        async getMe(): Promise<ApiResponse<Vendor>> {
            return await $api<Vendor>('/api/vendors/me')
        },

        async getDashboard(): Promise<ApiResponse<VendorDashboardStats>> {
            return await $api<VendorDashboardStats>('/api/vendors/me/dashboard')
        },

        async getAnalytics(): Promise<ApiResponse<VendorAnalytics>> {
            return await $api<VendorAnalytics>('/api/vendors/analytics/dashboard')
        },

        async apply(data: any): Promise<ApiResponse<Vendor>> {
            return await $api<Vendor>('/api/vendors/apply', {
                method: 'POST',
                body: data
            })
        },

        async getMyListings(params: any = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
            return await $api<PaginatedResponse<any>>('/api/v1/listings', { query: { ...params, scope: 'vendor' } })
        },

        async createListing(data: any): Promise<ApiResponse<any>> {
            return await $api<any>('/api/v1/listings', {
                method: 'POST',
                body: data
            })
        },

        async updateListing(id: string, data: any): Promise<ApiResponse<any>> {
            return await $api<any>(`/api/v1/listings/${id}`, {
                method: 'PUT',
                body: data
            })
        },

        async getVendorProducts(vendorId: string | number, params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedResponse<Product>>> {
            // /api/v1/listings/marketplace?vendorId=X — RESTAURANT dahil tüm tipler için çalışır
            return $api<PaginatedResponse<Product>>('/api/v1/listings/marketplace', {
                query: { vendorId, ...params }
            })
        },

        async followVendor(vendorId: string | number): Promise<ApiResponse<unknown>> {
            return $api<unknown>(`/api/vendors/${vendorId}/follow`, { method: 'POST' })
        },

        async unfollowVendor(vendorId: string | number): Promise<ApiResponse<unknown>> {
            return $api<unknown>(`/api/vendors/${vendorId}/follow`, { method: 'DELETE' })
        },

        async checkFollowStatus(vendorId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
            return $api<{ isFollowing: boolean }>(`/api/vendors/${vendorId}/is-following`)
        },

        async importExcel(formData: FormData): Promise<ApiResponse<any>> {
            return await $api<any>('/api/vendors/inventory/import-excel', {
                method: 'POST',
                body: formData
            })
        },

        async importTrendyol(products: Record<string, unknown>[], defaultStock = 1): Promise<ApiResponse<{ results: { success: number; failed: number; errors: string[] } }>> {
            return await $api('/api/vendors/inventory/import-trendyol', {
                method: 'POST',
                body: { products, defaultStock }
            })
        },

        async downloadTemplate(): Promise<void> {
            const authStore = useAuthStore()
            // Proxy üzerinden çekmek için mevcut origin'i kullanıyoruz
            const url = `${window.location.origin}/api/v1/vendors/inventory/template/download?token=${authStore.token}`
            window.open(url, '_blank')
        }
    }
}
