import { useApi } from '~/services/api'
import type { ApiResponse, UserDTO } from '@barterborsa/shared-types'

export interface LoginCredentials {
  email?: string
  password?: string
  isGoogleAuth?: boolean
}

export interface RegisterData {
  email: string
  password?: string
  firstName?: string
  lastName?: string
  fullName?: string
  role?: string
  city?: string
}

export const useAuthService = () => {
  const { $api } = useApi() 

  return {
    async login(credentials: LoginCredentials): Promise<ApiResponse<UserDTO>> {   
      return await $api<UserDTO>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
    },
    async register(data: RegisterData): Promise<ApiResponse<UserDTO>> {
      return await $api<UserDTO>('/api/auth/register', {
        method: 'POST',
        body: data
      })
    },
    async logout(refreshToken?: string): Promise<ApiResponse<void>> {
      return await $api<void>('/api/auth/logout', {
        method: 'POST',
        body: { refreshToken }
      })
    },
    async getProfile(): Promise<ApiResponse<UserDTO>> {
      return await $api<UserDTO>('/api/auth/profile')
    },
    async updateProfile(data: Record<string, unknown>): Promise<ApiResponse<UserDTO>> {
      return await $api<UserDTO>('/api/auth/profile', {
        method: 'PUT',
        body: data
      })
    },
    async getCsrfToken(): Promise<ApiResponse<{ csrfToken: string }>> {
      return await $api<{ csrfToken: string }>('/api/auth/csrf')
    },
    async getMe(): Promise<ApiResponse<UserDTO>> {
      return await $api<UserDTO>('/api/auth/me')
    },
    async updateLocation(locationData: Record<string, unknown>): Promise<ApiResponse<void>> {
      return await $api<void>('/api/user/location', {
        method: 'PUT',
        body: locationData
      })
    },
    async forgotPassword(email: string): Promise<ApiResponse<void>> {
      return await $api<void>('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })
    },
    async resetPassword(data: Record<string, unknown>): Promise<ApiResponse<void>> {
      return await $api<void>('/api/auth/reset-password', {
        method: 'POST',
        body: data
      })
    }
  }
}
