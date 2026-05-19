import { Schema, model, Types } from 'mongoose';

// OrderItem — generated from Prisma schema
// TODO: strict typing — codegen

export interface IOrderItem {
  _id?: string;
  id: string;
  orderId: string;
  listingId: string;
  quantity: number;
  price: Types.Decimal128;
  totalAmount: Types.Decimal128;
  productName: string;
  variantInfo?: Schema.Types.Mixed;
}

export const OrderItemSchema = new Schema<IOrderItem>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String, alias: 'order_id' },
  listingId: { type: String, alias: 'listing_id' },
  quantity: { type: Number },
  price: { type: Types.Decimal128 },
  totalAmount: { type: Types.Decimal128, alias: 'total_amount' },
  productName: { type: String, alias: 'product_name' },
  variantInfo: { type: Schema.Types.Mixed, alias: 'variant_info' },
}, {
  timestamps: true,
  collection: 'order_items',
});

// Composite index
OrderItemSchema.index({ orderId: 1 });

// Composite index
OrderItemSchema.index({ listingId: 1 });

export const OrderItem = model<IOrderItem>('OrderItem', OrderItemSchema);
