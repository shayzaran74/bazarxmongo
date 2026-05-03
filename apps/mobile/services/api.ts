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

// 401 → token temizle
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token')
    }
    return Promise.reject(err)
  }
)

export default api
