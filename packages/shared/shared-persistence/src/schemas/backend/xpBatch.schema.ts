import { Schema, model, Types } from 'mongoose';

// XpBatch — generated from Prisma schema
// TODO: strict typing — codegen

export interface IXpBatch {
  _id?: string;
  id: string;
  accountId: string;
  originalAmount: Types.Decimal128;
  currentBalance: Types.Decimal128;
  sourceType: string;
  sourceRefId?: string;
  createdAt: Date;
  expiresAt: Date;
  isBurned: boolean;
}

export const XpBatchSchema = new Schema<IXpBatch>({
  _id: { type: String },
  id: { type: String, required: true },
  accountId: { type: String, alias: 'account_id' },
  originalAmount: { type: Types.Decimal128, alias: 'original_amount' },
  currentBalance: { type: Types.Decimal128, alias: 'current_balance' },
  sourceType: { type: String, alias: 'source_type' },
  sourceRefId: { type: String, alias: 'source_ref_id' },
  createdAt: { type: Date, alias: 'created_at' },
  expiresAt: { type: Date, alias: 'expires_at' },
  isBurned: { type: Boolean, default: false, alias: 'is_burned' },
}, {
  timestamps: true,
  collection: 'xp_batches',
});

// Composite index
XpBatchSchema.index({ accountId: 1 });

// Composite index
XpBatchSchema.index({ expiresAt: 1 });

export const XpBatch = model<IXpBatch>('XpBatch', XpBatchSchema);
