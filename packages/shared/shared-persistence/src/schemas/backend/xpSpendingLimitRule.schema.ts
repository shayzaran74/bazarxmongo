// packages/shared/shared-persistence/src/schemas/backend/xpSpendingLimitRule.schema.ts

import { Schema, model, Types } from 'mongoose';

export interface IXpSpendingLimitRule {
  _id?: string;
  id: string;
  tier?: string;
  maxSpendPercentage?: Types.Decimal128;
  monthlyVolumeLimit?: Types.Decimal128;
  dailyLimit?: Types.Decimal128;
  maxSpendPerTx?: Types.Decimal128;
  minCartAmount?: Types.Decimal128;
  monthlyLimit?: Types.Decimal128;
  weeklyLimit?: Types.Decimal128;
  weeklyVolumeLimit?: Types.Decimal128;
  xpToTlRate?: Types.Decimal128;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const XpSpendingLimitRuleSchema = new Schema<IXpSpendingLimitRule>({
  _id:                { type: String },
  id:                 { type: String, required: true },
  tier:               { type: String, enum: ['CORE', 'PRIME', 'ELITE', 'APEX'] },
  maxSpendPercentage: { type: Types.Decimal128 },
  monthlyVolumeLimit: { type: Types.Decimal128 },
  dailyLimit:         { type: Types.Decimal128 },
  maxSpendPerTx:      { type: Types.Decimal128 },
  minCartAmount:      { type: Types.Decimal128 },
  monthlyLimit:       { type: Types.Decimal128 },
  weeklyLimit:        { type: Types.Decimal128 },
  weeklyVolumeLimit:  { type: Types.Decimal128 },
  xpToTlRate:         { type: Types.Decimal128 },
  priority:           { type: Number, default: 0 },
  isActive:           { type: Boolean, default: true },
  createdAt:          { type: Date },
  updatedAt:          { type: Date },
}, {
  timestamps: true,
  collection: 'xp_spending_limit_rules',
});

XpSpendingLimitRuleSchema.index({ tier: 1 });

export const XpSpendingLimitRule = model<IXpSpendingLimitRule>('XpSpendingLimitRule', XpSpendingLimitRuleSchema);
