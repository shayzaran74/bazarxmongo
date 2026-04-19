export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  district?: string;
  city?: string;
  neighborhood?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isPremium?: boolean;
  profile?: UserProfile;
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
    slug?: string;
  };
}
