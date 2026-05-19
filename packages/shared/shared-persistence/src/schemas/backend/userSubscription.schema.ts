import { Schema, model, Types } from 'mongoose';

// packages/shared/shared-persistence/src/schemas/backend/userSubscription.schema.ts

export const UserSubscriptionStatus = ['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'] as const;
export type UserSubscriptionStatusType = typeof UserSubscriptionStatus[number];

export interface IUserSubscription {
  _id?: string;
  id: string;
  userId: string;
  planId: string;
  status: UserSubscriptionStatusType;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  nextBillingDate?: Date;
  cancelledAt?: Date;
  downgradeProtectedUntil?: Date;
  referralDiscountPct: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSubscriptionSchema = new Schema<IUserSubscription>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  planId: { type: String, alias: 'plan_id' },
  startDate: { type: Date, alias: 'start_date' },
  endDate: { type: Date, alias: 'end_date' },
  autoRenew: { type: Boolean, default: true, alias: 'auto_renew' },
  nextBillingDate: { type: Date, alias: 'next_billing_date' },
  cancelledAt: { type: Date, alias: 'cancelled_at' },
  downgradeProtectedUntil: { type: Date, alias: 'downgrade_protected_until' },
  status: { type: String, enum: UserSubscriptionStatus, default: 'ACTIVE' },
  referralDiscountPct: { type: Types.Decimal128, default: 0, alias: 'referral_discount_pct' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'user_subscriptions',
});

UserSubscriptionSchema.index({ userId: 1 }, { unique: true });

// Composite index
UserSubscriptionSchema.index({ status: 1 });

export const UserSubscription = model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);
