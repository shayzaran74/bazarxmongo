// packages/shared/shared-types/src/common/api-response.ts

/**
 * Tüm sistem genelinde kullanılan standart API yanıt formatı.
 * Auth gibi özel durumları desteklemek için opsiyonel alanlar eklenmiştir.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  user?: T; // Bazı backend yanıtlarında data yerine user dönebiliyor
  token?: string;
  accessToken?: string;
  csrfToken?: string;
  message?: string;
  error?: string;
  meta?: Record<string, any>;
  timestamp?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
