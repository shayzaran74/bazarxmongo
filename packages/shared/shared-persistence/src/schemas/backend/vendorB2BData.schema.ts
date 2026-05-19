import { Schema, model, Types } from 'mongoose';

export const B2BSubscriptionStatus = ['ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'SUSPENDED'] as const;
export type B2BSubscriptionStatusType = typeof B2BSubscriptionStatus[number];

export const B2BTier = ['NONE', 'CORE', 'PLUS', 'PREMIUM', 'ELITE', 'APEX'] as const;
export type B2BTierType = typeof B2BTier[number];

export interface IVendorB2BData {
  _id?: string;
  id: string;
  vendorId: string;
  b2bTier: B2BTierType;
  isB2B: boolean;
  wholesaleEnabled: boolean;
  isBrandOwner: boolean;
  authorizedBrands: string[];
  corporateCode?: string;
  barterLimitOverride?: Types.Decimal128;
  b2bWalletLimit?: Types.Decimal128;
  b2bCommRate?: Types.Decimal128;
  subscriptionStatus: B2BSubscriptionStatusType;
  subscriptionStartedAt?: Date;
  subscriptionExpiresAt?: Date;
  lastPaidAt?: Date;
  firstTransactionAt?: Date;
}

export const VendorB2BDataSchema = new Schema<IVendorB2BData>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  b2bTier: { type: String, enum: B2BTier, default: 'NONE' },
  isB2B: { type: Boolean, default: false, alias: 'is_b2b' },
  wholesaleEnabled: { type: Boolean, default: false, alias: 'wholesale_enabled' },
  isBrandOwner: { type: Boolean, default: false, alias: 'is_brand_owner' },
  authorizedBrands: { type: [String], default: [] },
  corporateCode: { type: String, alias: 'corporate_code' },
  barterLimitOverride: { type: Types.Decimal128, alias: 'barter_limit_override' },
  b2bWalletLimit: { type: Types.Decimal128, alias: 'b2b_wallet_limit' },
  b2bCommRate: { type: Types.Decimal128, alias: 'b2b_comm_rate' },
  subscriptionStatus: { type: String, enum: B2BSubscriptionStatus, default: 'EXPIRED' },
  subscriptionStartedAt: { type: Date, alias: 'subscription_started_at' },
  subscriptionExpiresAt: { type: Date, alias: 'subscription_expires_at' },
  lastPaidAt: { type: Date, alias: 'last_paid_at' },
  firstTransactionAt: { type: Date, alias: 'first_transaction_at' },
}, {
  timestamps: true,
  collection: 'vendor_b2b_data',
});

// Composite index
VendorB2BDataSchema.index({ subscriptionStatus: 1, subscriptionExpiresAt: 1 });

export const VendorB2BData = model<IVendorB2BData>('VendorB2BData', VendorB2BDataSchema);
