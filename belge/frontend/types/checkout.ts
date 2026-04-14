export interface CheckoutLoyaltyStatus {
  currentXp: number;
  tier: string;
}

export interface CheckoutAddress {
  id: string | number;
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  isDefault?: boolean;
}

export interface CheckoutNewAddress {
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
}

export interface CheckoutCoupon {
  code: string;
  discountAmount: number;
}

export interface CheckoutEscrowCoupon {
  id: string;
  rewardValue: number;
  Listing?: {
    CatalogProduct?: {
      name: string;
    };
  };
}

export interface CheckoutLegalDoc {
  slug: string;
  title: string;
  content: string;
}

export interface CheckoutPaymentPayload {
  cartItems: Array<{ productId: string | number; quantity: number }>;
  selectedAddressId: string | number | null;
  customAddress: CheckoutNewAddress | null;
  saveAddress: boolean;
  couponCode?: string;
  escrowCouponId?: string | null;
  paidWithXP: number;
  pendingOrderId?: string | null;
}

export interface CheckoutPaymentIntentResponse {
  clientSecret?: string;
  htmlContent?: string;
  orderId: string;
}

export interface CheckoutWalletPaymentResponse {
  orderId: string;
}

export interface CheckoutSettings {
  shippingCost?: number | string;
  shippingTiers?: string;
}
