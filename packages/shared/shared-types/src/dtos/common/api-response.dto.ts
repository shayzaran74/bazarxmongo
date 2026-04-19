export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  user?: UserDTO;
  token?: string;
  accessToken?: string;
  csrfToken?: string;
  meta?: Record<string, any>;
  timestamp?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVendorProducts?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: string;
  isPremium?: boolean;
  avatar?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  city?: string;
  district?: string;
  regionName?: string;
  currentTier?: string;
  loyalty?: {
    xp: number;
    level: number;
  };
  wallet?: {
    balance: number;
    barterBalance: number;
  };
  vendor?: {
    status: string;
    businessName?: string;
  };
}

export interface UserProfileDTO {
  id: string;
  userId: string;
  phoneNumber?: string;
  avatarUrl?: string;
}
