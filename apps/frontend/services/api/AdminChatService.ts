import { useApi } from '~/services/api'
import type { ApiResponse, AdminMessage, AdminChatRoom, AdminAuditLog } from '@barterborsa/shared-types'

export interface AdminChatData {
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
    async getRooms(params: Record<string, string | number>): Promise<ApiResponse<AdminChatData>> {
      return await $api<AdminChatData>('/api/admin/chats', { query: params })
    },
    async getMessages(roomId: string, page: number, limit: number): Promise<ApiResponse<AdminChatData>> {
      return await $api<AdminChatData>(`/api/admin/chats/${roomId}/messages`, { query: { page, limit } })
    },
    async getAuditLogs(page: number, limit: number): Promise<ApiResponse<AdminChatData>> {
      return await $api<AdminChatData>('/api/admin/chats/audit-logs', { query: { page, limit } })
    },
    async freezeRoom(roomId: string, body: Record<string, unknown>): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/chats/${roomId}/freeze`, {
        method: 'POST',
        body
      })
    },
    async unfreezeRoom(roomId: string, body: Record<string, unknown>): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/chats/${roomId}/unfreeze`, {
        method: 'POST',
        body
      })
    },
    async sendWarning(roomId: string, body: Record<string, unknown>): Promise<ApiResponse<void>> {
      return await $api<void>(`/api/admin/chats/${roomId}/warning`, {
        method: 'POST',
        body
      })
    }
  }
}
