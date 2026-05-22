import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/order-status-history.schema.ts
// OrderStatusHistory — Prisma → Mongoose migration (ADR-005 Faz 2a)
// Document-model decision: Embed (Order içinde) — §1b embed kararı
// Status geçmişi küçük, Order ile birlikte gelir

import { Schema } from 'mongoose';

export interface IOrderStatusHistory {
  _id?: string;
  status: string;
  reason?: string;
  changedBy?: string;
  changedAt: Date;
}

export const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  _id: { type: String },
  status: { type: String, required: true },
  reason: { type: String },
  changedBy: { type: String },
  changedAt: { type: Date, default: Date.now },
}, { _id: false }); // Subdocument — kendi _id yok

// NOT: OrderStatusHistory OrderSchema'ya embed olarak eklenir
// Kullanım: OrderSchema.add({ statusHistory: [OrderStatusHistorySchema] })

export const OrderStatusHistory = createModelProxy<IOrderStatusHistory>('OrderStatusHistory', OrderStatusHistorySchema);
