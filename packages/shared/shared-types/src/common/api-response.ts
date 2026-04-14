// packages/shared/shared-types/src/common/api-response.ts

/**
 * Tüm sistem genelinde kullanılan standart API yanıt formatı.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}
