// services/api/AdminChatService.ts
export const useAdminChatService = () => {
  const { $api } = useApi()

  return {
    async getRooms(params: {
      page?: number
      limit?: number
      search?: string
    } = {}) {
      return $api<{ success: boolean; data: any }>(
        '/api/admin/chat/rooms',
        { query: params }
      )
    },

    async getMessages(roomId: string, page = 1, limit = 50) {
      return $api<{ success: boolean; data: any }>(
        `/api/admin/chat/rooms/${roomId}/messages`,
        { query: { page, limit } }
      )
    },

    async getAuditLogs(page = 1, limit = 50) {
      return $api<{ success: boolean; data: any }>(
        '/api/admin/chat/audit-logs',
        { query: { page, limit } }
      )
    },

    async moderateRoom(roomId: string, action: string, note?: string) {
      return $api<{ success: boolean }>(
        `/api/admin/chat/rooms/${roomId}/moderate`,
        { method: 'POST', body: { action, note } }
      )
    },
  }
}
