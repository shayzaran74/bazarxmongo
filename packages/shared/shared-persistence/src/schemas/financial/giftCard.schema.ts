// packages/shared/shared-persistence/src/schemas/financial/giftCard.schema.ts
import { Schema, model, Types } from 'mongoose';

export const GiftCardStatus = ['Active', 'Redeemed', 'Expired', 'Cancelled'] as const;
export type GiftCardStatusType = typeof GiftCardStatus[number];

export interface IGiftCard {
  _id?: string;
  id: string;
  code: string;
  note?: string;
  createdAt: Date;
  currentValue: Types.Decimal128;
  customerId?: string;
  expiresAt?: Date;
  initialValue: Types.Decimal128;
  status: GiftCardStatusType;
  updatedAt: Date;
}

export const GiftCardSchema = new Schema<IGiftCard>({
  _id: { type: String },
  id: { type: String, required: true },
  code: { type: String },
  note: { type: String },
  currentValue: { type: Types.Decimal128 },
  customerId: { type: String },
  expiresAt: { type: Date },
  initialValue: { type: Types.Decimal128 },
  status: { type: String, enum: GiftCardStatus, default: 'Active' },
}, {
  timestamps: true,
  collection: 'gift_cards',
});

GiftCardSchema.index({ code: 1 }, { unique: true });
GiftCardSchema.index({ customerId: 1 });
GiftCardSchema.index({ status: 1 });

export const GiftCard = model<IGiftCard>('GiftCard', GiftCardSchema);