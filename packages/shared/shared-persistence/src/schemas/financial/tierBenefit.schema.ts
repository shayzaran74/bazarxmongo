import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/financial/tierBenefit.schema.ts

import { Schema, Types } from 'mongoose';

export const B2BTierValues = ['CORE', 'PRIME', 'ELITE', 'APEX'] as const;
export type B2BTierType = typeof B2BTierValues[number];

export interface ITierBenefit {
  id: string;
  tier: B2BTierType;
  annualFee: Types.Decimal128;
  apiRatePerMin: number;
  archiveAfterDays: number;
  burnRate: Types.Decimal128;
  commissionBarter: Types.Decimal128;
  commissionCash: Types.Decimal128;
  excelBatchLimit: number;
  imageCountPerListing: number;
  listingLimit: number;
  roiRate: Types.Decimal128;
  xpMultiplier: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
}

export const TierBenefitSchema = new Schema<ITierBenefit>({
  id:                  { type: String, required: true },
  tier:                { type: String, enum: B2BTierValues, required: true },
  annualFee:           { type: Types.Decimal128 },
  apiRatePerMin:       { type: Number },
  archiveAfterDays:    { type: Number },
  burnRate:            { type: Types.Decimal128 },
  commissionBarter:    { type: Types.Decimal128 },
  commissionCash:      { type: Types.Decimal128 },
  excelBatchLimit:     { type: Number },
  imageCountPerListing:{ type: Number },
  listingLimit:        { type: Number },
  roiRate:             { type: Types.Decimal128 },
  xpMultiplier:        { type: Types.Decimal128 },
  createdAt:           { type: Date },
  updatedAt:           { type: Date },
}, {
  timestamps: true,
  collection: 'tier_benefits',
});

TierBenefitSchema.index({ tier: 1 }, { unique: true });

export const TierBenefit = createModelProxy<ITierBenefit>('TierBenefit', TierBenefitSchema);
