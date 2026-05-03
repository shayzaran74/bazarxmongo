// apps/mobile/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { connectSocket, disconnectSocket } from '@/services/socket'
import type { Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  offerId: string
  senderId: string
  senderName?: string
  content: string
  createdAt: string
}

export const useChat = (offerId: string, companyId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!offerId) return

    connectSocket(companyId).then((socket) => {
      socketRef.current = socket
      setConnected(socket.connected)

      // Odaya katıl
      socket.emit('joinRoom', { offerId })

      // Geçmiş mesajlar
      socket.on('messageHistory', (msgs: ChatMessage[]) => {
        setMessages(msgs)
      })

      // Yeni mesaj
      socket.on('newMessage', (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg])
      })

      socket.on('connect', () => setConnected(true))
      socket.on('disconnect', () => setConnected(false))
    })

    return () => {
      socketRef.current?.emit('leaveRoom', { offerId })
      socketRef.current?.off('messageHistory')
      socketRef.current?.off('newMessage')
    }
  }, [offerId, companyId])

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !content.trim()) return
    socketRef.current.emit('sendMessage', { offerId, content })
  }, [offerId])

  return { messages, connected, sendMessage }
}
