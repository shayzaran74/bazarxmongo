import { Schema, model, Types } from 'mongoose';

// MilestoneTracker — generated from Prisma schema
// TODO: strict typing — codegen

export interface IMilestoneTracker {
  _id?: string;
  id: string;
  userId: string;
  weeklyOrderCount: number;
  weeklyPeriodStart?: Date;
  weeklyBonusGiven: boolean;
  monthlySpendTotal: Types.Decimal128;
  monthlyPeriodStart?: Date;
  monthlyBonusGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MilestoneTrackerSchema = new Schema<IMilestoneTracker>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  weeklyOrderCount: { type: Number, default: 0, alias: 'weekly_order_count' },
  weeklyPeriodStart: { type: Date, alias: 'weekly_period_start' },
  weeklyBonusGiven: { type: Boolean, default: false, alias: 'weekly_bonus_given' },
  monthlySpendTotal: { type: Types.Decimal128, default: 0, alias: 'monthly_spend_total' },
  monthlyPeriodStart: { type: Date, alias: 'monthly_period_start' },
  monthlyBonusGiven: { type: Boolean, default: false, alias: 'monthly_bonus_given' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'milestone_trackers',
});

export const MilestoneTracker = model<IMilestoneTracker>('MilestoneTracker', MilestoneTrackerSchema);
