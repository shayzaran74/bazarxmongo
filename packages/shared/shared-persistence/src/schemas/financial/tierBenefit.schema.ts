import { Schema, model, Types } from 'mongoose';

// TierBenefit — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITierBenefit {
  id: string;
  annualFee: Types.Decimal128;
  apiRatePerMin: number;
  archiveAfterDays: number;
  burnRate: Types.Decimal128;
  commissionBarter: Types.Decimal128;
  commissionCash: Types.Decimal128;
  createdAt: Date;
  excelBatchLimit: number;
  imageCountPerListing: number;
  listingLimit: number;
  roiRate: Types.Decimal128;
  updatedAt: Date;
  xpMultiplier: Types.Decimal128;
}

export const TierBenefitSchema = new Schema<ITierBenefit>({
  id: { type: String, required: true },
  annualFee: { type: Types.Decimal128, alias: 'annual_fee' },
  apiRatePerMin: { type: Number, alias: 'api_rate_per_min' },
  archiveAfterDays: { type: Number, alias: 'archive_after_days' },
  burnRate: { type: Types.Decimal128, alias: 'burn_rate' },
  commissionBarter: { type: Types.Decimal128, alias: 'commission_barter' },
  commissionCash: { type: Types.Decimal128, alias: 'commission_cash' },
  createdAt: { type: Date, alias: 'created_at' },
  excelBatchLimit: { type: Number, alias: 'excel_batch_limit' },
  imageCountPerListing: { type: Number, alias: 'image_count_per_listing' },
  listingLimit: { type: Number, alias: 'listing_limit' },
  roiRate: { type: Types.Decimal128, alias: 'roi_rate' },
  updatedAt: { type: Date, alias: 'updated_at' },
  xpMultiplier: { type: Types.Decimal128, alias: 'xp_multiplier' },
}, {
  timestamps: true,
  collection: 'tier_benefits',
});