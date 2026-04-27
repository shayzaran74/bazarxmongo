// apps/frontend/stores/auth.ts
import { defineStore } from 'pinia'
import type { UserDTO } from '@barterborsa/shared-types'

interface AuthState {
  user: UserDTO | null
  token: string | null
  csrfToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  isInitialized: boolean
}

let refreshPromise: Promise<boolean> | null = null

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    csrfToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    isAdmin: (state) => state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN',
    isSuperAdmin: (state) => state.user?.role === 'SUPER_ADMIN',
    isVendor: (state) => state.user?.role === 'VENDOR' || state.user?.role === 'ADMIN',
    isPremium: (state) => !!state.user?.isPremium,
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    avatarUrl: (state) => state.user?.avatar || '',
    currentXP: (state) => state.user?.loyalty?.xp || 0,
    currentLevel: (state) => state.user?.loyalty?.level || 1,
    balance: (state) => state.user?.wallet?.balance || 0,
    barterBalance: (state) => state.user?.wallet?.barterBalance || 0,
    vendorStatus: (state) => state.user?.vendor?.status || 'NONE',
    isApexPlus: (state) => (state.user?.vendor as any)?.tier === 'APEX_PLUS' || state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN',
  },

  actions: {
    async init() {
      if (this.isInitialized) return
      
      const token = useCookie('access_token').value
      if (token) {
        this.token = token
        this.isAuthenticated = true
        await this.fetchUser(true)
      }
      
      this.isInitialized = true
    },
    async login(credentials: any) {
      this.loading = true
      this.error = null
      const { $api } = useApi()
      try {
        const res = await $api<any>('/api/auth/login', { method: 'POST', body: credentials })
        if (res.success && res.data) {
          this.token = res.data.accessToken
          this.user = res.data.user
          this.isAuthenticated = true
          useCookie('access_token', { maxAge: 60 * 15, path: '/' }).value = this.token
          if (res.data.refreshToken) {
            useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7, path: '/' }).value = res.data.refreshToken
          }
          useCookie('user').value = JSON.stringify(this.user)
          return true
        }
        return false
      } catch (err: any) {
        this.error = err.data?.message || 'Giriş başarısız'
        return false
      } finally {
        this.loading = false
      }
    },
    async register(data: any) {
      this.loading = true
      this.error = null
      const { $api } = useApi()
      try {
        // Backend firstName ve lastName bekliyor, frontend name'i bölebiliriz
        const names = (data.name || '').trim().split(' ')
        const firstName = names[0] || ''
        const lastName = names.slice(1).join(' ') || ''

        const res = await $api<any>('/api/auth/register', {
          method: 'POST',
          body: {
            email: data.email,
            password: data.password,
            firstName,
            lastName,
            phoneNumber: data.phone,
          }
        })

        if (res.success && res.data) {
          this.token = res.data.accessToken
          this.user = res.data.user
          this.isAuthenticated = true
          useCookie('access_token', { maxAge: 60 * 15, path: '/' }).value = this.token
          if (res.data.refreshToken) {
            useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7, path: '/' }).value = res.data.refreshToken
          }
          useCookie('user').value = JSON.stringify(this.user)
          return true
        }
        return false
      } catch (err: any) {
        this.error = err.data?.message || 'Kayıt başarısız'
        return false
      } finally {
        this.loading = false
      }
    },
    async logout() {
      const { $api } = useApi()
      const refreshToken = useCookie('refresh_token').value
      try { 
        await $api('/api/auth/logout', { 
          method: 'POST', 
          body: { refreshToken } 
        }) 
      } catch (e) { }
      this.reset()
      useCookie('access_token').value = null
      useCookie('refresh_token').value = null
      useCookie('user').value = null
      navigateTo('/auth/login')
    },
    async fetchUser(silent = false) {
      const { $api } = useApi()
      try {
        const res = await $api<any>('/api/auth/me')
        if (res.success && res.data) {
          this.user = res.data
          this.isAuthenticated = true
          useCookie('user').value = JSON.stringify(this.user)
          return res.data
        }
      } catch (err) {
        if (!silent) throw err
        this.reset()
      }
    },
    async tryRefresh(): Promise<boolean> {
      if (refreshPromise) return refreshPromise
      refreshPromise = (async () => {
        try {
          const refreshToken = useCookie('refresh_token').value
          if (!refreshToken) return false
          const { $api } = useApi()
          const res = await $api<any>('/api/auth/refresh', { method: 'POST', body: { refreshToken } })
          if (res.success && res.data) {
            this.token = res.data.accessToken
            useCookie('access_token').value = this.token
            return true
          }
          return false
        } catch { return false } finally { refreshPromise = null }
      })()
      return refreshPromise
    },
    async forgotPassword(email: string) {
      const { $api } = useApi()
      try {
        const res = await $api<any>('/api/auth/forgot-password', { method: 'POST', body: { email } })
        return res.success
      } catch (err: any) {
        this.error = err.data?.message || 'Şifre sıfırlama talebi başarısız'
        return false
      }
    },
    async resetPassword(data: any) {
      const { $api } = useApi()
      try {
        const res = await $api<any>('/api/auth/reset-password', { method: 'POST', body: data })
        return res.success
      } catch (err: any) {
        this.error = err.data?.message || 'Şifre sıfırlama başarısız'
        return false
      }
    },
    updateLocation(location: { city: string, district?: string, regionName?: string }) {
      if (this.user) {
        this.user.city = location.city
        this.user.district = location.district
        this.user.regionName = location.regionName
      }
    },
    reset() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
    },
    clearError() {
      this.error = null
    }
  }
})