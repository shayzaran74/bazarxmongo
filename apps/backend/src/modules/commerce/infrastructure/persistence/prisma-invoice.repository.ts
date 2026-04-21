import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma } from '@prisma/client';
import { IInvoiceRepository } from '../../domain/repositories/invoice.repository.interface';
import { Invoice, InvoiceProps, InvoiceItemProps }
  from '../../domain/entities/invoice.entity';
import { InvoiceNumber } from '../../domain/value-objects/invoice-number.vo';

@Injectable()
export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: any): Invoice {
    const items: InvoiceItemProps[] = (record.items || []).map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      taxRate: item.taxRate,
    }));

    const props: InvoiceProps = {
      invoiceNumber: InvoiceNumber.fromValue(record.invoiceNumber),
      orderId: record.orderId,
      type: record.type,
      recipientId: record.recipientId,
      recipientType: record.recipientType,
      status: record.status,
      subtotal: record.subtotal,
      taxAmount: record.taxAmount,
      totalAmount: record.totalAmount,
      currency: record.currency,
      pdfUrl: record.pdfUrl || undefined,
      pdfGeneratedAt: record.pdfGeneratedAt || undefined,
      issuedAt: record.issuedAt,
      dueAt: record.dueAt || undefined,
      notes: record.notes || undefined,
      metadata: record.metadata || undefined,
      items,
    };

    return Invoice.fromPersistence(props, record.id);
  }

  async findById(id: string): Promise<Invoice | null> {
    const record = await (this.prisma as any).invoice.findUnique({
      where: { id },
      include: { items: true }
    });
    return record ? this.toDomain(record) : null;
  }

  async findByOrderId(orderId: string): Promise<Invoice[]> {
    const records = await (this.prisma as any).invoice.findMany({
      where: { orderId },
      include: { items: true }
    });
    return records.map((r: any) => this.toDomain(r));
  }

  async findByRecipientId(
    recipientId: string,
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ items: Invoice[]; total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      (this.prisma as any).invoice.findMany({
        where: { recipientId },
        include: { items: true },
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' }
      }),
      (this.prisma as any).invoice.count({ where: { recipientId } })
    ]);

    return { items: records.map((r: any) => this.toDomain(r)), total };
  }

  async save(invoice: Invoice): Promise<void> {
    const props = invoice.getProps();

    await (this.prisma as any).invoice.upsert({
      where: { id: invoice.id },
      create: {
        id: invoice.id,
        invoiceNumber: props.invoiceNumber.value,
        orderId: props.orderId,
        type: props.type as any,
        recipientId: props.recipientId,
        recipientType: props.recipientType as any,
        status: props.status as any,
        subtotal: props.subtotal,
        taxAmount: props.taxAmount,
        totalAmount: props.totalAmount,
        currency: props.currency,
        pdfUrl: props.pdfUrl,
        pdfGeneratedAt: props.pdfGeneratedAt,
        issuedAt: props.issuedAt,
        dueAt: props.dueAt,
        notes: props.notes,
        metadata: props.metadata as any,
        items: {
          create: props.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            taxRate: item.taxRate,
          }))
        }
      },
      update: {
        status: props.status as any,
        pdfUrl: props.pdfUrl,
        pdfGeneratedAt: props.pdfGeneratedAt,
        notes: props.notes,
        metadata: props.metadata as any,
      }
    });
  }

  async findAll(): Promise<Invoice[]> {
    const records = await (this.prisma as any).invoice.findMany({
      include: { items: true }
    });
    return records.map((r: any) => this.toDomain(r));
  }
}
