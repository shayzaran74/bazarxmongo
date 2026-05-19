import { Schema, model, Types } from 'mongoose';

// VendorStats — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVendorStats {
  _id?: string;
  id: string;
  vendorId: string;
  rating: Types.Decimal128;
  reviewCount: number;
  activeListingCount: number;
  loyaltyPoints: number;
  trustScore: Types.Decimal128;
  lastSyncAt?: Date;
}

export const VendorStatsSchema = new Schema<IVendorStats>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  rating: { type: Types.Decimal128, default: 0 },
  reviewCount: { type: Number, default: 0, alias: 'review_count' },
  activeListingCount: { type: Number, default: 0, alias: 'active_listing_count' },
  loyaltyPoints: { type: Number, default: 0, alias: 'loyalty_points' },
  trustScore: { type: Types.Decimal128, default: 100, alias: 'trust_score' },
  lastSyncAt: { type: Date, alias: 'last_sync_at' },
}, {
  timestamps: true,
  collection: 'vendor_stats',
});

export const VendorStats = model<IVendorStats>('VendorStats', VendorStatsSchema);
