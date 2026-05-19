import { Schema, model, Types } from 'mongoose';

// XpSpendingLimitRule — generated from Prisma schema
// TODO: strict typing — codegen

export interface IXpSpendingLimitRule {
  _id?: string;
  id: string;
  maxSpendPerTx?: Types.Decimal128;
  monthlyVolumeLimit?: Types.Decimal128;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  dailyLimit?: Types.Decimal128;
  maxSpendPercentage?: Types.Decimal128;
  minCartAmount?: Types.Decimal128;
  monthlyLimit?: Types.Decimal128;
  weeklyLimit?: Types.Decimal128;
  weeklyVolumeLimit?: Types.Decimal128;
  xpToTlRate?: Types.Decimal128;
}

export const XpSpendingLimitRuleSchema = new Schema<IXpSpendingLimitRule>({
  _id: { type: String },
  id: { type: String, required: true },
  maxSpendPerTx: { type: Types.Decimal128, alias: 'max_spend_per_tx' },
  monthlyVolumeLimit: { type: Types.Decimal128, alias: 'monthly_volume_limit' },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
  dailyLimit: { type: Types.Decimal128, alias: 'daily_limit' },
  maxSpendPercentage: { type: Types.Decimal128, alias: 'max_spend_percentage' },
  minCartAmount: { type: Types.Decimal128, alias: 'min_cart_amount' },
  monthlyLimit: { type: Types.Decimal128, alias: 'monthly_limit' },
  weeklyLimit: { type: Types.Decimal128, alias: 'weekly_limit' },
  weeklyVolumeLimit: { type: Types.Decimal128, alias: 'weekly_volume_limit' },
  xpToTlRate: { type: Types.Decimal128, alias: 'xp_to_tl_rate' },
}, {
  timestamps: true,
  collection: 'xp_spending_limit_rules',
});

// Composite index
XpSpendingLimitRuleSchema.index({ vendorTier: 1 });

export const XpSpendingLimitRule = model<IXpSpendingLimitRule>('XpSpendingLimitRule', XpSpendingLimitRuleSchema);
