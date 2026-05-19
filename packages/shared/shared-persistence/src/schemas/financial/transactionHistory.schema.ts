import { Schema, model, Types } from 'mongoose';

// TransactionHistory — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITransactionHistory {
  id: string;
  walletId: string;
  amount: Types.Decimal128;
  xpAmount: number;
  type: string;
  referenceId?: string;
  createdAt: Date;
}

export const TransactionHistorySchema = new Schema<ITransactionHistory>({
  id: { type: String, required: true },
  walletId: { type: String, alias: 'wallet_id' },
  amount: { type: Types.Decimal128 },
  xpAmount: { type: Number, default: 0, alias: 'xp_amount' },
  type: { type: String },
  referenceId: { type: String, alias: 'reference_id' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'transaction_history',
});

// Composite index
TransactionHistorySchema.index({ walletId: 1 });

// Composite index
TransactionHistorySchema.index({ createdAt: 1 });