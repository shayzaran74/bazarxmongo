import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const PaymentStatus = ['PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED'] as const;
export type PaymentStatusType = typeof PaymentStatus[number];

export const PaymentMethod = ['BANK_TRANSFER','CREDIT_CARD','XP','BARTER_BALANCE','GIFT_VOUCHER'] as const;
export type PaymentMethodType = typeof PaymentMethod[number];

export interface IPayment {
  _id?: string;
  id: string;
  userId: string;
  orderId?: string;
  amount: Types.Decimal128;
  paymentType: PaymentMethodType;
  status: PaymentStatusType;
  metadata?: Schema.Types.Mixed;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  accountTransactionId?: string;
}

export const PaymentSchema = new Schema<IPayment>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  orderId: { type: String },
  amount: { type: Types.Decimal128 },
  paymentType: { type: String, enum: PaymentMethod },
  status: { type: String, enum: PaymentStatus, default: 'PENDING' },
  metadata: { type: Schema.Types.Mixed },
  paidAt: { type: Date },
  failedAt: { type: Date },
  failureReason: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  accountTransactionId: { type: String },
}, {
  timestamps: true,
  collection: 'payments',
});

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ status: 1 });

export const Payment = createModelProxy<IPayment>('Payment', PaymentSchema);