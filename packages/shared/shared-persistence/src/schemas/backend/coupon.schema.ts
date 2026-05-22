import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/coupon.schema.ts
import { Schema, Types } from 'mongoose';

export interface ICoupon {
  _id?: string;
  id: string;
  code: string;
  discountAmount?: number;
  discountPercentage?: number;
  minOrderAmount?: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CouponSchema = new Schema<ICoupon>({
  _id: { type: String, default: () => new Types.ObjectId().toString() },
  id: { type: String, required: true },
  code: { type: String },
  discountAmount: { type: Number },
  discountPercentage: { type: Number },
  minOrderAmount: { type: Number },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'coupons',
});

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, expiresAt: 1 });

export const Coupon = createModelProxy<ICoupon>('Coupon', CouponSchema);