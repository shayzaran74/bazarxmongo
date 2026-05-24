import type { ApiResponse } from '@barterborsa/shared-types'

// Auth-related endpoints — 401 alındığında refresh'e gitme, direkt resetle
const AUTH_CRITICAL_PATHS = ['/auth/logout', '/auth/refresh']

export const useApi = () => {
  const config = useRuntimeConfig()

  const customFetch = async <T>(path: string, options: any = {}): Promise<ApiResponse<T>> => {
    const authStore = useAuthStore()
    let normalizedPath = path.startsWith('/') ? path : `/${path}`

    // Backend 'api/v1' prefix kullandığı için, 'api/' ile başlayan yolların
    // arasına 'v1' ekliyoruz (eğer zaten yoksa).
    if (normalizedPath.startsWith('/api/') && !normalizedPath.startsWith('/api/v1/')) {
      normalizedPath = normalizedPath.replace('/api/', '/api/v1/')
    }

    const headers: Record<string, string> = { ...(options.headers || {}) }

    // Token'ı önce store'dan, yoksa doğrudan cookie'den oku
    const { $toast } = useNuxtApp() as any
    const token = authStore.token || useCookie('access_token').value
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (authStore.csrfToken && options.method && options.method !== 'GET') {
      headers['X-CSRF-Token'] = authStore.csrfToken
    }

    // 15 saniyelik default timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await $fetch<ApiResponse<T>>(normalizedPath, {
        ...options,
        headers,
        credentials: 'include', // httpOnly access_token cookie'sinin gönderilmesi için zorunlu
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)

      // Timeout hatası özel kontrolü
      if (error.name === 'AbortError') {
        $toast.error('İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.')
        throw error
      }

      const is401 = error.status === 401 || error.status === 419
      const isAuthCritical = AUTH_CRITICAL_PATHS.some(p => normalizedPath.includes(p))

      // Auth kritik endpoint ise — 401 alsak bile refresh'e gitme, direkt resetle
      if (is401 && isAuthCritical) {
        authStore.reset()
        return { success: false, data: null as any } as ApiResponse<T>
      }

      if (is401 && authStore.isLoggedIn) {
        // httpOnly refresh_token cookie'si tarayıcı tarafından otomatik gönderilir
        try {
          const refreshRes = await $fetch<ApiResponse<{ accessToken: string; refreshToken: string }>>('/api/v1/auth/refresh', {
            method: 'POST',
            credentials: 'include', // refresh_token cookie'sini gönder
          })

          if (refreshRes.success && refreshRes.data) {
            // Yeni access_token cookie backend tarafından set edildi
            authStore.token = refreshRes.data.accessToken
            const retryHeaders = {
              ...headers,
              'Authorization': `Bearer ${refreshRes.data.accessToken}`
            }
            // Retry original request — yeni cookie ve header ile
            return await $fetch<ApiResponse<T>>(normalizedPath, {
              ...options,
              headers: retryHeaders,
              credentials: 'include',
            })
          }
          authStore.reset()
        } catch (refreshError: any) {
          // Refresh başarısız — logout'a gitmeden direkt resetle
          authStore.reset()
          return { success: false, data: null as any } as ApiResponse<T>
        }
      } else {
        // 401/419 dışındaki hataları (500, 404, vb.) global bildirime gönder
        const message = error.data?.message || error.message || 'Bir hata oluştu'
        $toast.error(message)
      }
      throw error
    }
  }
  return { $api: customFetch }
}
