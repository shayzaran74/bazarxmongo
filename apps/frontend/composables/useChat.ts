// composables/useChat.ts
import { useChatStore } from '~/stores/chat'
import { useChatService } from '~/services/api/ChatService'
import type { ChatMessage } from '@barterborsa/shared-types'

export const useChat = (tradeOfferId: string) => {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const { $toast } = useNuxtApp()

  // tradeOfferId → chatRoomId çözümlemesi için store'a sor
  const roomId = computed(() => chatStore.activeRoomId)

  // Computed refs — store'dan reaktif oku
  const messages = computed(() => chatStore.messages)
  const isConnected = computed(() => chatStore.isConnected)
  const typingText = computed(() => chatStore.typingText)

  // Typing debounce
  let typingTimer: ReturnType<typeof setTimeout> | null = null

  const onTyping = () => {
    if (!chatStore.socket || !roomId.value) return
    chatStore.socket.emit('user:typing', { roomId: roomId.value, isTyping: true })

    if (typingTimer) clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      chatStore.socket?.emit('user:typing', { roomId: roomId.value, isTyping: false })
    }, 2000)
  }

  const sendMessage = (content: string) => {
    if (!content.trim() || !chatStore.socket || !roomId.value) return

    const tempId = `temp-${Date.now()}`

    // Optimistic UI — hemen ekle
    chatStore.addMessage({
      id: tempId,
      tempId,
      chatRoomId: roomId.value,
      senderId: authStore.user?.id || '',
      content: content.trim(),
      type: 'text',
      isFromMe: true,
      status: 'pending',
      createdAt: new Date().toISOString(),
    } as ChatMessage)

    chatStore.socket.emit(
      'message:send',
      { roomId: roomId.value, content: content.trim(), tempId },
      (response: { status: string; message?: string }) => {
        if (response.status !== 'ok') {
          const isWarning = response.status === 'warning'
          chatStore.updateMessageStatus(
            tempId,
            isWarning ? 'warning' : 'error',
            response.message
          )
          if (!isWarning) {
            $toast.error('Mesaj gönderilemedi')
          }
        }
      }
    )
  }

  const retryMessage = (tempId: string | undefined) => {
    if (!tempId || !roomId.value) return
    chatStore.resendMessage(tempId, roomId.value)
  }

  const markAsRead = async () => {
    if (!authStore.isLoggedIn || !roomId.value) return
    try {
      const chatService = useChatService()
      await chatService.markAsRead(roomId.value)
    } catch { /* ignore */ }
  }

  const init = async () => {
    if (!authStore.isLoggedIn) return
    chatStore.connect()
    // joinRoom → activeRoomId'e chatRoomId atanır
    await chatStore.joinRoom(tradeOfferId)
  }

  onUnmounted(() => {
    if (typingTimer) clearTimeout(typingTimer)
    if (roomId.value) {
      chatStore.socket?.emit('user:typing', { roomId: roomId.value, isTyping: false })
    }
  })

  return {
    messages,
    isConnected,
    typingText,
    sendMessage,
    retryMessage,
    onTyping,
    markAsRead,
    init,
  }
}
