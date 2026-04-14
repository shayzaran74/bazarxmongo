// apps/frontend/composables/useApi.ts

import type { ApiResponse } from '@barterborsa/shared-types';

/**
 * Nuxt 3 için tip-güvenli API Fetch Wrapper.
 * baseURL runtimeConfig üzerinden yönetilir.
 */
export const useApi = () => {
  const config = useRuntimeConfig();

  const $api = async <T>(
    path: string, 
    options: Record<string, unknown> = {}
  ): Promise<ApiResponse<T>> => {
    try {
      // Baştaki slash'ı silerek baseURL ile çakışmayı önle
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
      
      const response = await $fetch<ApiResponse<T>>(normalizedPath, {
        baseURL: config.public.apiBase,
        ...options,
      });

      return response;
    } catch (error: unknown) {
      console.error(`[API Error] ${path}:`, error);
      throw error;
    }
  };

  return { $api };
};
