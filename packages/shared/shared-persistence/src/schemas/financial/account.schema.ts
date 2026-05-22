import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const AccountStatus = ['ACTIVE','FROZEN','CLOSED'] as const;
export type AccountStatusType = typeof AccountStatus[number];

export interface IAccount {
  _id?: string;
  id: string;
  balance: Types.Decimal128;
  availableBalance: Types.Decimal128;
  blockedBalance: Types.Decimal128;
  createdAt: Date;
  creditLimit: Types.Decimal128;
  isDirty: boolean;
  lastReconciledAt?: Date;
  updatedAt: Date;
  userId: string;
  type: string;
  ownerType: string;
  status: AccountStatusType;
  currency?: string;
  vendorTier?: string;
}

export const AccountSchema = new Schema<IAccount>({
  _id: { type: String },
  id: { type: String, required: true },
  balance: { type: Types.Decimal128, default: 0 },
  availableBalance: { type: Types.Decimal128, default: 0 },
  blockedBalance: { type: Types.Decimal128, default: 0 },
  createdAt: { type: Date },
  creditLimit: { type: Types.Decimal128, default: 0 },
  isDirty: { type: Boolean, default: true },
  lastReconciledAt: { type: Date },
  updatedAt: { type: Date },
  userId: { type: String },
  type: { type: String },
  ownerType: { type: String },
  status: { type: String, enum: AccountStatus, default: 'ACTIVE' },
  currency: { type: String },
  vendorTier: { type: String },
}, {
  timestamps: true,
  collection: 'accounts',
});

AccountSchema.index({ ownerType: 1 });
AccountSchema.index({ userId: 1, type: 1 }, { unique: true });
AccountSchema.index({ status: 1 });

export const Account = createModelProxy<IAccount>('Account', AccountSchema);