import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const SubscriptionStatus = ['ACTIVE','GRACE_PERIOD','EXPIRED','SUSPENDED','CANCELLED'] as const;
export type SubscriptionStatusType = typeof SubscriptionStatus[number];

export interface ISubscription {
  _id?: string;
  id: string;
  companyId: string;
  planName: string;
  status: SubscriptionStatusType;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  features?: Schema.Types.Mixed;
  priceTL: Types.Decimal128;
  priceBarter: Types.Decimal128;
  listingLimit: number;
  commissionDiscount: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
}

export const SubscriptionSchema = new Schema<ISubscription>({
  _id: { type: String },
  id: { type: String, required: true },
  companyId: { type: String },
  planName: { type: String },
  status: { type: String, enum: SubscriptionStatus, default: 'ACTIVE' },
  startDate: { type: Date },
  endDate: { type: Date },
  autoRenew: { type: Boolean, default: true },
  features: { type: Schema.Types.Mixed },
  priceTL: { type: Types.Decimal128 },
  priceBarter: { type: Types.Decimal128 },
  listingLimit: { type: Number, default: 10 },
  commissionDiscount: { type: Types.Decimal128, default: 0 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'subscriptions',
});

SubscriptionSchema.index({ companyId: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });

export const Subscription = createModelProxy<ISubscription>('Subscription', SubscriptionSchema);