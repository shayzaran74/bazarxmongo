import { defineStore } from 'pinia'
import { useCookie } from '#app'
import { useCartStore } from './cart'
// import { useAuthService } from '~/services/api/AuthService' <-- Moved to actions to break circular dependency

// Helper: Retry mechanism with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    const err = error as { message?: string; status?: number }
    const isRetryable = !err.status || err.status >= 500 || err.status === 408
    if (attempts <= 1 || !isRetryable) throw error
    console.warn(`⚠️ API Call failed. Retrying (${attempts - 1} attempts left)... Error: ${err.message}`)
    await new Promise(resolve => setTimeout(resolve, baseDelay))
    return withRetry(fn, attempts - 1, baseDelay * 2)
  }
}

import type { UserDTO } from '@barterborsa/shared-types'
import type { AuthApiResponse } from '~/services/api/AuthService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserDTO | null,
    isAuthenticated: false,
    token: null as string | null,
    csrfToken: null as string | null,
    loading: false,
    error: null as string | null,
    refreshPromise: null as Promise<boolean> | null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    userProfile: (state) => state.user,
    
    // Computed Getters for UI Convenience
    fullName: (state) => {
      const p = state.user?.profile
      if (!p) return 'İsimsiz Kullanıcı'
      return `${p.firstName} ${p.lastName || ''}`.trim()
    },

    avatarUrl: (state) => {
      const avatar = state.user?.profile?.avatar
      if (!avatar) return null
      return avatar.startsWith('http') ? avatar : `${useRuntimeConfig().public.apiBase}${avatar}`
    },

    currentXP: (state) => state.user?.userLevel?.currentXP || 0,
    currentLevel: (state) => state.user?.userLevel?.level || 1,

    hasEmailVerified: (state) => state.user?.isEmailVerified || false,
    isAdmin: (state) => state.user?.isAdmin || false,
    isSuperAdmin: (state) => (state.user?.isAdmin && state.user?.isSuperAdmin) || false,
    isVendor: (state) => state.user?.vendor?.status === 'APPROVED',
    balance: (state) => state.user?.Wallet?.balance || 0,
    barterBalance: (state) => state.user?.Wallet?.barterBalance || 0,
    barterCreditLimit: (state) => state.user?.Wallet?.barterCreditLimit || 0,
    
    vendorStatus: (state) => state.user?.vendor?.status?.toString().trim().toUpperCase() || null,
    isPremium: (state) => {
      if (!state.user) return false
      const activeMembership = state.user.Memberships?.find(m => m.isActive)
      const hasPremiumMembership = activeMembership?.tier === 'Premium'
      const hasPremiumVendorTier = state.user.vendor?.vendorTier === 'PRIME' || state.user.vendor?.vendorTier === 'ELITE'
      return !!(hasPremiumMembership || hasPremiumVendorTier)
    },
    isApexPlus: (state) => {
      if (!state.user) return false
      const activeMembership = state.user.Memberships?.find(m => m.isActive)
      const hasApexMembership = activeMembership?.tier === 'Apex Plus'
      const hasApexVendorTier = state.user.vendor?.vendorTier === 'APEX'
      return !!(hasApexMembership || hasApexVendorTier)
    }
  },

  actions: {
    async init() {
      if (this.isAuthenticated && this.user) return
      if (this.loading) return

      this.loading = true
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()

      try {
        if (!this.token) {
          try {
            const tokenCookie = useCookie('token')
            if (tokenCookie.value) {
              this.token = tokenCookie.value
            }
          } catch {
            // useCookie not available outside Nuxt context (e.g. middleware)
          }
        }

        const csrfData = await authService.getCsrfToken() as { csrfToken: string }
        if (csrfData?.csrfToken) {
          this.csrfToken = csrfData.csrfToken
        }

        await this.fetchUser(true, authService)
      } catch (error) {
        console.warn('⚠️ No active session or init failed:', error)
        this.user = null
        this.isAuthenticated = false
        this.token = null
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()
      try {
        await this.fetchUser(false, authService)
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
      }
    },

    async fetchUser(silent = false, service?: { getMe: () => Promise<AuthApiResponse<UserDTO>> }) {
      let authService = service
      if (!authService) {
        const { useAuthService } = await import('~/services/api/AuthService')
        authService = useAuthService()
      }
      try {
        const data = await authService.getMe() as AuthApiResponse<UserDTO>
        if (data.success) {
          this.user = data.user || null
          this.isAuthenticated = true
          return data.user
        } else {
          throw new Error(data.error || 'Kullanıcı bilgileri alınamadı')
        }
      } catch (error) {
        const err = error as { data?: { error?: string }; message?: string }
        this.user = null
        this.isAuthenticated = false
        this.token = null
        if (!silent) throw err
      }
    },

    async tryRefresh(): Promise<boolean> {
      if (this.refreshPromise) {
        return this.refreshPromise
      }

      this.refreshPromise = (async () => {
        try {
          const config = useRuntimeConfig()
          const response = await $fetch('/api/auth/refresh', {
            method: 'POST',
            baseURL: config.public.apiBase,
            credentials: 'include'
          }) as AuthApiResponse<{ token: string }>
          
          if (response && response.success && response.data?.token) {
            this.token = response.data.token
            const tokenCookie = useCookie('token', { path: '/', maxAge: 15 * 60, sameSite: 'lax' })  // 15m
            tokenCookie.value = response.data.token
            this.isAuthenticated = true
            return true
          }
          return false
        } catch (error) {
          console.error('Refresh token failed:', error)
          return false
        } finally {
          this.refreshPromise = null
        }
      })()

      return this.refreshPromise
    },

    async register(userData: import('~/services/api/AuthService').RegisterData) {
      this.loading = true
      this.error = null
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()

      try {
        const response = await withRetry(async () => {
          return await authService.register(userData) as AuthApiResponse<UserDTO>
        }, 3)

        if (response.success) {
          this.user = response.user || null
          this.isAuthenticated = true
          if (response.token) {
            this.token = response.token
            const tokenCookie = useCookie('token', { path: '/', maxAge: 15 * 60, sameSite: 'lax' }) // 15m
            tokenCookie.value = response.token
          }

          await this.init()
          const cartStore = useCartStore()
          await cartStore.mergeCart()

          return response
        } else {
          throw new Error(response.error || 'Kayıt başarısız')
        }
      } catch (error) {
        const err = error as { data?: { error?: string }; message?: string }
        this.error = err.data?.error || err.message || 'Kayıt sırasında hata oluştu'
        throw err
      } finally {
        this.loading = false
      }
    },

    async login(credentials: import('~/services/api/AuthService').LoginCredentials) {
      this.loading = true
      this.error = null
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()

      try {
        const response = await authService.login(credentials) as AuthApiResponse<UserDTO>
        if (response.success) {
          this.user = response.user || null
          this.isAuthenticated = true
          if (response.token) {
            this.token = response.token
            const tokenCookie = useCookie('token', { path: '/', maxAge: 15 * 60, sameSite: 'lax' }) // 15m
            tokenCookie.value = response.token
          }

          await this.init()
          const cartStore = useCartStore()
          await cartStore.mergeCart()

          return response
        } else {
          throw new Error(response.error || 'Giriş başarısız')
        }
      } catch (error) {
        const err = error as { data?: { error?: string }; message?: string }
        this.error = err.data?.error || err.message || 'Giriş sırasında hata oluştu'
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    async logout() {
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout API error:', error)
      }

      this.user = null
      this.isAuthenticated = false
      this.csrfToken = null
      this.token = null
      this.error = null

      const tokenCookie = useCookie('token')
      tokenCookie.value = null
    },

    async updateLocation(locationData: Record<string, unknown>) {
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()
      try {
        const response = await authService.updateLocation(locationData) as AuthApiResponse<UserDTO>
        if (response.success && response.user) {
          this.user = { ...(this.user as UserDTO), ...response.user }
          return true
        }
        return false
      } catch (error) {
        console.error('Update location error:', error)
        throw error
      }
    },

    async forgotPassword(email: string) {
      this.loading = true
      this.error = null
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()
      try {
        const response = await authService.forgotPassword(email) as AuthApiResponse
        if (response.success) return response
        throw new Error(response.error || 'Şifre sıfırlama talebi başarısız')
      } catch (error) {
        const err = error as { data?: { error?: string }; message?: string }
        this.error = err.data?.error || err.message || 'Şifre sıfırlama sırasında hata oluştu'
        throw err
      } finally {
        this.loading = false
      }
    },

    async resetPassword(data: Record<string, unknown>) {
      this.loading = true
      this.error = null
      const { useAuthService } = await import('~/services/api/AuthService')
      const authService = useAuthService()
      try {
        const response = await authService.resetPassword(data) as AuthApiResponse<UserDTO>
        if (response.success) {
          this.user = response.user || null
          this.isAuthenticated = true
          await this.init()
          return response
        }
        throw new Error(response.error || 'Şifre sıfırlama başarısız')
      } catch (error) {
        const err = error as { data?: { error?: string }; message?: string }
        this.error = err.data?.error || err.message || 'Şifre sıfırlama sırasında hata oluştu'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})