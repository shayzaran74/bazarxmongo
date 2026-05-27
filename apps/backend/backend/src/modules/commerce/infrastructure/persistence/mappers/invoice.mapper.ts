// apps/backend/src/modules/commerce/infrastructure/persistence/mappers/invoice.mapper.ts
// InvoiceMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { IInvoice } from '@barterborsa/shared-persistence/schemas/backend/invoice.schema';
import { Invoice, InvoiceProps, InvoiceStatus } from '../../../domain/entities/invoice.entity';
import { InvoiceNumber } from '../../../domain/value-objects/invoice-number.vo';

export interface InvoiceDocument extends IInvoice {
  _id?: string;
}

export class InvoiceMapper {
  public static toDomain(doc: InvoiceDocument): Invoice {
    const subtotal = doc.subtotal ? Number(doc.subtotal) : 0;
    const taxAmount = doc.taxAmount ? Number(doc.taxAmount) : 0;
    const totalAmount = doc.totalAmount ? Number(doc.totalAmount) : 0;

    const props: InvoiceProps = {
      invoiceNumber: InvoiceNumber.fromValue(doc.invoiceNumber),
      orderId: doc.orderId,
      type: 'BUYER_INVOICE',
      recipientId: doc.recipientId,
      recipientType: 'BUYER',
      subtotal,
      taxAmount,
      totalAmount,
      currency: doc.currency || 'TRY',
      status: doc.status as InvoiceStatus,
      pdfUrl: doc.pdfUrl || undefined,
      pdfGeneratedAt: doc.pdfGeneratedAt || undefined,
      issuedAt: doc.issuedAt,
      dueAt: doc.dueAt || undefined,
      notes: doc.notes || undefined,
      metadata: doc.metadata as unknown as Record<string, unknown> | undefined,
      items: [],
    };

    return Invoice.fromPersistence(props, doc.id);
  }

  public static toPersistence(domain: Invoice): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      invoiceNumber: props.invoiceNumber.value,
      orderId: props.orderId,
      recipientId: props.recipientId,
      subtotal: props.subtotal,
      taxAmount: props.taxAmount,
      totalAmount: props.totalAmount,
      currency: props.currency,
      status: props.status,
      pdfUrl: props.pdfUrl,
      pdfGeneratedAt: props.pdfGeneratedAt,
      issuedAt: props.issuedAt,
      dueAt: props.dueAt,
      notes: props.notes,
      metadata: props.metadata,
    };
  }
}