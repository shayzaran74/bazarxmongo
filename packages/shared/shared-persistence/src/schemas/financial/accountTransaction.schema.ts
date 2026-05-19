// packages/shared/shared-persistence/src/schemas/financial/accountTransaction.schema.ts
import { Schema, model, Types } from 'mongoose';

export const TransactionType = [
  'CREDIT', 'DEBIT', 'HOLD', 'RELEASE', 'REFUND', 'FEE', 'COMMISSION',
  'TOPUP', 'PAYMENT', 'TRANSFER', 'WITHDRAWAL',
] as const;
export type TransactionTypeType = typeof TransactionType[number];

export const TransactionDirection = ['CREDIT', 'DEBIT'] as const;
export type TransactionDirectionType = typeof TransactionDirection[number];

export const TransactionStatus = ['COMPLETED', 'PENDING', 'FAILED', 'CANCELLED'] as const;
export type TransactionStatusType = typeof TransactionStatus[number];

export interface IAccountTransaction {
  _id?: string;
  id: string;
  amount: Types.Decimal128;
  description?: string;
  metadata?: Schema.Types.Mixed;
  accountId: string;
  createdAt: Date;
  idempotencyKey?: string;
  referenceId?: string;
  referenceType?: string;
  settledAt?: Date;
  type: TransactionTypeType;
  direction?: TransactionDirectionType;
  status?: TransactionStatusType;
}

export const AccountTransactionSchema = new Schema<IAccountTransaction>({
  _id: { type: String },
  id: { type: String, required: true },
  amount: { type: Types.Decimal128 },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
  accountId: { type: String },
  createdAt: { type: Date },
  idempotencyKey: { type: String },
  referenceId: { type: String },
  referenceType: { type: String },
  settledAt: { type: Date },
  type: { type: String, enum: TransactionType },
  direction: { type: String, enum: TransactionDirection },
  status: { type: String, enum: TransactionStatus },
}, {
  timestamps: true,
  collection: 'account_transactions',
});

AccountTransactionSchema.index({ accountId: 1, createdAt: -1 });
AccountTransactionSchema.index({ referenceId: 1, referenceType: 1 });
AccountTransactionSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const AccountTransaction = model<IAccountTransaction>('AccountTransaction', AccountTransactionSchema);