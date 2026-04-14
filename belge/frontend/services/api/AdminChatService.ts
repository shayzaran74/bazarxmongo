import { useApi } from '~/services/api'
import type { ApiResponse, AdminMessage, AdminChatRoom, AdminAuditLog } from '@barterborsa/shared-types'

export interface AdminChatApiResponse<T = void> extends ApiResponse<T> {
  rooms?: AdminChatRoom[]
  messages?: AdminMessage[]
  logs?: AdminAuditLog[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useAdminChatService = () => {
  const { $api } = useApi()

  return {
    async getRooms(params: Record<string, string>): Promise<AdminChatApiResponse<void>> {
      const query = new URLSearchParams(params)
      return await $api<AdminChatApiResponse<void>>(`/api/admin/chats?${query}`)
    },
    async getMessages(roomId: string, page: number, limit: number): Promise<AdminChatApiResponse<void>> {
      return await $api<AdminChatApiResponse<void>>(`/api/admin/chats/${roomId}/messages?page=${page}&limit=${limit}`)
    },
    async getAuditLogs(page: number, limit: number): Promise<AdminChatApiResponse<void>> {
      return await $api<AdminChatApiResponse<void>>(`/api/admin/chats/audit-logs?page=${page}&limit=${limit}`)
    },
    async freezeRoom(roomId: string, body: Record<string, unknown>): Promise<ApiResponse> {
      return await $api<ApiResponse>(`/api/admin/chats/${roomId}/freeze`, {
        method: 'POST',
        body
      })
    },
    async unfreezeRoom(roomId: string, body: Record<string, unknown>): Promise<ApiResponse> {
      return await $api<ApiResponse>(`/api/admin/chats/${roomId}/unfreeze`, {
        method: 'POST',
        body
      })
    },
    async sendWarning(roomId: string, body: Record<string, unknown>): Promise<ApiResponse> {
      return await $api<ApiResponse>(`/api/admin/chats/${roomId}/warning`, {
        method: 'POST',
        body
      })
    }
  }
}
