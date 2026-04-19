export interface UserProfile {
  firstName: string
  lastName: string
  phone: string | null
  avatar: string | null
  city?: string | null
  district?: string | null
  neighborhood?: string | null
}

export interface UserStats {
  userTier: 'CORE' | 'PRIME' | 'ELITE' | 'APEX'
  loyaltyTier: 'BEGINNER' | 'INTERMEDIATE' | 'PRO'
  trustScore: number
  currentYearVolume?: number
  referralCode?: string | null
}

export interface UserLevel {
  currentXP: number
  level: number
}

export interface UserDTO {
  id: string
  email: string
  role: string
  status: string
  isEmailVerified: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  lastLoginAt?: string | null
  createdAt?: string
  updatedAt?: string
  
  // Native Nested Structure
  profile: UserProfile
  stats: UserStats
  userLevel: UserLevel
  
  // Relations
  vendor?: {
    id: string
    status: string
    businessName?: string
    vendorTier?: string
  } | null
  Wallet?: {
    balance: number
    availableBalance: number
    blockedBalance: number
    currency: string
    barterBalance: number
    barterCreditLimit: number
  } | null
  Memberships?: Array<{
    tier: string
    isActive: boolean
  }>
}
