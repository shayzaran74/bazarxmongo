// packages/domain-identity/src/application/dtos/user-full.dto.ts
// GetUserHandler ve /auth/me endpoint'inin döndürdüğü tam kullanıcı projeksiyonu.

export interface UserFullDto {
  id: string;
  email: string;
  role: string;
  status: string;
  platform: string;
  isEmailVerified: boolean;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  profile?: {
    phone?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    avatar?: string;
    bio?: string;
    birthday?: Date;
    gender?: string;
    firstName?: string;
    lastName?: string;
  };
  vendor?: {
    status: string;
    tier?: string;
    slug?: string;
    barterEnabled?: boolean;
    ecosystemId?: string;
    company?: {
      id: string;
      name: string;
      taxNumber?: string;
      taxOffice?: string;
    };
  };
}
