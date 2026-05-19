// packages/shared/shared-persistence/src/schemas/backend/vendor.schema.ts
// Vendor — Prisma → Mongoose migration (ADR-005 Faz 2a)
// Document-model decision: Reference (Vendor ayrı collection'da kalır)

import { Schema, model, Types } from 'mongoose';

// Enums
export const VendorStatus = ['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const;
export type VendorStatusType = typeof VendorStatus[number];

export const VendorTier = ['CORE', 'PLUS', 'PREMIUM', 'ELITE', 'APEX'] as const;
export type VendorTierType = typeof VendorTier[number];

export const VendorType = ['COMMERCE', 'RESTAURANT'] as const;
export type VendorTypeType = typeof VendorType[number];

export interface IVendor {
  _id?: string;
  id: string;
  status: VendorStatusType;
  companyId: string;
  createdAt: Date;
  ecosystemId?: string;
  isVerified: boolean;
  lastAuditAt?: Date;
  membershipTierId?: string;
  rejectionReason?: string;
  slug: string;
  suspensionReason?: string;
  tier: VendorTierType;
  updatedAt: Date;
  userId: string;
  verifiedAt?: Date;
  barterEnabled: boolean;
  vendorType: VendorTypeType;
}

export const VendorSchema = new Schema<IVendor>({
  _id: { type: String },
  id: { type: String, required: true },
  status: { type: String, enum: VendorStatus, default: 'PENDING' },
  companyId: { type: String, alias: 'company_id' },
  createdAt: { type: Date, alias: 'created_at' },
  ecosystemId: { type: String, alias: 'ecosystem_id' },
  isVerified: { type: Boolean, default: false, alias: 'is_verified' },
  lastAuditAt: { type: Date, alias: 'last_audit_at' },
  membershipTierId: { type: String, alias: 'membership_tier_id' },
  rejectionReason: { type: String, alias: 'rejection_reason' },
  slug: { type: String },
  suspensionReason: { type: String, alias: 'suspension_reason' },
  tier: { type: String, enum: VendorTier, default: 'CORE' },
  updatedAt: { type: Date, alias: 'updated_at' },
  userId: { type: String, alias: 'user_id' },
  verifiedAt: { type: Date, alias: 'verified_at' },
  barterEnabled: { type: Boolean, default: false, alias: 'barter_enabled' },
  vendorType: { type: String, enum: VendorType, default: 'COMMERCE' },
}, {
  timestamps: true,
  collection: 'vendors',
});

VendorSchema.index({ status: 1 });
VendorSchema.index({ tier: 1 });
VendorSchema.index({ vendorType: 1 });
VendorSchema.index({ companyId: 1 }, { unique: true });
VendorSchema.index({ userId: 1 }, { unique: true });
VendorSchema.index({ slug: 1 }, { unique: true });

export const Vendor = model<IVendor>('Vendor', VendorSchema);