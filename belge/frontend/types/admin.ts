import type { Category, Product } from './product';

export interface AdminVendor {
  id: string | number;
  businessName: string; // Legacy
  email?: string; // Legacy
  phone?: string; // Legacy
  city?: string; // Legacy
  district?: string; // Legacy
  status?: string;
  isFeatured?: boolean; // Legacy
  logoUrl?: string; // Legacy
  coverImageUrl?: string; // Legacy
  
  // New Nested Structures (DDD)
  profile?: {
    storeName?: string;
    businessType?: string;
    businessRegistration?: string;
    address?: string;
    city?: string;
    district?: string;
    website?: string;
    description?: string;
    isFeatured?: boolean;
    logoUrl?: string;
    coverImageUrl?: string;
    bankName?: string;
    bankAccountName?: string;
    bankIban?: string;
  };

  b2bData?: {
    isB2B?: boolean;
    b2bTier?: string;
    corporateCode?: string | null;
    barterLimitOverride?: number | null;
    b2bCommRate?: number | null;
  };

  stats?: {
    totalSales?: number;
    averageRating?: number;
    reviewCount?: number;
  };

  company?: {
    name?: string;
    taxNumber?: string;
    taxOffice?: string;
  };

  // Legacy B2B fields (Flat)
  isB2B?: boolean;
  b2bTier?: string;
  corporateCode?: string | null;
  barterLimitOverride?: number | null;
  commissionRateB2B?: number | null;
  
  // Stats fields (Legacy)
  rating?: number;
  reviewCount?: number;
  
  // Flattened user fields (from backend mapper - Legacy)
  userName?: string;
  userPhone?: string | null;
  userAvatar?: string | null;
  
  // Relationships
  user?: { 
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName?: string;
      phone?: string | null;
      avatar?: string | null;
    }
  };
  categories?: Category[]; // Legacy
  vendorCategories?: Array<{
    id: string;
    category: Category;
  }>;
  _count?: { listings?: number; products?: number };
  vendorTier?: string;
  createdAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface AdminUser {
  id: string | number;
  email: string;
  role?: string;
  status?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // Nested structures (Native)
  profile?: {
    firstName: string;
    lastName?: string;
    phone?: string | null;
    avatar?: string | null;
  };
  
  userLevel?: {
    currentXP?: number;
    level?: number;
  };

  // Legacy/Flattened profile fields (Temporary)
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatar?: string | null;

  // Stats
  currentTier?: string;
  loyaltyTier?: string;
  trustScore?: number;

  // Relationships and Computed
  vendor?: { id: string; status: string; businessName?: string } | null;
  computedRole?: string;
  walletTier?: string | null;
}

export interface AdminOrderItem {
  id: string | number;
  orderId: string | number;
  productId: string | number;
  quantity: number;
  price: number;
  status: string;
  Product?: Product;
}

export interface AdminOrder {
  id: string | number;
  orderNumber: string;
  userId: string | number;
  vendorId?: string | number;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  paidAt?: string;
  paymentIntentId?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  notes?: string;
  User?: AdminUser;
  Vendor?: AdminVendor;
  OrderItem?: AdminOrderItem[];
}
