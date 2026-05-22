import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/early-payment-request.schema.ts
// EarlyPaymentRequest MongoDB schema — Master Plan §3.5.4
// %0.05/gün, %80 maks, minimum 500₺

import { Schema, Types } from 'mongoose';

export const EarlyPaymentStatus = ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'] as const;
export type EarlyPaymentStatusType = typeof EarlyPaymentStatus[number];

export interface IEarlyPaymentRequest {
  _id?: string;
  id: string;
  vendorId: string;
  amount: Types.Decimal128;
  interestRate: Types.Decimal128;
  interestAmount: Types.Decimal128;
  totalAmount: Types.Decimal128;
  status: EarlyPaymentStatusType;
  payeeAccountId?: string;
  transactionId?: string;
  requestedAt: Date;
  processedAt?: Date;
  rejectionReason?: string;
  idempotencyKey: string;
  orderId?: string;
  earnedAmount: Types.Decimal128;
  availableAmount: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
}

export const EarlyPaymentRequestSchema = new Schema<IEarlyPaymentRequest>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String },
  amount: { type: Types.Decimal128 },
  interestRate: { type: Types.Decimal128 },
  interestAmount: { type: Types.Decimal128 },
  totalAmount: { type: Types.Decimal128 },
  status: { type: String, enum: EarlyPaymentStatus, default: 'PENDING' },
  payeeAccountId: { type: String },
  transactionId: { type: String },
  requestedAt: { type: Date },
  processedAt: { type: Date },
  rejectionReason: { type: String },
  idempotencyKey: { type: String, unique: true },
  orderId: { type: String },
  earnedAmount: { type: Types.Decimal128 },
  availableAmount: { type: Types.Decimal128 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'early_payment_requests',
});

EarlyPaymentRequestSchema.index({ vendorId: 1, status: 1 });
EarlyPaymentRequestSchema.index({ idempotencyKey: 1 }, { unique: true });
EarlyPaymentRequestSchema.index({ orderId: 1 });

export const EarlyPaymentRequest = createModelProxy<IEarlyPaymentRequest>('EarlyPaymentRequest', EarlyPaymentRequestSchema);