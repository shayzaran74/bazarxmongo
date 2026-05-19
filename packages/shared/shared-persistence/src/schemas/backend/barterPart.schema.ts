import { Schema, model } from 'mongoose';

export const BarterPartStatus = ['PENDING','SHIPPED','DELIVERED','CONFIRMED','DISPUTED'] as const;
export type BarterPartStatusType = typeof BarterPartStatus[number];

export interface IBarterPart {
  _id?: string;
  id: string;
  swapSessionId: string;
  partNumber: number;
  senderId: string;
  recipientId: string;
  status: BarterPartStatusType;
  trackingCode?: string;
  carrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  confirmedAt?: Date;
  disputedAt?: Date;
  disputeWindowEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const BarterPartSchema = new Schema<IBarterPart>({
  _id: { type: String },
  id: { type: String, required: true },
  swapSessionId: { type: String },
  partNumber: { type: Number },
  senderId: { type: String },
  recipientId: { type: String },
  status: { type: String, enum: BarterPartStatus, default: 'PENDING' },
  trackingCode: { type: String },
  carrier: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  confirmedAt: { type: Date },
  disputedAt: { type: Date },
  disputeWindowEndsAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'barter_parts',
});

BarterPartSchema.index({ senderId: 1 });
BarterPartSchema.index({ swapSessionId: 1, partNumber: 1 }, { unique: true });

export const BarterPart = model<IBarterPart>('BarterPart', BarterPartSchema);