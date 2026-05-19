// packages/shared/shared-persistence/src/schemas/backend/orderReturn.schema.ts
import { Schema, model, Types } from 'mongoose';

export const ReturnStatus = ['PENDING','APPROVED','REJECTED','REFUNDED'] as const;
export type ReturnStatusType = typeof ReturnStatus[number];

export interface IOrderReturn {
  _id?: string;
  id: string;
  orderId: string;
  reason: string;
  status: ReturnStatusType;
  receiptUrl?: string;
  refundAmount: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
}

export const OrderReturnSchema = new Schema<IOrderReturn>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String },
  reason: { type: String },
  status: { type: String, enum: ReturnStatus, default: 'PENDING' },
  receiptUrl: { type: String },
  refundAmount: { type: Types.Decimal128 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'order_returns',
});

OrderReturnSchema.index({ orderId: 1 });

export const OrderReturn = model<IOrderReturn>('OrderReturn', OrderReturnSchema);