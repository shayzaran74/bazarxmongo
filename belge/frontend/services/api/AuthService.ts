import { useApi } from '~/services/api'
import type { UserDTO } from '@barterborsa/shared-types'

export interface AuthApiResponse<T = unknown> {
  success: boolean
  data?: T
  user?: T
  token?: string
  csrfToken?: string
  error?: string
}

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
    async login(credentials: LoginCredentials): Promise<AuthApiResponse<UserDTO>> {   
      return await $api('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
    },
    async register(data: RegisterData): Promise<AuthApiResponse<UserDTO>> {
      return await $api('/api/auth/register', {
        method: 'POST',
        body: data
      })
    },
    async logout(): Promise<AuthApiResponse> {
      return await $api('/api/auth/logout', {
        method: 'POST'
      })
    },
    async getProfile(): Promise<AuthApiResponse<UserDTO>> {
      return await $api('/api/auth/profile')
    },
    async updateProfile(data: Record<string, unknown>): Promise<AuthApiResponse<UserDTO>> {
      return await $api('/api/auth/profile', {
        method: 'PUT',
        body: data
      })
    },
    async getCsrfToken(): Promise<{ csrfToken: string }> {
      return await $api('/api/auth/csrf')
    },
    async getMe(): Promise<AuthApiResponse<UserDTO>> {
      return await $api('/api/auth/me')
    },
    async updateLocation(locationData: Record<string, unknown>): Promise<AuthApiResponse> {
      return await $api('/api/user/location', {
        method: 'PUT',
        body: locationData
      })
    },
    async forgotPassword(email: string): Promise<AuthApiResponse> {
      return await $api('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })
    },
    async resetPassword(data: Record<string, unknown>): Promise<AuthApiResponse> {
      return await $api('/api/auth/reset-password', {
        method: 'POST',
        body: data
      })
    }
  }
}
