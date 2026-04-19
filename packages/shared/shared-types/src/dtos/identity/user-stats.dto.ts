export interface UserProfileStats {
  orderCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  activeOffers: number;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  district?: string;
  neighborhood?: string;
}
