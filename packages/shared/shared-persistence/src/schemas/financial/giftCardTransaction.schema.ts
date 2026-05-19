import { Schema, model, Types } from 'mongoose';

// GiftCardTransaction — generated from Prisma schema
// TODO: strict typing — codegen

export interface IGiftCardTransaction {
  id: string;
  amount: Types.Decimal128;
  note?: string;
  createdAt: Date;
  giftCardId: string;
  orderId?: string;
}

export const GiftCardTransactionSchema = new Schema<IGiftCardTransaction>({
  id: { type: String, required: true },
  amount: { type: Types.Decimal128 },
  note: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
  giftCardId: { type: String, alias: 'gift_card_id' },
  orderId: { type: String, alias: 'order_id' },
}, {
  timestamps: true,
  collection: 'gift_card_transactions',
});