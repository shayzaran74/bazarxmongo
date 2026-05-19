import { Schema, model, Types } from 'mongoose';

// PurchaseOrderItem — generated from Prisma schema
// TODO: strict typing — codegen

export interface IPurchaseOrderItem {
  _id?: string;
  id: string;
  purchaseOrderId: string;
  listingId: string;
  quantity: number;
  receivedQty: number;
  unitPrice?: Types.Decimal128;
}

export const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>({
  _id: { type: String },
  id: { type: String, required: true },
  purchaseOrderId: { type: String, alias: 'purchase_order_id' },
  listingId: { type: String, alias: 'listing_id' },
  quantity: { type: Number },
  receivedQty: { type: Number, default: 0, alias: 'received_qty' },
  unitPrice: { type: Types.Decimal128, alias: 'unit_price' },
}, {
  timestamps: true,
  collection: 'purchase_order_items',
});

// Composite index
PurchaseOrderItemSchema.index({ listingId: 1 });

export const PurchaseOrderItem = model<IPurchaseOrderItem>('PurchaseOrderItem', PurchaseOrderItemSchema);
