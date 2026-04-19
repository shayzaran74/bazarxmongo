/**
 * Tüm sistem genelinde kullanılan standart API yanıt formatı.
 * Auth gibi özel durumları desteklemek için opsiyonel alanlar eklenmiştir.
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    user?: T;
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
