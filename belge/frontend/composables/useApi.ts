import type { RuntimeConfig } from 'nuxt/schema'
import type { ApiResponse } from '@barterborsa/shared-types'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  credentials?: 'include' | 'omit' | 'same-origin';
  showErrorToast?: boolean;
  baseURL?: string;
  [key: string]: unknown;
}

interface CustomFetchError {
  status?: number;
  data?: {
    error?: string | Record<string, unknown>;
    message?: string | Record<string, unknown>;
    success?: boolean;
  };
  message?: string;
  name?: string;
}

// Global request tracker for anomaly detection
const requestTracker = {
    count: 0,
    startTime: Date.now(),
    limit: 100, // max requests per minute
    timeWindow: 60000,
    anomalyFlagged: false
}

// Toast throttling to prevent spam
let lastErrorToastTime = 0
const TOAST_THROTTLE_MS = 3000

export const useApi = () => {
    // Lazy-bind authStore and config inside customFetch to break circular dependency and ensure context
    let authStore: { token: string | null; csrfToken: string | null; isAuthenticated: boolean; isAdmin: boolean; logout: () => void; tryRefresh: () => Promise<boolean> } | null = null;
    let config: RuntimeConfig | null = null;

    const customFetch = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
        // Late-bind config and authStore
        if (!config || !authStore) {
            try {
                // useRuntimeConfig works in most contexts (SSR/CSR)
                config = useRuntimeConfig() as RuntimeConfig
                
                if (!authStore) {
                    const { useAuthStore } = await import('~/stores/auth')
                    // Get nuxtApp to get pinia if available, but useAuthStore() usually works if in context
                    try {
                        authStore = useAuthStore()
                    } catch (storeError) {
                        try {
                            const nuxtApp = useNuxtApp()
                            authStore = useAuthStore(nuxtApp.$pinia as any)
                        } catch (e) {
                            // Still failing, will fallback to non-auth
                        }
                    }
                }
            } catch (e) {
                console.warn(`⚠️ [useApi] Running in degraded mode for ${url}: ${e instanceof Error ? e.message : String(e)}`)
                if (!config) config = { public: { apiBase: 'http://localhost:3001' } } as unknown as RuntimeConfig
            }
        }

        
        const showErrorToast = options.showErrorToast !== false

        const defaultOptions: FetchOptions = {
            baseURL: config.public.apiBase,
            credentials: 'include',
            headers: {
                ...(options.headers || {}),
            }
        }

        // Add Bearer token if it exists in authStore
        if (authStore?.token) {
            if (!defaultOptions.headers) defaultOptions.headers = {}
            defaultOptions.headers['Authorization'] = `Bearer ${authStore.token}`
        }

        // Add CSRF token for mutating requests
        const method = (options.method || 'GET').toUpperCase()
        if (method !== 'GET' && authStore?.csrfToken) {
            if (!defaultOptions.headers) defaultOptions.headers = {}
            defaultOptions.headers['X-CSRF-Token'] = authStore.csrfToken
        }

        // --- Anomaly Detection ---
        if (authStore?.isAdmin && method !== 'GET') {
            const now = Date.now()
            if (now - requestTracker.startTime > requestTracker.timeWindow) {
                requestTracker.count = 0
                requestTracker.startTime = now
                requestTracker.anomalyFlagged = false
            }

            requestTracker.count++

            if (requestTracker.count > requestTracker.limit && !requestTracker.anomalyFlagged) {
                requestTracker.anomalyFlagged = true
                console.error('⚠️ [Security] Anomaly detected: Burst request activity from admin account.')

                // Report anomaly to backend silently
                $fetch('/api/admin/logs/audit-anomaly', {
                    method: 'POST',
                    baseURL: config.public.apiBase,
                    credentials: 'include',
                    body: {
                        type: 'BURST_REQUESTS',
                        count: requestTracker.count,
                        path: url,
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
                    }
                }).catch(() => { }) // Silently fail if reporting fails
            }
        }
        // -------------------------
        let nuxtApp: any = null
        try { nuxtApp = useNuxtApp() } catch { /* ignore */ }
        const $toast = nuxtApp?.$toast
        const t = nuxtApp?.$i18n?.t || ((key: string) => key)

        try {
            const response = await $fetch(url, { 
                ...defaultOptions, 
                ...options,
                query: options.query || options.params
            } as Parameters<typeof $fetch>[1]) as ApiResponse<T>
            

        // Handle success with potential logic errors returned as success
        if (response && response.success === false && showErrorToast) {
            $toast?.error(response.error || response.message || t('common.error'))
        }

            return response as unknown as T
        } catch (error: unknown) {
            const fetchError = error as CustomFetchError;
            
            // Check for token expiration (419)
            if (fetchError.status === 419 && authStore?.isAuthenticated) {
                console.warn('🔄 Token expired, attempting silent refresh...')
                try {
                    const refreshed = await authStore.tryRefresh()
                    if (refreshed) {
                        // Retry original config
                        if (authStore.token) {
                            if (!defaultOptions.headers) defaultOptions.headers = {}
                            defaultOptions.headers['Authorization'] = `Bearer ${authStore.token}`
                        }
                        const retryResponse = await $fetch(url, { ...defaultOptions, ...options } as Parameters<typeof $fetch>[1]) as T
                        const retryApiResponse = retryResponse as unknown as ApiResponse<unknown>
                        if (retryApiResponse && retryApiResponse.success === false && showErrorToast) {
                            $toast?.error(retryApiResponse.error || retryApiResponse.message || t('common.error'))
                        }
                        return retryResponse
                    }
                } catch (refreshError) {
                    // Refresh failed, fall back to logout
                }
            }

            // Handle 401 errors globally (Session Expired or Refresh Failed)
            if (fetchError.status === 401 && authStore?.isAuthenticated) {
                console.warn('🔒 Session expired, redirecting to login...')
                authStore.logout()
                await navigateTo('/login')
            }

            // For 403 (Forbidden), we don't logout, just log the warning
            if (fetchError.status === 403) {
                console.warn('🚫 Access denied (403):', fetchError.data?.error || 'Insufficient permissions')
                if (showErrorToast) $toast?.warning(t('common.accessDenied'))
            } else if (showErrorToast) {
                const now = Date.now()
                const isConnectionError = !fetchError.data || (fetchError.message && fetchError.message.includes('fetch failed'))

                if (now - lastErrorToastTime > TOAST_THROTTLE_MS) {
                    lastErrorToastTime = now
                    if (isConnectionError) {
                        $toast?.error(t('common.serverConnectionError') || 'Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin.')
                    } else {
                        const errorData = fetchError.data?.error || fetchError.data?.message;
                        const errorMessage = typeof errorData === 'object' && errorData !== null
                            ? (('message' in errorData && typeof errorData.message === 'string') ? errorData.message : JSON.stringify(errorData))
                            : errorData;
                        $toast?.error(errorMessage || t('common.unexpectedError'))
                    }
                }
            }

            throw error
        }
    }

    return {
        $api: customFetch
    }
}
