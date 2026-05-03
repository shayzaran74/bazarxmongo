// apps/mobile/store/authStore.ts
import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import api from '@/services/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  init: () => Promise<void>
  setUser: (user: User) => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: true,

  setUser: (user: User) => set({ user }),

  init: async () => {
    set({ isLoading: true })
    try {
      const token = await SecureStore.getItemAsync('access_token')
      if (!token) return set({ isLoading: false })

      set({ token })
      const res = await api.get<{ success: boolean; data: User }>('/api/v1/auth/me')
      if (res.data.success) {
        set({ user: res.data.data, isLoggedIn: true })
      }
    } catch {
      await SecureStore.deleteItemAsync('access_token')
      set({ token: null, user: null, isLoggedIn: false })
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; data: { token: string; user: User } }>(
      '/api/v1/auth/login',
      { email, password }
    )
    const { token, user } = res.data.data
    await SecureStore.setItemAsync('access_token', token)
    set({ token, user, isLoggedIn: true })
  },

  register: async (data: RegisterData) => {
    await api.post('/api/v1/auth/register', data)
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token')
    set({ user: null, token: null, isLoggedIn: false })
  },
}))
