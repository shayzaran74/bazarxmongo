import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const GiftVoucherType = ['BIRTHDAY','ANNIVERSARY','REFERRAL','PROMOTION','COMPENSATION'] as const;
export type GiftVoucherTypeType = typeof GiftVoucherType[number];

export interface IGiftVoucher {
  _id?: string;
  id: string;
  userId: string;
  code: string;
  type: GiftVoucherTypeType;
  amount: Types.Decimal128;
  validUntil: Date;
  redeemedAt?: Date;
  orderId?: string;
  issuedBy?: string;
  createdAt: Date;
}

export const GiftVoucherSchema = new Schema<IGiftVoucher>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  code: { type: String },
  type: { type: String, enum: GiftVoucherType, default: 'PROMOTION' },
  amount: { type: Types.Decimal128 },
  validUntil: { type: Date },
  redeemedAt: { type: Date },
  orderId: { type: String },
  issuedBy: { type: String },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'gift_vouchers',
});

GiftVoucherSchema.index({ userId: 1 });
GiftVoucherSchema.index({ code: 1 }, { unique: true });
GiftVoucherSchema.index({ validUntil: 1 });

export const GiftVoucher = createModelProxy<IGiftVoucher>('GiftVoucher', GiftVoucherSchema);