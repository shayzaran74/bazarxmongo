import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/order-item.schema.ts
// OrderItem — Prisma → Mongoose migration (ADR-005 Faz 2a, Critical)
// Document-model decision: Embed (Order içinde) — §1b embed kararı
// Immutable snapshot — sipariş tamamlandıktan sonra değiştirilmez
// MAX_ITEMS_PER_ORDER = 100 guard Order.addItem() seviyesinde uygulanır

import { Schema, Types } from 'mongoose';

export interface IOrderItem {
  _id?: string;
  listingId: string;
  quantity: number;
  price: Types.Decimal128;
  totalAmount: Types.Decimal128;
  productName: string;
  productImages: string[];
  variantInfo?: Record<string, unknown>;
}

export const OrderItemSchema = new Schema<IOrderItem>({
  _id: { type: String },
  listingId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Types.Decimal128, required: true },
  totalAmount: { type: Types.Decimal128, required: true },
  productName: { type: String, required: true },
  productImages: { type: [String], default: [] },
  variantInfo: { type: Schema.Types.Mixed },
}, { _id: false }); // Subdocument — kendi _id yok

// NOT: OrderItem OrderSchema'ya embed olarak eklenir, ayrı model değil
// Kullanım: OrderSchema.add({ items: [OrderItemSchema] })
// veya Order.doc/items.push(...) ile ekleme

export const OrderItem = createModelProxy<IOrderItem>('OrderItem', OrderItemSchema);
