import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// PurchaseOrder — generated from Prisma schema
// TODO: strict typing — codegen

export interface IPurchaseOrder {
  _id?: string;
  id: string;
  vendorId: string;
  supplierName?: string;
  totalAmount?: Types.Decimal128;
  status?: string;
  orderedAt?: Date;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  supplierName: { type: String, alias: 'supplier_name' },
  totalAmount: { type: Types.Decimal128, alias: 'total_amount' },
  status: { type: String, default: 'Draft' },
  orderedAt: { type: Date, alias: 'ordered_at' },
  receivedAt: { type: Date, alias: 'received_at' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'purchase_orders',
});

// Composite index
PurchaseOrderSchema.index({ vendorId: 1 });

export const PurchaseOrder = createModelProxy<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
