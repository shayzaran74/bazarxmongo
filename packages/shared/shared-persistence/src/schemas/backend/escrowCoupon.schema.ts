import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// EscrowCoupon — generated from Prisma schema
// TODO: strict typing — codegen

export interface IEscrowCoupon {
  _id?: string;
  id: string;
  cartId: string;
  userId: string;
  code: string;
  discount: number;
  percentage?: number;
  minAmount?: number;
  expiresAt?: Date;
  isActive: boolean;
  appliedAt: Date;
  createdAt: Date;
}

export const EscrowCouponSchema = new Schema<IEscrowCoupon>({
  _id: { type: String },
  id: { type: String, required: true },
  cartId: { type: String, alias: 'cart_id' },
  userId: { type: String, alias: 'user_id' },
  code: { type: String },
  discount: { type: Number, default: 0 },
  percentage: { type: Number },
  minAmount: { type: Number, alias: 'min_amount' },
  expiresAt: { type: Date, alias: 'expires_at' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  appliedAt: { type: Date, alias: 'applied_at' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'escrow_coupons',
});

export const EscrowCoupon = createModelProxy<IEscrowCoupon>('EscrowCoupon', EscrowCouponSchema);
