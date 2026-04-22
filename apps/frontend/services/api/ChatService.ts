// services/api/ChatService.ts
export const useChatService = () => {
  const { $api } = useApi()

  return {
    async getRooms() {
      return $api<{ success: boolean; data: any[] }>('/api/chat/rooms')
    },

    async getMessages(roomId: string, page = 1, limit = 50) {
      return $api<{ success: boolean; data: any[] }>(
        `/api/chat/rooms/${roomId}/messages`,
        { query: { page, limit } }
      )
    },

    async markAsRead(roomId: string) {
      return $api<{ success: boolean }>(
        `/api/chat/rooms/${roomId}/read`,
        { method: 'POST' }
      )
    },

    async sendAiMessage(content: string) {
      return $api<{ success: boolean; data: { reply: string } }>(
        '/api/ai/chat',
        { method: 'POST', body: { message: content } }
      )
    },
  }
}
