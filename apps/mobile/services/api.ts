// apps/mobile/services/api.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE } from '@/constants/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// İstek öncesi token ekle
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — 401 → try refresh, then clear token
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          })
          if (res.data.success && res.data.data.accessToken) {
            const newAccessToken = res.data.data.accessToken
            await SecureStore.setItemAsync('access_token', newAccessToken)
            err.config.headers.Authorization = `Bearer ${newAccessToken}`
            return api(err.config)
          }
        } catch {
          await SecureStore.deleteItemAsync('access_token')
          await SecureStore.deleteItemAsync('refresh_token')
        }
      } else {
        await SecureStore.deleteItemAsync('access_token')
      }
    }
    return Promise.reject(err)
  }
)

export default api
