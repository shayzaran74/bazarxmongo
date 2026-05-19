import { Schema, model, Types } from 'mongoose';

// LoyaltyTierHistory — generated from Prisma schema
// TODO: strict typing — codegen

export interface ILoyaltyTierHistory {
  _id?: string;
  id: string;
  userId: string;
  fromTier?: string;
  toTier: string;
  reason?: string;
  triggeredBy?: string;
  createdAt: Date;
}

export const LoyaltyTierHistorySchema = new Schema<ILoyaltyTierHistory>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  fromTier: { type: String, alias: 'from_tier' },
  toTier: { type: String, alias: 'to_tier' },
  reason: { type: String },
  triggeredBy: { type: String, alias: 'triggered_by' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'loyalty_tier_history',
});

// Composite index
LoyaltyTierHistorySchema.index({ userId: 1 });

export const LoyaltyTierHistory = model<ILoyaltyTierHistory>('LoyaltyTierHistory', LoyaltyTierHistorySchema);
