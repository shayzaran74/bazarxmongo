import { AggregateRoot } from '@barterborsa/shared-core';
import { InvoiceNumber } from '../value-objects/invoice-number.vo';

export type InvoiceType = 'BUYER_INVOICE' | 'VENDOR_INVOICE';
export type RecipientType = 'BUYER' | 'VENDOR';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'SENT' | 'PAID' | 'CANCELLED';

export interface InvoiceItemProps {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

export interface InvoiceProps {
  invoiceNumber: InvoiceNumber;
  orderId: string;
  type: InvoiceType;
  recipientId: string;
  recipientType: RecipientType;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  issuedAt: Date;
  dueAt?: Date;
  notes?: string;
  metadata?: any;
  items: InvoiceItemProps[];
}

export class Invoice extends AggregateRoot<InvoiceProps> {
  protected constructor(props: InvoiceProps, id?: string) {
    super(props, id);
  }

  static create(props: Omit<InvoiceProps, 'status' | 'issuedAt'>): Invoice {
    return new Invoice({
      ...props,
      status: 'DRAFT',
      issuedAt: new Date(),
    }, props.invoiceNumber.value); // Use invoiceNumber as potential ID seed or normal generate
  }

  static fromPersistence(props: InvoiceProps, id: string): Invoice {
    return new Invoice(props, id);
  }

  issue(): void {
    this.props.status = 'ISSUED';
    this._updatedAt = new Date();
  }

  attachPdf(pdfUrl: string): void {
    this.props.pdfUrl = pdfUrl;
    this.props.pdfGeneratedAt = new Date();
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === 'PAID') {
      throw new Error('Ödenmiş fatura iptal edilemez');
    }
    this.props.status = 'CANCELLED';
    this._updatedAt = new Date();
  }

  get invoiceNumber(): string { return this.props.invoiceNumber.value; }
  get status(): InvoiceStatus { return this.props.status; }
  get pdfUrl(): string | undefined { return this.props.pdfUrl; }
}
