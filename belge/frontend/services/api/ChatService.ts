import { useApi } from '~/services/api'
import type { ApiResponse } from '@barterborsa/shared-types'

export interface AiChatResponse {
  success: boolean
  reply: string
  error?: string
}

export const useChatService = () => {
  const { $api } = useApi()

  return {
    async sendAiMessage(message: string): Promise<ApiResponse<{ reply: string }>> {
      return await $api<ApiResponse<{ reply: string }>>('/api/ai/chat', {
        method: 'POST',
        body: { message }
      })
    }
  }
}
