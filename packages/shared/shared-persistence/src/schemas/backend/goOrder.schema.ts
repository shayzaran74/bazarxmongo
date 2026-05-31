// packages/shared/shared-persistence/src/schemas/backend/goOrder.schema.ts

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const GoOrderStatus = ['received', 'preparing', 'on_way', 'ready', 'delivered', 'cancelled'] as const;
export type GoOrderStatusValue = typeof GoOrderStatus[number];

export const GoOrderMode = ['delivery', 'gelal'] as const;
export type GoOrderModeValue = typeof GoOrderMode[number];

// Ödeme blokajı mutabakat durumu — place-order'da HELD, teslimatta CAPTURED, iptalde REFUNDED
export const GoSettlementStatus = ['HELD', 'CAPTURED', 'REFUNDED'] as const;
export type GoSettlementStatusValue = typeof GoSettlementStatus[number];

// Restoran hakediş durumu — teslimatta PENDING, batch payout sonrası PAID, iptalde CANCELLED
export const GoPayoutStatus = ['PENDING', 'PAID', 'CANCELLED'] as const;
export type GoPayoutStatusValue = typeof GoPayoutStatus[number];

export interface IGoOrderItem {
  menuItemId: string;
  name: string;
  price: Types.Decimal128;
  qty: number;
}

export interface IGoOrder {
  _id?: string;
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: IGoOrderItem[];
  mode: GoOrderModeValue;
  subtotal: Types.Decimal128;
  deliveryFee: Types.Decimal128;
  discount: Types.Decimal128;
  total: Types.Decimal128;
  couponCode?: string;
  status: GoOrderStatusValue;
  holdId?: string;
  settlementStatus?: GoSettlementStatusValue;
  // Restoran hakedişi (Seçenek B — platform tahsil eder, batch ile restorana aktarır)
  restaurantPayoutAmount?: Types.Decimal128; // subtotal − goCommission
  platformFeeAmount?: Types.Decimal128;       // total − restaurantPayoutAmount (komisyon + deliveryFee − kupon)
  payoutStatus?: GoPayoutStatusValue;
  payoutBatchId?: string;
  estimatedMinutes: number;
  addressLine?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoOrderItemSchema = new Schema<IGoOrderItem>(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Types.Decimal128, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

export const GoOrderSchema = new Schema<IGoOrder>(
  {
    _id: { type: String },
    id: { type: String, required: true },
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    items: { type: [GoOrderItemSchema], required: true },
    mode: { type: String, enum: GoOrderMode, required: true },
    subtotal: { type: Types.Decimal128, required: true },
    deliveryFee: { type: Types.Decimal128, default: 0 },
    discount: { type: Types.Decimal128, default: 0 },
    total: { type: Types.Decimal128, required: true },
    couponCode: { type: String },
    status: { type: String, enum: GoOrderStatus, default: 'received' },
    holdId: { type: String },
    settlementStatus: { type: String, enum: GoSettlementStatus },
    restaurantPayoutAmount: { type: Types.Decimal128 },
    platformFeeAmount: { type: Types.Decimal128 },
    payoutStatus: { type: String, enum: GoPayoutStatus },
    payoutBatchId: { type: String },
    estimatedMinutes: { type: Number, default: 30 },
    addressLine: { type: String },
  },
  {
    timestamps: true,
    collection: 'go_orders',
  },
);

GoOrderSchema.index({ userId: 1, createdAt: -1 });
GoOrderSchema.index({ restaurantId: 1, status: 1 });
GoOrderSchema.index({ status: 1, createdAt: -1 });

export const GoOrder = createModelProxy<IGoOrder>('GoOrder', GoOrderSchema);
