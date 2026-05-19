import { Schema, model, Types } from 'mongoose';

export const LoyaltyTier = ['BRONZE','SILVER','GOLD','PLATINUM','DIAMOND'] as const;
export type LoyaltyTierType = typeof LoyaltyTier[number];

export interface IMembershipTier {
  _id?: string;
  id: string;
  tier: LoyaltyTierType;
  minXp: number;
  description?: string;
  rewardMultiplier: Types.Decimal128;
  benefitMetadata?: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export const MembershipTierSchema = new Schema<IMembershipTier>({
  _id: { type: String },
  id: { type: String, required: true },
  tier: { type: String, enum: LoyaltyTier },
  minXp: { type: Number },
  description: { type: String },
  rewardMultiplier: { type: Types.Decimal128, default: 1.0 },
  benefitMetadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'membership_tiers',
});

MembershipTierSchema.index({ tier: 1 }, { unique: true });
MembershipTierSchema.index({ minXp: 1 });

export const MembershipTier = model<IMembershipTier>('MembershipTier', MembershipTierSchema);