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
    isVendor: (state) => state.user?.role === 'VENDOR' || state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN',
    isPremium: (state) => !!state.user?.isPremium,
    fullName: (state) => {
      if (!state.user) return ''
      const firstName = state.user.firstName || (state.user as any).profile?.firstName || ''
      const lastName = state.user.lastName || (state.user as any).profile?.lastName || ''
      return (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'İsimsiz Kullanıcı'
    },
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

      // httpOnly cookie'leri JavaScript'ten okuyamayız — doğrudan backend'e sor.
      // fetchUser, cookie ile gelen access_token'ı backend'de doğrular.
      // 401 dönerse kullanıcı zaten logged out demektir.
      await this.fetchUser(true)

      this.isInitialized = true
    },
    async login(credentials: any) {
      this.loading = true
      this.error = null
      const { $api } = useApi()
      try {
        const res = await $api<any>('/api/auth/login', { method: 'POST', body: credentials })
        if (res.success && res.data) {
          // Backend httpOnly cookie'de token'ı set etti — store sadece user state tutuyor
          this.user = res.data.user
          this.isAuthenticated = true
          // Cookie'den token'ı oku (backend set etti)
          const accessToken = useCookie('access_token').value
          this.token = accessToken ?? null
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
          // Backend httpOnly cookie'de token'ı set etti
          this.user = res.data.user
          this.isAuthenticated = true
          const accessToken = useCookie('access_token').value
          this.token = accessToken ?? null
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

      const wasLoggedIn = this.isAuthenticated
      this.reset()
      useCookie('user').value = null

      if (wasLoggedIn) {
        try {
          // httpOnly refresh_token cookie'si tarayıcı tarafından otomatik gönderilir
          // Backend cookie'leri temizler
          await $api('/api/auth/logout', { method: 'POST' })
        } catch (e) {
          console.warn('Backend logout failed, local state cleared.')
        }
      }

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
          // httpOnly refresh_token cookie'si tarayıcı tarafından otomatik gönderilir
          const { $api } = useApi()
          const res = await $api<any>('/api/auth/refresh', { method: 'POST' })
          return !!(res.success && res.data)
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