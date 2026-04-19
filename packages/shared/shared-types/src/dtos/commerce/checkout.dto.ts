export interface CheckoutNewAddress {
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
}

export interface CheckoutPaymentPayload {
  cartItems: { productId: string; quantity: number }[];
  selectedAddressId?: string | number | null;
  customAddress?: CheckoutNewAddress | null;
  saveAddress?: boolean;
  couponCode?: string;
  escrowCouponId?: string | null;
  paidWithXP?: number;
  pendingOrderId?: string | null;
}

export interface CheckoutPaymentIntentResponse {
  clientSecret?: string;
  orderId: string;
  htmlContent?: string;
}

export interface CheckoutWalletPaymentResponse {
  success: boolean;
  orderId: string;
}

export interface CheckoutCoupon {
  code: string;
  discountAmount: number;
}

export interface CheckoutLoyaltyStatus {
  points: number;
  tier: string;
}

export interface CheckoutLegalDoc {
  id: string;
  title: string;
  slug: string;
  content: string;
}

export interface CheckoutSettings {
  allowWalletPayment?: boolean;
  showLoyaltyPoints?: boolean;
  shippingCost?: number | string;
  shippingTiers?: string;
}

export interface CheckoutEscrowCoupon {
  id: string;
  rewardValue: number;
}
