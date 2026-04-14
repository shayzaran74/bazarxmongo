# BarterBorsa Frontend — Bölüm 1: Proje İskeleti + Layout + Auth Altyapısı

## SİSTEM TALİMATLARI

Sen BarterBorsa projesinin frontend'ini sıfırdan yeniden yazıyorsun. Backend tamamlanmış ve çalışıyor. Mevcut frontend dağınık (88 `any`, 105 SSR-unsafe, 75 hardcoded URL). Temiz, tip-güvenli, SSR-uyumlu bir frontend yazacaksın.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans. Her değişken, parametre, dönüş tipi açık olacak.
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK** (sadece `console.error` / `console.warn` hata durumlarında)
- Hardcoded URL **YASAK** — her URL `useRuntimeConfig().public.apiBase` üzerinden
- `<script setup lang="ts">` zorunlu — Options API yasak
- Tüm composable ve store SSR-safe olacak — browser API kullanımı `onMounted` veya `import.meta.client` guard içinde
- Import path'leri `~/` prefix ile (ör: `~/stores/auth`, `~/composables/useApi`)
- Türkçe yorum satırları

---

## 1. PROJE YAPILANDIRMA DOSYALARI

### 1.1 `nuxt.config.ts`

Mevcut config'i temel al ama şu değişiklikleri yap:

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2026-04-02',
  telemetry: false,
  devtools: { enabled: true },

  // CSS
  css: ['~/assets/css/main.css'],

  // Modüller
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    '@nuxtjs/i18n',
  ],

  imports: {
    dirs: ['stores'],
  },

  // Nuxt Image
  image: {
    domains: ['localhost', '127.0.0.1'],
    alias: {
      backend: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },

  // Google Fonts — Inter KALDIRILDI, yeni font seçimi
  googleFonts: {
    families: {
      'DM Sans': [400, 500, 600, 700],
      'Space Grotesk': [500, 700],
    },
  },

  // Runtime config
  runtimeConfig: {
    internalApiKey: process.env.INTERNAL_API_KEY,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api/v1',
      appName: 'BarterBorsa',
      appDescription: 'Ticari Takas Platformu',
      minioBase: process.env.NUXT_PUBLIC_MINIO_BASE || 'http://localhost:9000/bazarx-public',
    },
  },

  // i18n
  i18n: {
    locales: [
      { code: 'tr', language: 'tr-TR', name: 'Türkçe', file: 'tr.json' },
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'tr',
    strategy: 'no_prefix', // Şimdilik prefix yok, sadece TR
  },

  // App head
  app: {
    head: {
      title: 'BarterBorsa - Ticari Takas Platformu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'BarterBorsa - Ticari sektörde fazla malzeme ve stokların takası için modern platform' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // Nitro — BFF Proxy
  nitro: {
    compatibilityDate: '2026-04-02',
    devProxy: {
      '/api/v1': {
        target: (process.env.NUXT_API_PROXY_URL || 'http://localhost:3001') + '/api/v1',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.NUXT_API_PROXY_URL || 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
    routeRules: {
      '/socket.io/**': {
        proxy: `${process.env.NUXT_API_PROXY_URL || 'http://localhost:3001'}/socket.io/**`,
      },
    },
  },

  // Dev server
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  // Build
  build: {
    transpile: ['vue-toastification', '@heroicons/vue'],
  },

  // TypeScript — STRICT
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // SSR aktif
  ssr: true,

  // Site bilgisi
  site: {
    url: process.env.NUXT_PUBLIC_BASE_URL || 'https://barterborsa.com',
    name: 'BarterBorsa',
    description: "Türkiye'nin En Büyük Ticari Takas Platformu",
    defaultLocale: 'tr',
  },
})
```

**DEĞİŞEN/KALDIRILAN:**
- `@nuxtjs/sitemap` → Bölüm 10'da eklenecek
- `@vite-pwa/nuxt` → Bölüm 10'da eklenecek
- Capacitor → kaldırıldı (öncelik web)
- Stripe → kaldırıldı (Iyzico'ya geçilecek, Bölüm 5'te)
- Inter font → DM Sans + Space Grotesk (daha karakterli)
- i18n strategy → `no_prefix` (şimdilik sadece TR)
- `typescript.strict: true` + `typeCheck: true` eklendi

### 1.2 `tailwind.config.ts` (JS'den TS'ye)

```typescript
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.ts',
    './composables/**/*.ts',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: { 500: '#22c55e', 600: '#16a34a' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        danger: { 500: '#ef4444', 600: '#dc2626' },
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config
```

### 1.3 `package.json`

```json
{
  "name": "barterborsa-frontend",
  "type": "module",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "typecheck": "nuxt typecheck",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "@heroicons/vue": "^2.0.18",
    "@nuxt/image": "^2.0.0",
    "@nuxtjs/google-fonts": "^3.0.2",
    "@nuxtjs/i18n": "^8.5.5",
    "@pinia/nuxt": "^0.5.1",
    "@vueuse/nuxt": "^10.5.0",
    "pinia": "^2.1.7",
    "socket.io-client": "^4.8.3",
    "vue-toastification": "^2.0.0-rc.5"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.8.4",
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/typography": "^0.5.19",
    "@vue/test-utils": "^2.4.6",
    "nuxt": "3.10.3",
    "typescript": "^5.2.2",
    "vitest": "^4.0.9"
  }
}
```

**KALDIRILAN BAĞIMLIKLAR** (ihtiyaç duyulduğunda sonraki bölümlerde eklenecek):
- Capacitor, Stripe, TipTap, ApexCharts, VueDraggable, Yup, VeeValidate, Blurhash, uuid, lodash-es
- Bunlar Bölüm 4-9'da lazım olduğunda eklenecek

---

## 2. TİP TANIMLARI

### 2.1 `types/api.ts`

```typescript
/** Backend standart API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
  timestamp?: number
}

/** Sayfalı API response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta?: PaginationMeta
}

/** Sayfalama meta bilgisi */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/** API hata yapısı */
export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}
```

### 2.2 `types/auth.ts`

```typescript
/** Kullanıcı profil bilgisi */
export interface UserProfile {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  avatar: string | null
  bio: string | null
  birthday: string | null
  gender: string | null
  city: string | null
  cityId: string | null
  district: string | null
  districtId: string | null
}

/** Kullanıcı seviye/XP bilgisi */
export interface UserLevel {
  currentXP: number
  lifetimeXP: number
  level: number
  tierId: string | null
}

/** Vendor özet bilgisi (user response içinde gelir) */
export interface VendorSummary {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  slug: string
  tier: VendorTier
  isVerified: boolean
}

export type UserRole = 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION'
export type VendorTier = 'CORE' | 'PLUS' | 'PREMIUM' | 'ELITE'

/** Ana kullanıcı DTO — backend /users/me response'ı */
export interface User {
  id: string
  email: string
  phoneNumber: string | null
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  googleId: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  profile?: UserProfile | null
  userLevel?: UserLevel | null
  vendor?: VendorSummary | null
}

/** Login response — backend /auth/login veya /auth/google/callback */
export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

/** Token refresh response */
export interface RefreshResponse {
  token: string
  csrfToken?: string
}
```

### 2.3 `types/common.ts`

```typescript
/** Sıralama yönü */
export type SortDirection = 'asc' | 'desc'

/** Genel liste sorgu parametreleri */
export interface ListQuery {
  page?: number
  limit?: number
  sort?: string
  order?: SortDirection
  search?: string
}

/** Temel entity (tüm backend entity'leri bunu içerir) */
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

/** Toast mesaj tipleri */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/** Toast arayüzü */
export interface Toast {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}
```

---

## 3. BFF PROXY — `server/api/v1/[...].ts`

Mevcut BFF proxy'yi temel al ama temizle:

```typescript
import {
  defineEventHandler,
  proxyRequest,
  getCookie,
  getHeaders,
  createError,
} from 'h3'

/**
 * BFF Gateway — Cookie-to-Bearer dönüşümü
 * Frontend cookie'den token okur, backend'e Bearer header olarak gönderir.
 * CSRF koruması mutating request'lerde zorunludur.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.path
  const method = event.method
  const headers = getHeaders(event)

  // 1. Hedef URL belirleme
  const backendBase = (
    process.env.NUXT_API_PROXY_URL || 'http://localhost:3001'
  ).replace(/\/+$/, '')

  const financialBase = (
    process.env.NUXT_FINANCIAL_PROXY_URL || 'http://localhost:3004'
  ).replace(/\/+$/, '')

  let targetUrl: string

  if (path.startsWith('/api/v1/wallet')) {
    // Financial Service — path rewrite: /api/v1/wallet → /api/wallet
    targetUrl = financialBase + path.replace('/api/v1/wallet', '/api/wallet')
  } else {
    // Backend (varsayılan)
    targetUrl = backendBase + path
  }

  // 2. Header hazırlama
  const proxyHeaders: Record<string, string> = {}

  const preservedHeaders = [
    'accept',
    'content-type',
    'user-agent',
    'x-forwarded-for',
    'x-idempotency-key',
  ] as const

  for (const h of preservedHeaders) {
    const value = headers[h]
    if (value) proxyHeaders[h] = value
  }

  // 3. Cookie → Bearer dönüşümü
  const accessToken = getCookie(event, 'access_token')
  if (accessToken) {
    proxyHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  // 4. CSRF koruması (mutating request'ler için)
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
    method.toUpperCase(),
  )
  if (accessToken && isMutating) {
    const csrfToken = headers['x-csrf-token']
    if (!csrfToken) {
      throw createError({
        statusCode: 403,
        statusMessage: 'CSRF token eksik',
      })
    }
  }

  // 5. Financial Service için internal key
  if (path.startsWith('/api/v1/wallet')) {
    proxyHeaders['x-internal-key'] = config.internalApiKey
  }

  // 6. Proxy
  try {
    return await proxyRequest(event, targetUrl, {
      headers: proxyHeaders,
    })
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    console.error(
      `[BFF] ${method} ${path} → ${targetUrl}: ${err.message}`,
    )
    throw createError({
      statusCode: err.statusCode || 502,
      statusMessage: 'Backend bağlantı hatası',
    })
  }
})
```

---

## 4. COMPOSABLE'LAR

### 4.1 `composables/useApi.ts`

Mevcut useApi'yi tamamen yeniden yaz. Sorunlar:
- `meta?: any` → düzelt
- Envelope unwrap mantığı Object.defineProperty ile karmaşık → basitleştir
- Lazy auth store bind → daha temiz yap

```typescript
import type { ApiResponse, PaginatedResponse } from '~/types/api'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  query?: Record<string, unknown>
  headers?: Record<string, string>
  showErrorToast?: boolean
}

/**
 * Tip-güvenli API fetch wrapper.
 * - Otomatik baseURL (runtimeConfig)
 * - Cookie credentials (BFF proxy ile)
 * - CSRF token ekleme (mutating request'lerde)
 * - 401 → refresh token → retry
 * - Hata durumunda toast
 */
export function useApi() {
  const config = useRuntimeConfig()
  const toast = useToast()

  async function $api<T>(
    url: string,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> {
    const { showErrorToast = true, ...fetchOpts } = options

    // URL normalize — baştaki slash kaldır (ofetch baseURL ile çakışmasın)
    const normalizedUrl = url.startsWith('/') ? url.substring(1) : url

    // CSRF token — mutating request'lerde header ekle
    const headers: Record<string, string> = { ...(fetchOpts.headers || {}) }
    const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      (fetchOpts.method || 'GET').toUpperCase(),
    )
    if (isMutating) {
      const authStore = useAuthStore()
      if (authStore.csrfToken) {
        headers['x-csrf-token'] = authStore.csrfToken
      }
    }

    try {
      const response = await $fetch<ApiResponse<T>>(normalizedUrl, {
        baseURL: config.public.apiBase,
        credentials: 'include',
        ...fetchOpts,
        headers,
      })

      // Backend her zaman { success, data, ... } döner
      if (response && response.success === false && showErrorToast) {
        toast.error(response.message || response.error || 'Bir hata oluştu')
      }

      return response
    } catch (error: unknown) {
      const fetchError = error as {
        status?: number
        data?: { message?: string; error?: string }
        message?: string
      }

      // 401 → Token refresh dene
      if (fetchError.status === 401) {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          const refreshed = await authStore.tryRefresh()
          if (refreshed) {
            // Retry — yeni token cookie'de, BFF otomatik alacak
            return await $api<T>(url, options)
          }
          // Refresh başarısız → logout
          await authStore.logout()
          await navigateTo('/auth/login')
        }
      }

      // Toast göster
      if (showErrorToast) {
        const message =
          fetchError.data?.message ||
          fetchError.data?.error ||
          fetchError.message ||
          'Beklenmeyen bir hata oluştu'
        toast.error(message)
      }

      throw error
    }
  }

  return { $api }
}
```

### 4.2 `composables/useToast.ts`

```typescript
/**
 * Toast bildirim composable.
 * vue-toastification plugin'ini wrap eder.
 * SSR-safe: server-side'da no-op.
 */
export function useToast() {
  const show = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    if (!import.meta.client) return

    try {
      const nuxtApp = useNuxtApp()
      const toastPlugin = nuxtApp.$toast as {
        success: (msg: string) => void
        error: (msg: string) => void
        warning: (msg: string) => void
        info: (msg: string) => void
      } | undefined

      if (toastPlugin && typeof toastPlugin[type] === 'function') {
        toastPlugin[type](message)
      }
    } catch {
      // Plugin henüz yüklenmemiş olabilir
    }
  }

  return {
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    warning: (message: string) => show('warning', message),
    info: (message: string) => show('info', message),
  }
}
```

### 4.3 `composables/useAuth.ts`

```typescript
/**
 * Auth composable — store'u wrap eder, sayfalarda kolay kullanım.
 */
export function useAuth() {
  const authStore = useAuthStore()
  const toast = useToast()

  const isLoggedIn = computed(() => authStore.isAuthenticated && !!authStore.user)
  const user = computed(() => authStore.user)
  const isVendor = computed(() => authStore.user?.role === 'VENDOR')
  const isAdmin = computed(() =>
    authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN',
  )

  const fullName = computed(() => {
    const p = authStore.user?.profile
    if (!p) return ''
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  })

  const avatarUrl = computed(() => {
    const avatar = authStore.user?.profile?.avatar
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    const config = useRuntimeConfig()
    return `${config.public.minioBase}/${avatar}`
  })

  /** Google OAuth2 ile giriş — backend'e redirect */
  function loginWithGoogle() {
    const backendUrl = (
      process.env.NUXT_API_PROXY_URL || 'http://localhost:3001'
    ).replace(/\/+$/, '')
    window.location.href = `${backendUrl}/api/v1/auth/google`
  }

  async function logout() {
    await authStore.logout()
    toast.success('Çıkış yapıldı')
    await navigateTo('/auth/login')
  }

  return {
    isLoggedIn,
    user,
    isVendor,
    isAdmin,
    fullName,
    avatarUrl,
    loginWithGoogle,
    logout,
    loading: computed(() => authStore.loading),
  }
}
```

---

## 5. AUTH STORE — `stores/auth.ts`

Mevcut karmaşık 4-dosyalı yapıyı **tek dosyaya** sadeleştir:

```typescript
import { defineStore } from 'pinia'
import type { User, RefreshResponse } from '~/types/auth'
import type { ApiResponse } from '~/types/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  csrfToken: string | null
  loading: boolean
  error: string | null
  refreshPromise: Promise<boolean> | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    token: null,
    csrfToken: null,
    loading: false,
    error: null,
    refreshPromise: null,
  }),

  getters: {
    isLoggedIn: (state): boolean => state.isAuthenticated && !!state.user,
  },

  actions: {
    /** Uygulama başlangıcında çağrılır — cookie'den session kontrol */
    async init() {
      if (this.isAuthenticated && this.user) return
      if (this.loading) return

      this.loading = true
      try {
        const tokenCookie = useCookie('access_token')
        if (tokenCookie.value) {
          this.token = tokenCookie.value
          this.isAuthenticated = true
        }
        await this.fetchUser(true)
      } catch {
        this.reset()
      } finally {
        this.loading = false
      }
    },

    /** Backend'den kullanıcı bilgisi çek */
    async fetchUser(silent = false) {
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<ApiResponse<User>>('users/me', {
          baseURL: config.public.apiBase,
          credentials: 'include',
          headers: this.token
            ? { Authorization: `Bearer ${this.token}` }
            : undefined,
        })

        if (response.success && response.data) {
          this.user = response.data
          this.isAuthenticated = true
          return response.data
        }
        throw new Error(response.message || 'Kullanıcı bilgisi alınamadı')
      } catch (error) {
        this.reset()
        if (!silent) throw error
        return null
      }
    },

    /** Refresh token ile yeni access token al */
    async tryRefresh(): Promise<boolean> {
      // Çoklu eş zamanlı refresh isteğini önle
      if (this.refreshPromise) return this.refreshPromise

      this.refreshPromise = (async () => {
        try {
          const config = useRuntimeConfig()
          const response = await $fetch<ApiResponse<RefreshResponse>>(
            'auth/refresh',
            {
              method: 'POST',
              baseURL: config.public.apiBase,
              credentials: 'include',
              body: {},
            },
          )

          if (response?.success && response.data?.token) {
            this.token = response.data.token
            if (response.data.csrfToken) {
              this.csrfToken = response.data.csrfToken
            }
            this.isAuthenticated = true

            // Cookie güncelle
            const tokenCookie = useCookie('access_token', {
              maxAge: 60 * 15, // 15 dakika
              path: '/',
              sameSite: 'lax',
            })
            tokenCookie.value = this.token
            return true
          }
          return false
        } catch {
          return false
        } finally {
          this.refreshPromise = null
        }
      })()

      return this.refreshPromise
    },

    /** Çıkış yap */
    async logout() {
      try {
        const config = useRuntimeConfig()
        await $fetch('auth/logout', {
          method: 'POST',
          baseURL: config.public.apiBase,
          credentials: 'include',
        }).catch(() => {
          // Backend hatası olsa bile devam et
        })
      } finally {
        this.reset()
        // Cookie temizle
        const tokenCookie = useCookie('access_token')
        tokenCookie.value = null
        const refreshCookie = useCookie('refresh_token')
        refreshCookie.value = null
      }
    },

    /** State sıfırla */
    reset() {
      this.user = null
      this.isAuthenticated = false
      this.token = null
      this.csrfToken = null
      this.error = null
    },
  },
})
```

---

## 6. MIDDLEWARE

### 6.1 `middleware/auth.global.ts`

```typescript
/**
 * Global auth middleware — her route değişiminde çalışır.
 * Public route'lar hariç tüm sayfalar login gerektirir.
 * Vendor/Admin route'ları ek rol kontrolü yapar.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Public route'lar — giriş gerekmez
  const publicPaths = ['/', '/auth', '/products', '/categories', '/brands', '/vendors', '/search', '/help', '/policies', '/announcements']
  const isPublic = publicPaths.some(
    (path) => to.path === path || to.path.startsWith(path + '/'),
  )

  if (isPublic) return

  const authStore = useAuthStore()

  // İlk yüklemede init çağır
  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.init()
  }

  // Hala giriş yapılmamış → login'e yönlendir
  if (!authStore.isLoggedIn) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Vendor route'ları → VENDOR rolü gerekli
  if (to.path.startsWith('/vendor')) {
    if (authStore.user?.role !== 'VENDOR') {
      return navigateTo('/')
    }
  }

  // Admin route'ları → ADMIN veya SUPER_ADMIN rolü gerekli
  if (to.path.startsWith('/admin')) {
    const role = authStore.user?.role
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return navigateTo('/')
    }
  }
})
```

### 6.2 `middleware/guest.ts` (named middleware)

```typescript
/**
 * Guest middleware — zaten giriş yapmış kullanıcıyı anasayfaya yönlendir.
 * Kullanım: definePageMeta({ middleware: 'guest' })
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (authStore.isLoggedIn) {
    return navigateTo('/')
  }
})
```

---

## 7. PLUGINS

### 7.1 `plugins/toast.client.ts`

```typescript
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, {
    position: 'top-right',
    timeout: 4000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    showCloseButtonOnHover: true,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
    maxToasts: 3,
    newestOnTop: true,
  })
})
```

---

## 8. LAYOUT'LAR

### 8.1 `layouts/default.vue`

Mevcut layout'u temel al ama **büyük ölçüde sadeleştir**. Mevcut layout yaklaşık 500 satır ve çok fazla iş yapıyor (3 ekosistem, side ads, location modal, vendor modal, vb.). Yeniden yazımda:

- **Ekosistem switcher** kalsın ama daha kompakt olsun
- **Side ads** kaldırıldı (Bölüm 9'da admin'den yönetilecek)
- **Location modal** kaldırıldı (ileride eklenecek)
- **AI widget** kaldırıldı
- **Vendor required modal** ayrı component'e taşındı

```
Yapı:
<template>
  <div class="min-h-screen bg-surface-50">
    <!-- Sticky Header -->
    <div class="sticky top-0 z-50">
      <!-- Top Bar (desktop) — ekosistem switcher + yardımcı linkler -->
      <AppTopBar />
      <!-- Ana Header — logo + arama + aksiyonlar -->
      <AppHeader />
      <!-- MegaMenu (desktop) — kategoriler -->
      <AppMegaMenu />
    </div>

    <!-- İçerik -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Mobile Bottom Nav -->
    <AppMobileNav />
  </div>
</template>

<script setup lang="ts">
// Sadece auth init — gerisi alt component'lerde
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.init()
})
</script>
```

**ÖNEMLİ:** Tüm header, footer, nav, megamenu ayrı component olarak yazılacak (`components/app/` altında). Bu bölümde bunların hepsini yaz:

- `components/app/AppTopBar.vue` — Ekosistem switcher + legal/help dropdown + language (desktop only)
- `components/app/AppHeader.vue` — Logo + arama + kullanıcı menu + sepet
- `components/app/AppMegaMenu.vue` — Kategori navigasyonu (placeholder, Bölüm 2'de doldurulacak)
- `components/app/AppFooter.vue` — Link grupları + copyright
- `components/app/AppMobileNav.vue` — Mobile bottom navigation (5 tab)
- `components/app/AppUserMenu.vue` — Profil dropdown (login/logout)

### 8.2 `layouts/auth.vue`

Mevcut auth layout'u güzel, sadece `<script setup lang="ts">` yap ve tipler ekle.

### 8.3 `layouts/vendor.vue`

Mevcut vendor layout'u güzel, temizle:
- `<script setup lang="ts">` yap
- `any` kaldır
- `useAuthStore` import ekle
- `pendingOrderInterval` için `ReturnType<typeof setInterval>` tipi
- `routeTitles` Record tipi ekle

### 8.4 `layouts/admin.vue`

Mevcut admin layout'u güzel, temizle:
- `<script setup lang="ts">` yap
- Navigation yapısı için interface tanımla
- `isAdmin` kontrolü middleware'e taşındı (layout'tan kaldır)

---

## 9. TEMEL UI BİLEŞENLERİ

`components/ui/` altında şunları yaz:

### 9.1 `UiButton.vue`

```
Props:
- variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' (default: 'primary')
- size: 'sm' | 'md' | 'lg' (default: 'md')
- loading: boolean (default: false)
- disabled: boolean (default: false)
- as: 'button' | 'a' | 'NuxtLink' (default: 'button')
- to: string (NuxtLink için)
- type: 'button' | 'submit' | 'reset' (default: 'button')

Slot: default (buton içeriği)

Tailwind sınıfları variant + size'a göre computed ile oluşturulacak.
Loading durumunda spinner göster + disabled yap.
```

### 9.2 `UiInput.vue`

```
Props:
- modelValue: string | number
- type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' (default: 'text')
- label: string
- placeholder: string
- error: string (hata mesajı — gösterildiğinde kırmızı border)
- hint: string (yardımcı metin)
- disabled: boolean
- required: boolean

Emit: update:modelValue

Slots: prefix, suffix (ikon vs. için)
```

### 9.3 `UiModal.vue`

```
Props:
- open: boolean (v-model:open)
- title: string
- size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- closable: boolean (default: true)

Emit: update:open

Teleport to body.
Backdrop click → close (closable ise).
ESC key → close.
Focus trap.
Slots: default (içerik), footer (butonlar)
```

### 9.4 `UiDropdown.vue`

```
Props:
- align: 'left' | 'right' (default: 'right')

Slots: trigger (tetikleyici), default (dropdown içeriği)
Click outside → close.
```

### 9.5 `UiAvatar.vue`

```
Props:
- src: string | null
- name: string (initials için fallback)
- size: 'xs' | 'sm' | 'md' | 'lg' (default: 'md')

Görsel yoksa ismin baş harflerini göster, renkli arka plan.
```

### 9.6 `UiSpinner.vue`

```
Props:
- size: 'sm' | 'md' | 'lg' (default: 'md')
- color: string (default: 'brand-600')

SVG animasyonlu spinner.
```

### 9.7 `UiBadge.vue`

```
Props:
- variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' (default: 'neutral')
- size: 'sm' | 'md' (default: 'sm')
- dot: boolean (sol tarafta renkli nokta)

Slot: default (badge metni)
```

### 9.8 `UiEmptyState.vue`

```
Props:
- title: string
- description: string
- icon: Component (heroicon)

Slots: action (buton alanı)
```

---

## 10. `app.vue`

Mevcut app.vue çok karmaşık (OAuth callback handling). Sadeleştir:

```typescript
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// OAuth callback token'ı middleware veya auth/callback sayfasında ele alınacak.
// app.vue sadece layout + page render.
</script>
```

OAuth callback mantığı → `pages/auth/callback.vue` sayfasına taşındı (Bölüm 3'te yazılacak). Ama bu bölümde şu placeholder sayfayı oluştur:

### `pages/auth/callback.vue` (placeholder)

```vue
<script setup lang="ts">
/**
 * Google OAuth2 callback handler.
 * Backend redirect sonrası token query param'dan alınır.
 */
definePageMeta({ layout: 'auth', middleware: 'guest' })

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

onMounted(async () => {
  const token = route.query.token as string | undefined
  const refreshToken = route.query.refreshToken as string | undefined

  if (token) {
    // Cookie'ye yaz
    const tokenCookie = useCookie('access_token', {
      maxAge: 60 * 15,
      path: '/',
      sameSite: 'lax',
    })
    tokenCookie.value = token
    authStore.token = token
    authStore.isAuthenticated = true

    if (refreshToken) {
      const refreshCookie = useCookie('refresh_token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'lax',
      })
      refreshCookie.value = refreshToken
    }

    try {
      await authStore.fetchUser()
      toast.success('Giriş başarılı!')

      // URL temizle
      const redirect = (route.query.redirect as string) || '/'
      await navigateTo(redirect, { replace: true })
    } catch {
      toast.error('Giriş doğrulanırken hata oluştu')
      await navigateTo('/auth/login', { replace: true })
    }
  } else if (route.query.error) {
    toast.error('Google ile giriş başarısız oldu')
    await navigateTo('/auth/login', { replace: true })
  } else {
    await navigateTo('/auth/login', { replace: true })
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <UiSpinner size="lg" />
    <p class="ml-4 text-surface-500">Giriş yapılıyor...</p>
  </div>
</template>
```

---

## 11. PLACEHOLDER SAYFALAR

Bu bölümde şu sayfaları oluştur (sonraki bölümlerde doldurulacak):

```
pages/
├── index.vue               → "Anasayfa — Bölüm 2'de yazılacak"
├── auth/
│   ├── login.vue           → Google login butonu + placeholder
│   ├── register.vue        → Placeholder
│   └── callback.vue        → Yukarıda yazıldı
└── [...slug].vue           → 404 sayfası
```

### `pages/auth/login.vue`

```vue
<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const { loginWithGoogle } = useAuth()
</script>

<template>
  <div class="max-w-md mx-auto text-center">
    <h1 class="text-3xl font-display font-bold text-surface-900 mb-2">
      Hoş Geldiniz
    </h1>
    <p class="text-surface-500 mb-8">
      BarterBorsa'ya giriş yapın
    </p>

    <UiButton
      variant="outline"
      size="lg"
      class="w-full"
      @click="loginWithGoogle"
    >
      <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <!-- Google 'G' icon SVG -->
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Google ile Giriş Yap
    </UiButton>
  </div>
</template>
```

### `pages/[...slug].vue` (404)

```vue
<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <UiEmptyState
    title="Sayfa Bulunamadı"
    description="Aradığınız sayfa mevcut değil veya taşınmış olabilir."
  >
    <template #action>
      <UiButton to="/">Anasayfaya Dön</UiButton>
    </template>
  </UiEmptyState>
</template>
```

---

## 12. CSS — `assets/css/main.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Genel stiller */
@layer base {
  body {
    @apply font-sans text-surface-900 antialiased;
  }

  /* Focus ring stili */
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-brand-500;
  }
}

@layer components {
  /* Glass efekti */
  .glass {
    @apply bg-white/80 backdrop-blur-xl;
  }
}
```

---

## 13. i18n — `locales/tr.json`

Başlangıç için temel çeviriler:

```json
{
  "common": {
    "login": "Giriş Yap",
    "register": "Kayıt Ol",
    "logout": "Çıkış Yap",
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle",
    "search": "Ara",
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu",
    "success": "İşlem başarılı",
    "confirm": "Onayla",
    "back": "Geri",
    "next": "İleri",
    "close": "Kapat",
    "yes": "Evet",
    "no": "Hayır",
    "noResults": "Sonuç bulunamadı",
    "showMore": "Daha Fazla",
    "showLess": "Daha Az"
  },
  "nav": {
    "home": "Ana Sayfa",
    "categories": "Kategoriler",
    "cart": "Sepet",
    "orders": "Siparişler",
    "account": "Hesabım",
    "profile": "Profil",
    "favorites": "Favoriler",
    "wallet": "Cüzdan",
    "notifications": "Bildirimler",
    "help": "Yardım",
    "legal": "Yasal",
    "admin": "Admin",
    "myStore": "Mağazam",
    "searchPlaceholder": "Ürün, marka veya kategori ara...",
    "becomeVendor": "Satıcı Ol"
  },
  "auth": {
    "loginTitle": "Hoş Geldiniz",
    "loginSubtitle": "BarterBorsa'ya giriş yapın",
    "loginWithGoogle": "Google ile Giriş Yap",
    "loginSuccess": "Giriş başarılı!",
    "loginFailed": "Giriş başarısız oldu",
    "logoutSuccess": "Çıkış yapıldı",
    "registerTitle": "Hesap Oluştur",
    "sessionExpired": "Oturumunuz sona erdi, lütfen tekrar giriş yapın"
  },
  "ecosystem": {
    "bazarx": "BazarX",
    "ticaritakas": "TicariTakas",
    "barterborsa": "BarterBorsa",
    "bazarxSubtitle": "Online Alışveriş",
    "ticaritakasSubtitle": "Ticari Takas",
    "barterborsaSubtitle": "Barter Borsa"
  }
}
```

---

## 14. DOĞRULAMA KRİTERLERİ

Bu bölüm tamamlandığında şunlar çalışmalı:

1. `pnpm install` → hatasız
2. `pnpm dev` → http://localhost:3000 açılmalı
3. `pnpm build` → 0 hata
4. `pnpm typecheck` → 0 hata, 0 `any`
5. Anasayfa (`/`) → default layout ile render
6. `/auth/login` → auth layout, Google butonu görünür
7. `/auth/callback?token=xxx` → token cookie'ye yazılır, auth store güncellenir
8. Korumalı bir route'a erişim → `/auth/login` redirect
9. BFF proxy çalışıyor → `/api/v1/users/me` backend'e gidiyor
10. UI bileşenleri render oluyor (UiButton, UiInput, UiModal, vs.)
11. Toast bildirimi çalışıyor
12. Layout'lar düzgün render (default, auth, vendor, admin)
13. Mobile bottom nav görünüyor (< lg)
14. 404 sayfası çalışıyor (`/nonexistent`)

---

## 15. DOSYA YAPISI ÖZETİ

```
frontend/
├── nuxt.config.ts
├── tailwind.config.ts
├── package.json
├── tsconfig.json
├── app.vue
├── assets/css/main.css
├── locales/tr.json
├── server/api/v1/[...].ts
├── plugins/toast.client.ts
├── middleware/
│   ├── auth.global.ts
│   └── guest.ts
├── stores/
│   └── auth.ts
├── composables/
│   ├── useApi.ts
│   ├── useAuth.ts
│   └── useToast.ts
├── types/
│   ├── api.ts
│   ├── auth.ts
│   └── common.ts
├── components/
│   ├── app/
│   │   ├── AppTopBar.vue
│   │   ├── AppHeader.vue
│   │   ├── AppMegaMenu.vue
│   │   ├── AppFooter.vue
│   │   ├── AppMobileNav.vue
│   │   └── AppUserMenu.vue
│   └── ui/
│       ├── UiButton.vue
│       ├── UiInput.vue
│       ├── UiModal.vue
│       ├── UiDropdown.vue
│       ├── UiAvatar.vue
│       ├── UiSpinner.vue
│       ├── UiBadge.vue
│       └── UiEmptyState.vue
├── layouts/
│   ├── default.vue
│   ├── auth.vue
│   ├── vendor.vue
│   └── admin.vue
└── pages/
    ├── index.vue
    ├── [...slug].vue
    └── auth/
        ├── login.vue
        ├── register.vue
        └── callback.vue
```

> **Not:** Her dosyayı tam implementasyonla yaz. Placeholder "TODO" bırakma (UI bileşenlerinin template + style'ı dahil). Doğrulama kriterlerinin tamamını karşıla.
