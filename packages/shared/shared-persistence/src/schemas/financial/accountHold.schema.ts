import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const HoldStatus = ['PENDING','ACTIVE','RELEASED','EXPIRED'] as const;
export type HoldStatusType = typeof HoldStatus[number];

export const HoldReason = ['ORDER','BARTER','AUCTION_BID','LOTTERY_TICKET','SUBSCRIPTION','OTHER'] as const;
export type HoldReasonType = typeof HoldReason[number];

export interface IAccountHold {
  _id?: string;
  id: string;
  amount: Types.Decimal128;
  notes?: string;
  accountId: string;
  createdAt: Date;
  createdBy?: string;
  expiresAt?: Date;
  idempotencyKey?: string;
  referenceId?: string;
  referenceType?: string;
  releasedAt?: Date;
  releasedBy?: string;
  updatedAt: Date;
  status: HoldStatusType;
  reason: HoldReasonType;
}

export const AccountHoldSchema = new Schema<IAccountHold>({
  _id: { type: String },
  id: { type: String, required: true },
  amount: { type: Types.Decimal128 },
  notes: { type: String },
  accountId: { type: String },
  createdAt: { type: Date },
  createdBy: { type: String },
  expiresAt: { type: Date },
  idempotencyKey: { type: String },
  referenceId: { type: String },
  referenceType: { type: String },
  releasedAt: { type: Date },
  releasedBy: { type: String },
  updatedAt: { type: Date },
  status: { type: String, enum: HoldStatus, default: 'PENDING' },
  reason: { type: String, enum: HoldReason },
}, {
  timestamps: true,
  collection: 'account_holds',
});

AccountHoldSchema.index({ accountId: 1, status: 1 });
AccountHoldSchema.index({ referenceType: 1, referenceId: 1 });
AccountHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const AccountHold = createModelProxy<IAccountHold>('AccountHold', AccountHoldSchema);