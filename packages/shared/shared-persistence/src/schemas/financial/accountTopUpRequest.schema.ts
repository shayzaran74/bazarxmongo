// packages/shared/shared-persistence/src/schemas/financial/accountTopUpRequest.schema.ts
import { Schema, model, Types } from 'mongoose';

export const TopUpRequestStatus = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
export type TopUpRequestStatusType = typeof TopUpRequestStatus[number];

export const TopUpPaymentMethod = ['BANK_TRANSFER', 'EFT', 'CREDIT_CARD', 'DEBIT_CARD'] as const;
export type TopUpPaymentMethodType = typeof TopUpPaymentMethod[number];

export interface IAccountTopUpRequest {
  _id?: string;
  id: string;
  amount: Types.Decimal128;
  notes?: string;
  accountId?: string;
  createdAt: Date;
  paymentReference?: string;
  paymentMethod?: TopUpPaymentMethodType;
  processedAt?: Date;
  processedBy?: string;
  rejectionReason?: string;
  status: TopUpRequestStatusType;
  updatedAt: Date;
  userId: string;
}

export const AccountTopUpRequestSchema = new Schema<IAccountTopUpRequest>({
  _id: { type: String },
  id: { type: String, required: true },
  amount: { type: Types.Decimal128 },
  notes: { type: String },
  accountId: { type: String },
  paymentReference: { type: String },
  paymentMethod: { type: String, enum: TopUpPaymentMethod },
  processedAt: { type: Date },
  processedBy: { type: String },
  rejectionReason: { type: String },
  status: { type: String, enum: TopUpRequestStatus, default: 'PENDING' },
  userId: { type: String },
}, {
  timestamps: true,
  collection: 'account_top_up_requests',
});

AccountTopUpRequestSchema.index({ userId: 1 });
AccountTopUpRequestSchema.index({ status: 1 });
AccountTopUpRequestSchema.index({ accountId: 1 });

export const AccountTopUpRequest = model<IAccountTopUpRequest>('AccountTopUpRequest', AccountTopUpRequestSchema);