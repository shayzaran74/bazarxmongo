// apps/frontend/composables/useApi.ts

import type { ApiResponse } from '~/types/api';

/**
 * Backend API istekleri için merkezi composable.
 * SSR-safe, hata yönetimi ve runtimeConfig destekli.
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const accessToken = useCookie('access_token'); // SSR uyumlu token okuma

  const $api = async <T>(
    path: string, 
    options: Record<string, unknown> = {}
  ): Promise<ApiResponse<T>> => {
    
    const apiBase = config.public.apiBase;
    if (!apiBase) {
      throw new Error('API Base URL is not configured in runtimeConfig');
    }

    // Header ayarları
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    // Eğer token varsa Authorization header ekle
    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    try {
      return await $fetch<ApiResponse<T>>(path, {
        baseURL: apiBase,
        ...options,
        headers,
      });
    } catch (err: unknown) {
      // Hata durumunda (ör: 401 Unauthorized), Token Refresh mantığı burada tetiklenebilir.
      throw err;
    }
  };

  return { $api };
};
