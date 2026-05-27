import { Invoice } from '../entities/invoice.entity';

export interface IInvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findByOrderId(orderId: string): Promise<Invoice[]>;
  findByRecipientId(
    recipientId: string,
    pagination: { page?: number; limit?: number }
  ): Promise<{ items: Invoice[]; total: number }>;
  save(invoice: Invoice): Promise<void>;
  findAll(): Promise<Invoice[]>;
}
