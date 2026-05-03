// apps/mobile/constants/api.ts
import Constants from 'expo-constants'

export const API_BASE = (Constants.expoConfig?.extra?.apiBase as string) || 'http://localhost:3001'
export const SOCKET_URL = (Constants.expoConfig?.extra?.socketUrl as string) || 'http://localhost:3001'
export const MINIO_BASE = (Constants.expoConfig?.extra?.minioBase as string) || 'http://localhost:9000/bazarx-public'
