export interface ApiResponse<T = void> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  url?: string;
}

export interface PaginatedResponse<T = void> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
