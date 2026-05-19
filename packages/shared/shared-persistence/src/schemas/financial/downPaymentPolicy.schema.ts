import { Schema, model, Types } from 'mongoose';

// DownPaymentPolicy — generated from Prisma schema
// TODO: strict typing — codegen

export interface IDownPaymentPolicy {
  id: string;
  percentage: Types.Decimal128;
  active: boolean;
  categoryKey: string;
  createdAt: Date;
  maxAmount?: Types.Decimal128;
  minAmount?: Types.Decimal128;
  refundDays: number;
  requireBalance: boolean;
  updatedAt: Date;
}

export const DownPaymentPolicySchema = new Schema<IDownPaymentPolicy>({
  id: { type: String, required: true },
  percentage: { type: Types.Decimal128, default: 25.0 },
  active: { type: Boolean, default: true },
  categoryKey: { type: String, alias: 'category_key' },
  createdAt: { type: Date, alias: 'created_at' },
  maxAmount: { type: Types.Decimal128, alias: 'max_amount' },
  minAmount: { type: Types.Decimal128, alias: 'min_amount' },
  refundDays: { type: Number, default: 3, alias: 'refund_days' },
  requireBalance: { type: Boolean, default: true, alias: 'require_balance' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'down_payment_policies',
});