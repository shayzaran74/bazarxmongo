import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/vendor-b2b-data.schema.ts
// VendorB2BData — Prisma → Mongoose migration (ADR-005 Faz 2a)
// Document-model decision: Embed (Vendor içinde 1:1)

import { Schema, Types, models } from 'mongoose';

export const B2BTier = ['NONE', 'BRONZE', 'SILVER', 'GOLD'] as const;
export type B2BTierType = typeof B2BTier[number];

export const B2BSubscriptionStatus = ['ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'SUSPENDED'] as const;
export type B2BSubscriptionStatusType = typeof B2BSubscriptionStatus[number];

export interface IVendorB2BData {
  _id?: string;
  vendorId: string;
  isB2B: boolean;
  b2bTier: B2BTierType;
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
  vendorId: { type: String, required: true },
  isB2B: { type: Boolean, default: false },
  b2bTier: { type: String, enum: B2BTier, default: 'NONE' },
  wholesaleEnabled: { type: Boolean, default: false },
  isBrandOwner: { type: Boolean, default: false },
  authorizedBrands: { type: [String], default: [] },
  corporateCode: { type: String },
  barterLimitOverride: { type: Types.Decimal128 },
  b2bWalletLimit: { type: Types.Decimal128 },
  b2bCommRate: { type: Types.Decimal128 },
  subscriptionStatus: { type: String, enum: B2BSubscriptionStatus, default: 'EXPIRED' },
  subscriptionStartedAt: { type: Date },
  subscriptionExpiresAt: { type: Date },
  lastPaidAt: { type: Date },
  firstTransactionAt: { type: Date },
}, {
  timestamps: true,
  collection: 'vendor_b2b_data',
});

VendorB2BDataSchema.index({ vendorId: 1 }, { unique: true });
VendorB2BDataSchema.index({ subscriptionStatus: 1, subscriptionExpiresAt: 1 });

export const VendorB2BData = models.VendorB2BData || createModelProxy<IVendorB2BData>('VendorB2BData', VendorB2BDataSchema);