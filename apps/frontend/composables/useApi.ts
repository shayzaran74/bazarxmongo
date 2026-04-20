import type { ApiResponse } from '@barterborsa/shared-types'

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

    if (authStore.token) headers['Authorization'] = `Bearer ${authStore.token}`
    if (authStore.csrfToken && options.method && options.method !== 'GET') {
      headers['X-CSRF-Token'] = authStore.csrfToken
    }

    try {
      // baseURL parametresini kaldırıyoruz, böylece Nuxt proxy (nitro) üzerinden mevcut host kullanılır.
      return await $fetch<ApiResponse<T>>(normalizedPath, { ...options, headers })
    } catch (error: any) {
      if ((error.status === 419 || error.status === 401) && authStore.isLoggedIn) {
        if (error.status === 419) {
          const refreshed = await authStore.tryRefresh()
          if (refreshed) {
            headers['Authorization'] = `Bearer ${authStore.token}`
            return await $fetch<ApiResponse<T>>(normalizedPath, { ...options, headers })
          }
        }
        authStore.logout()
      }
      throw error
    }
  }
  return { $api: customFetch }
}
