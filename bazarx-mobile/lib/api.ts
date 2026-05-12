import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
const API_URL = BASE_URL.endsWith('/') ? `${BASE_URL}api/v1/` : `${BASE_URL}/api/v1/`

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
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
          const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          })
          if (res.data.success && res.data.data.accessToken) {
            const newAccessToken = res.data.data.accessToken
            await SecureStore.setItemAsync('access_token', newAccessToken)
            err.config.headers.Authorization = `Bearer ${newAccessToken}`
            return api(err.config)
          }
        } catch {
          // Refresh başarısız, token'ları sil
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
