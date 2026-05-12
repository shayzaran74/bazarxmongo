import { useApi } from '~/services/api'
import type { ApiResponse, PaginatedResponse, AdminVendor, Product, ProductType } from '@barterborsa/shared-types'

export interface AdminProductFilterParams {
  [key: string]: string | number | boolean | undefined
  page?: number
  limit?: number
  search?: string
  categoryId?: string | number
  vendorId?: string | number | boolean
  status?: string
}

export const useAdminProductService = () => {
  const { $api } = useApi()

  return {
    async getProducts(params: AdminProductFilterParams = {}): Promise<ApiResponse<PaginatedResponse<Product>>> {
      return await $api<PaginatedResponse<Product>>('/api/admin/products', { query: params })
    },

    async getVendors(): Promise<ApiResponse<AdminVendor[]>> {
      return await $api<AdminVendor[]>('/api/admin/vendors')
    },

    async getProductTypes(): Promise<ApiResponse<ProductType[]>> {
      return await $api<ProductType[]>('/api/admin/product-types')
    },

    async createProduct(body: Record<string, unknown>): Promise<ApiResponse<Product>> {
      return await $api<Product>('/api/admin/products', {
        method: 'POST',
        body
      })
    },

    async updateProduct(id: string | number, body: Record<string, unknown>): Promise<ApiResponse<Product>> {
      return await $api<Product>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body
      })
    },

    async deleteProduct(id: string | number): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })
    },

    async approveProduct(id: string | number): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/products/${id}/approve`, {
        method: 'PUT'
      })
    },

    async bulkUpdate(productIds: (string | number)[], updates: Record<string, unknown>): Promise<ApiResponse<void>> {
      return await $api<void>('/api/admin/products/bulk-update', {
        method: 'PUT',
        body: { ids: productIds, updates }
      })
    },

    async bulkDelete(productIds: (string | number)[]): Promise<ApiResponse<void>> {
      return await $api<void>('/api/admin/products/bulk-delete', {
        method: 'POST',
        body: { ids: productIds }
      })
    },

    async bulkImport(rows: Record<string, unknown>[]): Promise<ApiResponse<{ jobId: string }>> {
      return await $api<{ jobId: string }>('/api/admin/products/bulk-import', {
        method: 'POST',
        body: { rows }
      })
    },

    async importTrendyol(products: Record<string, unknown>[], defaultStock = 1): Promise<ApiResponse<{ jobId: string }>> {
      return await $api<{ jobId: string }>('/api/admin/products/import-trendyol', {
        method: 'POST',
        body: { products, defaultStock }
      })
    }
  }
}
