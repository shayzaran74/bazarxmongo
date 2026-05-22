import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/invoice.schema.ts
import { Schema, Types } from 'mongoose';

export const InvoiceStatus = ['DRAFT','ISSUED','PAID','OVERDUE','CANCELLED'] as const;
export type InvoiceStatusType = typeof InvoiceStatus[number];

export interface IInvoice {
  _id?: string;
  id: string;
  invoiceNumber: string;
  orderId: string;
  recipientId: string;
  subtotal: Types.Decimal128;
  taxAmount: Types.Decimal128;
  totalAmount: Types.Decimal128;
  currency: string;
  status: InvoiceStatusType;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  issuedAt: Date;
  dueAt?: Date;
  notes?: string;
  metadata?: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export const InvoiceSchema = new Schema<IInvoice>({
  _id: { type: String },
  id: { type: String, required: true },
  invoiceNumber: { type: String },
  orderId: { type: String },
  recipientId: { type: String },
  subtotal: { type: Types.Decimal128 },
  taxAmount: { type: Types.Decimal128 },
  totalAmount: { type: Types.Decimal128 },
  currency: { type: String, default: 'TRY' },
  status: { type: String, enum: InvoiceStatus, default: 'DRAFT' },
  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },
  issuedAt: { type: Date },
  dueAt: { type: Date },
  notes: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'invoices',
});

InvoiceSchema.index({ orderId: 1 });
InvoiceSchema.index({ recipientId: 1 });
InvoiceSchema.index({ status: 1 });

export const Invoice = createModelProxy<IInvoice>('Invoice', InvoiceSchema);