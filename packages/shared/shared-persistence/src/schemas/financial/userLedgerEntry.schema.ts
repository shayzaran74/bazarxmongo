import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const LedgerEntryStatus = ['PENDING','COMPLETED','FAILED','REVERSED'] as const;
export type LedgerEntryStatusType = typeof LedgerEntryStatus[number];

export interface IUserLedgerEntry {
  _id?: string;
  id: string;
  amount: Types.Decimal128;
  description?: string;
  createdAt: Date;
  createdBy?: string;
  referenceId?: string;
  userId: string;
  status: LedgerEntryStatusType;
}

export const UserLedgerEntrySchema = new Schema<IUserLedgerEntry>({
  _id: { type: String },
  id: { type: String, required: true },
  amount: { type: Types.Decimal128 },
  description: { type: String },
  createdAt: { type: Date },
  createdBy: { type: String },
  referenceId: { type: String },
  userId: { type: String },
  status: { type: String, enum: LedgerEntryStatus, default: 'COMPLETED' },
}, {
  timestamps: true,
  collection: 'user_ledger_entries',
});

UserLedgerEntrySchema.index({ userId: 1, createdAt: -1 });
UserLedgerEntrySchema.index({ referenceId: 1 });

export const UserLedgerEntry = createModelProxy<IUserLedgerEntry>('UserLedgerEntry', UserLedgerEntrySchema);