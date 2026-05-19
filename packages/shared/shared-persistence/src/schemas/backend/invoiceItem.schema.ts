// packages/shared/shared-persistence/src/schemas/backend/invoiceItem.schema.ts
import { Schema, model, Types } from 'mongoose';

export interface IInvoiceItem {
  _id?: string;
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: Types.Decimal128;
  totalPrice: Types.Decimal128;
  taxRate: Types.Decimal128;
}

export const InvoiceItemSchema = new Schema<IInvoiceItem>({
  _id: { type: String },
  id: { type: String, required: true },
  invoiceId: { type: String },
  description: { type: String },
  quantity: { type: Number },
  unitPrice: { type: Types.Decimal128 },
  totalPrice: { type: Types.Decimal128 },
  taxRate: { type: Types.Decimal128 },
}, {
  timestamps: true,
  collection: 'invoice_items',
});

InvoiceItemSchema.index({ invoiceId: 1 });

export const InvoiceItem = model<IInvoiceItem>('InvoiceItem', InvoiceItemSchema);