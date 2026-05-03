// apps/mobile/services/socket.ts
import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'
import { SOCKET_URL } from '@/constants/api'

let socket: Socket | null = null

export const connectSocket = async (companyId?: string): Promise<Socket> => {
  if (socket?.connected) return socket

  const token = await SecureStore.getItemAsync('access_token')

  socket = io(SOCKET_URL, {
    auth: { token },
    query: companyId ? { companyId } : {},
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  return socket
}

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}

export const getSocket = (): Socket | null => socket
