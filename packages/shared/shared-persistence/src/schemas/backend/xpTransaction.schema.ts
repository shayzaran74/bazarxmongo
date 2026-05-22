import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export const XpTransactionType = ['EARNED','SPENT','EXPIRED','ERODED','BONUS','REFERRAL','COMMISSION','SUBSCRIPTION','MENU','TRADE','ADMIN_MANUAL'] as const;
export type XpTransactionTypeType = typeof XpTransactionType[number];

export interface IXpTransaction {
  _id?: string;
  id: string;
  userId: string;
  amount: number;
  type: XpTransactionTypeType;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Schema.Types.Mixed;
  erodedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export const XpTransactionSchema = new Schema<IXpTransaction>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  amount: { type: Number },
  type: { type: String, enum: XpTransactionType },
  description: { type: String },
  referenceId: { type: String },
  referenceType: { type: String },
  metadata: { type: Schema.Types.Mixed },
  erodedAt: { type: Date },
  expiresAt: { type: Date },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'xp_transactions',
});

XpTransactionSchema.index({ userId: 1, createdAt: -1 });
XpTransactionSchema.index({ expiresAt: 1 });
XpTransactionSchema.index({ type: 1 });

export const XpTransaction = createModelProxy<IXpTransaction>('XpTransaction', XpTransactionSchema);