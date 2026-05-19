import { Schema, model, Types } from 'mongoose';

// MembershipTier — generated from Prisma schema
// TODO: strict typing — codegen

export interface IMembershipTier {
  id: string;
  name: string;
  price: Types.Decimal128;
  minXP: number;
  benefits: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export const MembershipTierSchema = new Schema<IMembershipTier>({
  id: { type: String },
  name: { type: String },
  price: { type: Types.Decimal128, default: 0 },
  minXP: { type: Number, alias: 'min_xp' },
  benefits: { type: Schema.Types.Mixed },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'membership_tiers',
});