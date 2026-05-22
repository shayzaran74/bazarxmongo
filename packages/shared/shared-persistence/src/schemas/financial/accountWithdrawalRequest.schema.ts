import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/financial/accountWithdrawalRequest.schema.ts
import { Schema, Types } from 'mongoose';

export const WithdrawalRequestStatus = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
export type WithdrawalRequestStatusType = typeof WithdrawalRequestStatus[number];

export interface IAccountWithdrawalRequest {
  _id?: string;
  id: string;
  amount: Types.Decimal128;
  iban: string;
  accountHolder: string;
  accountId?: string;
  bankName: string;
  createdAt: Date;
  notes?: string;
  processedAt?: Date;
  processedBy?: string;
  rejectionReason?: string;
  status: WithdrawalRequestStatusType;
  updatedAt: Date;
  userId: string;
}

export const AccountWithdrawalRequestSchema = new Schema<IAccountWithdrawalRequest>({
  _id: { type: String },
  id: { type: String, required: true },
  amount: { type: Types.Decimal128 },
  iban: { type: String },
  accountHolder: { type: String },
  accountId: { type: String },
  bankName: { type: String },
  notes: { type: String },
  processedAt: { type: Date },
  processedBy: { type: String },
  rejectionReason: { type: String },
  status: { type: String, enum: WithdrawalRequestStatus, default: 'PENDING' },
  userId: { type: String },
}, {
  timestamps: true,
  collection: 'account_withdrawal_requests',
});

AccountWithdrawalRequestSchema.index({ userId: 1 });
AccountWithdrawalRequestSchema.index({ status: 1 });
AccountWithdrawalRequestSchema.index({ accountId: 1 });

export const AccountWithdrawalRequest = createModelProxy<IAccountWithdrawalRequest>('AccountWithdrawalRequest', AccountWithdrawalRequestSchema);