import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../lib/api'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token, user) => {
    await SecureStore.setItemAsync('access_token', token)
    set({ token, user, isAuthenticated: true })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token')
    set({ token: null, user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token')
      if (!token) {
        set({ isLoading: false })
        return
      }
      
      // Verify token with backend
      const res = await api.get('auth/me')
      // me endpoint'i veriyi doğrudan veya data içinde dönebilir, ikisini de kontrol edelim
      const userData = res.data?.data || res.data;
      set({ token, user: userData, isAuthenticated: true, isLoading: false })
    } catch (error) {
      await SecureStore.deleteItemAsync('access_token')
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    }
  }
}))
