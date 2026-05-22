import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// packages/shared/shared-persistence/src/schemas/backend/membershipPlan.schema.ts

export interface IMembershipPlan {
  _id?: string;
  id: string;
  tier: string;
  monthlyFee: Types.Decimal128;
  annualFee?: Types.Decimal128;
  menuCredit: Types.Decimal128;
  breakeven: Types.Decimal128;
  benefits?: Schema.Types.Mixed;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MembershipPlanSchema = new Schema<IMembershipPlan>({
  _id: { type: String },
  id: { type: String, required: true },
  tier: { type: String },
  monthlyFee: { type: Types.Decimal128, alias: 'monthly_fee' },
  annualFee: { type: Types.Decimal128, alias: 'annual_fee' },
  menuCredit: { type: Types.Decimal128, alias: 'menu_credit' },
  breakeven: { type: Types.Decimal128 },
  benefits: { type: Schema.Types.Mixed },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'membership_plans',
});

MembershipPlanSchema.index({ tier: 1 }, { unique: true });
MembershipPlanSchema.index({ isActive: 1 });

export const MembershipPlan = createModelProxy<IMembershipPlan>('MembershipPlan', MembershipPlanSchema);
