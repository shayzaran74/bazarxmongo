// packages/shared/shared-persistence/src/schemas/backend/goCoupon.schema.ts

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const GoCouponType = ['percent', 'amount', 'delivery'] as const;
export type GoCouponTypeValue = typeof GoCouponType[number];

export interface IGoCoupon {
  _id?: string;
  id: string;
  code: string;
  label: string;
  desc: string;
  type: GoCouponTypeValue;
  value: Types.Decimal128;
  maxDiscount: Types.Decimal128;
  minOrderAmount?: Types.Decimal128;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const GoCouponSchema = new Schema<IGoCoupon>(
  {
    _id: { type: String },
    id: { type: String, required: true },
    code: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, default: '' },
    type: { type: String, enum: GoCouponType, required: true },
    value: { type: Types.Decimal128, required: true },
    maxDiscount: { type: Types.Decimal128, default: 0 },
    minOrderAmount: { type: Types.Decimal128 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'go_coupons',
  },
);

GoCouponSchema.index({ code: 1 }, { unique: true });
GoCouponSchema.index({ isActive: 1 });

export const GoCoupon = createModelProxy<IGoCoupon>('GoCoupon', GoCouponSchema);
