import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// XpDistributionRule — generated from Prisma schema
// TODO: strict typing — codegen

export interface IXpDistributionRule {
  _id?: string;
  id: string;
  city?: string;
  commissionRate?: Types.Decimal128;
  adSpendRate?: Types.Decimal128;
  serviceRate?: Types.Decimal128;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  distributionType?: string;
  name?: string;
}

export const XpDistributionRuleSchema = new Schema<IXpDistributionRule>({
  _id: { type: String },
  id: { type: String, required: true },
  city: { type: String },
  commissionRate: { type: Types.Decimal128, alias: 'commission_rate' },
  adSpendRate: { type: Types.Decimal128, alias: 'ad_spend_rate' },
  serviceRate: { type: Types.Decimal128, alias: 'service_rate' },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
  distributionType: { type: String, alias: 'distribution_type' },
  name: { type: String },
}, {
  timestamps: true,
  collection: 'xp_distribution_rules',
});

// Composite index
XpDistributionRuleSchema.index({ city: 1 });

// Composite index
XpDistributionRuleSchema.index({ vendorTier: 1 });

export const XpDistributionRule = createModelProxy<IXpDistributionRule>('XpDistributionRule', XpDistributionRuleSchema);
