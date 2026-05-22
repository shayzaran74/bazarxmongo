import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// OrderStatusHistory — generated from Prisma schema
// TODO: strict typing — codegen

export interface IOrderStatusHistory {
  _id?: string;
  id: string;
  orderId: string;
  userId?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String, alias: 'order_id' },
  userId: { type: String, alias: 'user_id' },
  note: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'order_status_history',
});

// Composite index
OrderStatusHistorySchema.index({ orderId: 1 });

// Composite index
OrderStatusHistorySchema.index({ userId: 1 });

export const OrderStatusHistory = createModelProxy<IOrderStatusHistory>('OrderStatusHistory', OrderStatusHistorySchema);
