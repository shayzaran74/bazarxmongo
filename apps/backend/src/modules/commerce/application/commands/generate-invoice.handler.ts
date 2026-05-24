// apps/backend/src/modules/commerce/application/commands/generate-invoice.handler.ts
// GenerateInvoiceHandler — Mongoose migration (ADR-005 Faz 2b)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { GenerateInvoiceCommand } from './generate-invoice.command';
import { IInvoiceRepository } from '../../domain/repositories/invoice.repository.interface';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceNumber } from '../../domain/value-objects/invoice-number.vo';
import { InvoicePdfService } from '../services/invoice-pdf.service';
import { StorageService } from '../services/storage.service';

@CommandHandler(GenerateInvoiceCommand)
export class GenerateInvoiceHandler
  implements ICommandHandler<GenerateInvoiceCommand> {
  private readonly logger = new Logger(GenerateInvoiceHandler.name);

  constructor(
    @Inject('IInvoiceRepository') private readonly invoiceRepository: IInvoiceRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
    private readonly invoicePdfService: InvoicePdfService,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: GenerateInvoiceCommand) {
    const { orderId, generatePdf } = command;

    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const orderProps = order.getProps();
    const vatRate = 20; // KDV %20 sabit

    // Buyer faturası
    const buyerInvoice = this.createInvoiceEntity({
      orderId: order.id,
      type: 'BUYER_INVOICE',
      recipientId: orderProps.userId,
      recipientType: 'BUYER',
      subtotal: orderProps.totalAmount,
      vatRate,
    });

    // Vendor faturası
    const vendorInvoice = this.createInvoiceEntity({
      orderId: order.id,
      type: 'VENDOR_INVOICE',
      recipientId: orderProps.vendorId,
      recipientType: 'VENDOR',
      subtotal: orderProps.totalAmount,
      vatRate,
    });

    await this.invoiceRepository.save(buyerInvoice);
    await this.invoiceRepository.save(vendorInvoice);

    if (generatePdf) {
      const orderData = {
        buyerEmail: '',
        buyerName: '',
        vendorName: 'Bilinmeyen Satıcı',
        vendorTaxNumber: undefined,
      };
      await this.attachPdf(buyerInvoice, orderData);
      await this.attachPdf(vendorInvoice, orderData);
    }

    this.logger.log(
      `Invoices generated for order ${orderId}: buyer=${buyerInvoice.invoiceNumber}, vendor=${vendorInvoice.invoiceNumber}`
    );

    return {
      buyerInvoice: { id: buyerInvoice.id, invoiceNumber: buyerInvoice.invoiceNumber, pdfUrl: buyerInvoice.pdfUrl ?? null },
      vendorInvoice: { id: vendorInvoice.id, invoiceNumber: vendorInvoice.invoiceNumber, pdfUrl: vendorInvoice.pdfUrl ?? null },
    };
  }

  private createInvoiceEntity(params: {
    orderId: string;
    type: 'BUYER_INVOICE' | 'VENDOR_INVOICE';
    recipientId: string;
    recipientType: 'BUYER' | 'VENDOR';
    subtotal: number;
    vatRate: number;
  }): Invoice {
    const { orderId, type, recipientId, recipientType, subtotal, vatRate } = params;

    const subtotalNum = Number(subtotal);
    const taxAmountNum = subtotalNum * (vatRate / 100);
    const totalAmountNum = subtotalNum + taxAmountNum;

    const invoice = Invoice.create({
      invoiceNumber: InvoiceNumber.generate(type === 'BUYER_INVOICE' ? 'BUYER' : 'VENDOR'),
      orderId,
      type,
      recipientId,
      recipientType,
      subtotal: subtotalNum,
      taxAmount: taxAmountNum,
      totalAmount: totalAmountNum,
      currency: 'TRY',
      items: [],
    });

    invoice.issue();
    return invoice;
  }

  private async attachPdf(
    invoice: Invoice,
    orderData: { buyerEmail: string; buyerName: string; vendorName: string; vendorTaxNumber?: string },
  ): Promise<void> {
    try {
      const buffer = await this.invoicePdfService.generate(invoice, orderData);
      const key = `${invoice.id}/${invoice.invoiceNumber}.pdf`;
      const result = await this.storageService.upload(buffer, key);
      invoice.attachPdf(result.url);
      await this.invoiceRepository.save(invoice);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
      this.logger.warn(`PDF üretilemedi (${invoice.invoiceNumber}): ${msg}`);
    }
  }
}
