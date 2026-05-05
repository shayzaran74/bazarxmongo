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

      if ((error.status === 419 || error.status === 401) && authStore.isLoggedIn) {
        if (error.status === 419) {
          const refreshed = await authStore.tryRefresh()
          if (refreshed) {
            headers['Authorization'] = `Bearer ${authStore.token}`
            return await $fetch<ApiResponse<T>>(normalizedPath, { ...options, headers })
          }
        }
        authStore.logout()
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
