import type { Order, OrderItem } from './dtos/commerce/order.dto';
import type { UserDTO } from './dtos/common/api-response.dto';
import type { Vendor } from './dtos/vendor/vendor.dto';
import type { Product } from './dtos/catalog/product.dto';

// Common
export type { ApiResponse, PaginatedResponse, UserDTO, UserProfileDTO } from './dtos/common/api-response.dto';
export type { 
  ProductType, 
  Coupon, 
  HelpArticle,
  HelpCategory,
  LegalDocument, 
  LoyaltyProgressResponse, 
  EscrowCoupon, 
  PaymentResponse,
  BrandEcosystem 
} from './dtos/common/misc.dto';
export type {
  HomeAuction,
  HomeLottery,
  GroupBuyDTO,
  GroupBuyTier,
  HomeQuadCard,
  HomeQuadCardItem,
  HomePerformanceShowcaseData,
  HomeCategoryHighlightsData
} from './dtos/common/extra.dto';

// Auth
export type { LoginResponseDto, RegisterResponseDto } from './dtos/auth/auth.dto';
export * from './dtos/auth/login-user.input';
export * from './dtos/auth/register-user.input';

// Catalog
export type { Category } from './dtos/catalog/category.dto';
export type { Brand } from './dtos/catalog/brand.dto';
export type { Product, ProductVariant, ListingResponseDto, PaginatedListingsDto } from './dtos/catalog/product.dto';

// Commerce
export type { Cart, CartItem, CartSummary } from './dtos/commerce/cart.dto';
export type { Order, OrderItem } from './dtos/commerce/order.dto';

// Trade
export type { Review } from './dtos/trade/review.dto';
export type { ChatMessage, MessageStatus } from './dtos/trade/chat.dto';
export type { Offer } from './dtos/barter/offer.dto';
export type { Vendor, AdminVendor, VendorAdProduct, VendorPaginatedResponse } from './dtos/vendor/vendor.dto';

// Admin
export type { AdminMessage, AdminChatRoom, AdminAuditLog } from './dtos/admin/admin-chat.dto';
export type { WantedItem, SurplusItem } from './dtos/matching/matching.dto';

export interface AdminOrder extends Order {
  User?: UserDTO;
  Vendor?: Vendor;
  paymentMethod?: string;
  totalAmount: number;
  shippingAddress?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  notes?: string;
  OrderItem?: AdminOrderItem[];
}

export interface AdminOrderItem extends OrderItem {
  status?: string;
  Product?: Product;
}

export interface AdminWalletStats {
  balance: number;
  barterBalance: number;
  users: {
    total: number;
    active: number;
    pending: number;
    totalCommissionXP?: number;
    totalAdXP?: number;
    totalServiceXP?: number;
    totalBarterBalance?: number;
    totalXPEarned?: number;
    totalAdXPSpent?: number;
    totalServiceXPSpent?: number;
  };
  vendors: {
    total: number;
    verified: number;
    pending: number;
  };
}

export interface CategoryAttribute {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  options?: string[];
}

// Shared types for Address, Wallet etc if they are missing
export interface Address {
  id: string;
  userId: string;
  name: string;
  fullName?: string;
  phone?: string;
  city: string;
  district: string;
  address: string;
  addressLine?: string;
  isDefault: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  barterBalance: number;
  currency: string;
  blockedBalance?: number;
  cards?: any[];
  requests?: any[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'BARTER';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  txId: string;
  debit: number;
  credit: number;
  description: string;
}

export interface LoyaltyStatus {
  xp: number;
  level: number;
  rank: string;
}

export interface LoyaltyHistoryItem {
  id: string;
  points: number;
  action: string;
  createdAt: string;
}

export interface UserProfileStats {
  orderCount: number;
  totalSpent: number;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phone?: string;
  district?: string;
  neighborhood?: string;
  city?: string;
  avatarUrl?: string;
}

export interface BadgeStyle {
  backgroundColor?: string;
  color?: string;
  [key: string]: any;
}

export interface BadgeInfo {
  text: string;
  class?: string;
  style?: BadgeStyle;
  iconUrl?: string;
}

export interface DynamicBadges {
  topLeft?: BadgeInfo | null;
  topRight?: BadgeInfo | null;
  bottomLeft?: BadgeInfo | null;
  bottomRight?: BadgeInfo | null;
}

export interface ReviewEligibilityResponse {
  canReview: boolean;
  reason?: string;
}

export interface DeliveryEstimateResponse {
  minDays: number;
  maxDays: number;
}

export interface CheckoutNewAddress {
  name?: string;
  fullName?: string;
  phone?: string;
  city?: string;
  district?: string;
  address?: string;
  addressLine?: string;
  title?: string;
}

export type CheckoutAddress = CheckoutNewAddress & {
  id: string;
  isDefault?: boolean;
};

export type DemandMatch = any;
export type CartMergeItem = any;
export type CheckoutPaymentPayload = any;
export type CheckoutPaymentIntentResponse = any;
export type CheckoutWalletPaymentResponse = any;
export type CheckoutCoupon = any;
export type CheckoutLoyaltyStatus = any;
export type CheckoutLegalDoc = any;
export type CheckoutSettings = any;
export type CheckoutEscrowCoupon = any;
