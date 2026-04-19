import type { ApiResponse } from '@barterborsa/shared-types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const apiBase = config.public.apiBase

  const customFetch = async <T>(path: string, options: any = {}): Promise<ApiResponse<T>> => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path
    const headers: Record<string, string> = { ...(options.headers || {}) }

    if (authStore.token) headers['Authorization'] = `Bearer ${authStore.token}`
    if (authStore.csrfToken && options.method && options.method !== 'GET') {
      headers['X-CSRF-Token'] = authStore.csrfToken
    }

    try {
      return await $fetch<ApiResponse<T>>(normalizedPath, { baseURL: apiBase, ...options, headers })
    } catch (error: any) {
      if ((error.status === 419 || error.status === 401) && authStore.isLoggedIn) {
        if (error.status === 419) {
          const refreshed = await authStore.tryRefresh()
          if (refreshed) {
            headers['Authorization'] = `Bearer ${authStore.token}`
            return await $fetch<ApiResponse<T>>(normalizedPath, { baseURL: apiBase, ...options, headers })
          }
        }
        authStore.logout()
      }
      throw error
    }
  }
  return { $api: customFetch }
}
