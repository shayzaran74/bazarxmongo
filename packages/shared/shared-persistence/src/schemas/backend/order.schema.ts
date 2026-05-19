// packages/shared/shared-persistence/src/schemas/backend/order.schema.ts
// Order — Prisma → Mongoose migration (ADR-005 Faz 2a, Critical)
// Document-model decision: Reference (Order ayrı collection'da kalır)
// Transaction: checkout.service.ts — Listing + Order farklı collection'larda transaction zorunlu

import { Schema, model, Types } from 'mongoose';
import { OrderItem, OrderItemSchema, IOrderItem } from './order-item.schema';

// Enums — Prisma'dan taşındı
export const OrderStatus = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'DISPUTE'] as const;
export type OrderStatusType = typeof OrderStatus[number];

export const PaymentMethod = ['BANK_TRANSFER', 'CREDIT_CARD', 'WALLET', 'CASH', 'MIXED'] as const;
export type PaymentMethodType = typeof PaymentMethod[number];

export const PaymentStatus = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND'] as const;
export type PaymentStatusType = typeof PaymentStatus[number];

export const DeliveryType = ['CARGO', 'COURIER', 'PICKUP', 'INSTANT'] as const;
export type DeliveryTypeType = typeof DeliveryType[number];

export interface IOrder {
  _id?: string;
  id: string;
  userId: string;
  vendorId: string;
  status: OrderStatusType;
  totalAmount: Types.Decimal128;
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatusType;
  shippingMethod?: string;
  trackingNumber?: string;
  deliveryDate?: Date;
  notes?: string;
  currency: string;
  subtotal: Types.Decimal128;
  taxAmount: Types.Decimal128;
  shippingFee: Types.Decimal128;
  discountAmount: Types.Decimal128;
  couponId?: string;
  cancelReason?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  payoutStatus?: string;
  paidWithXP: Types.Decimal128;
  paidWithCash: Types.Decimal128;
  paidAt?: Date;
  paymentIntentId?: string;
  metadata?: Record<string, unknown>;
  couponCode?: string;
  shippingCarrier?: string;
  estimatedDelivery?: Date;
  escrowStatus: string;
  escrowReleaseAt?: Date;
  payoutEligibleAt?: Date;
  shippingCost: Types.Decimal128;
  orderNumber?: string;
  expiresAt?: Date;
  idempotencyKey?: string;
  escrowHoldId?: string;
  deliveryType: DeliveryTypeType;
  items?: IOrderItem[];
}

export const OrderSchema = new Schema<IOrder>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, required: true },
  vendorId: { type: String, required: true },
  status: { type: String, enum: OrderStatus, default: 'PENDING' },
  totalAmount: { type: Types.Decimal128, required: true },
  shippingAddress: { type: Schema.Types.Mixed, required: true },
  billingAddress: { type: Schema.Types.Mixed },
  paymentMethod: { type: String, enum: PaymentMethod, default: 'BANK_TRANSFER' },
  paymentStatus: { type: String, enum: PaymentStatus, default: 'PENDING' },
  shippingMethod: { type: String },
  trackingNumber: { type: String },
  deliveryDate: { type: Date },
  notes: { type: String },
  currency: { type: String, default: 'TRY' },
  subtotal: { type: Types.Decimal128, default: 0 },
  taxAmount: { type: Types.Decimal128, default: 0 },
  shippingFee: { type: Types.Decimal128, default: 0 },
  discountAmount: { type: Types.Decimal128, default: 0 },
  couponId: { type: String },
  cancelReason: { type: String },
  cancelledAt: { type: Date },
  completedAt: { type: Date },
  payoutStatus: { type: String },
  paidWithXP: { type: Types.Decimal128, default: 0 },
  paidWithCash: { type: Types.Decimal128, default: 0 },
  paidAt: { type: Date },
  paymentIntentId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  couponCode: { type: String },
  shippingCarrier: { type: String },
  estimatedDelivery: { type: Date },
  escrowStatus: { type: String, default: 'NONE' },
  escrowReleaseAt: { type: Date },
  payoutEligibleAt: { type: Date },
  shippingCost: { type: Types.Decimal128, default: 0 },
  orderNumber: { type: String },
  expiresAt: { type: Date },
  idempotencyKey: { type: String },
  escrowHoldId: { type: String },
  deliveryType: { type: String, enum: DeliveryType, default: 'CARGO' },
  items: { type: [OrderItemSchema], default: [] },
}, {
  timestamps: true,
  collection: 'orders',
  bufferCommands: false,
});

OrderSchema.index({ userId: 1 });
OrderSchema.index({ vendorId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ expiresAt: 1 });
OrderSchema.index({ userId: 1, idempotencyKey: 1 });
OrderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });

// MAX_ITEMS_PER_ORDER guard — 16MB embed limit koruması (§1b)
export const MAX_ITEMS_PER_ORDER = 100;

export const Order = model<IOrder>('Order', OrderSchema);