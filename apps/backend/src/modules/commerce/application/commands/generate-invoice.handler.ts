import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma } from '@prisma/client';
import { GenerateInvoiceCommand } from './generate-invoice.command';
import { IInvoiceRepository }
  from '../../domain/repositories/invoice.repository.interface';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceNumber } from '../../domain/value-objects/invoice-number.vo';
import { InvoicePdfService }
  from '../services/invoice-pdf.service';
import { StorageService }
  from '../services/storage.service';

@CommandHandler(GenerateInvoiceCommand)
export class GenerateInvoiceHandler
  implements ICommandHandler<GenerateInvoiceCommand> {
  private readonly logger = new Logger(GenerateInvoiceHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly invoicePdfService: InvoicePdfService,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: GenerateInvoiceCommand) {
    const { orderId, generatePdf } = command;

    // 1. Siparişi ve ilgili verileri getir
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            listing: {
              include: {
                catalogProduct: true
              }
            }
          }
        },
        vendor: {
          include: {
            company: true,
            profile: true
          }
        }
      }
    });

    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    // 2. Buyer bilgisini getir
    const buyer = await this.prisma.user.findUnique({
      where: { id: order.userId },
      include: { profile: true }
    });

    const vatRate = new Prisma.Decimal(
      order.vendor?.company?.vatRate || 20
    );

    // 3. Buyer faturası
    const buyerInvoice = await this.createInvoice({
      order,
      type: 'BUYER_INVOICE',
      recipientId: order.userId,
      recipientType: 'BUYER',
      vatRate,
    });

    // 4. Vendor faturası
    const vendorInvoice = await this.createInvoice({
      order,
      type: 'VENDOR_INVOICE',
      recipientId: order.vendorId,
      recipientType: 'VENDOR',
      vatRate,
    });

    // 5. PDF üretimi
    if (generatePdf) {
      const orderData = {
        buyerEmail: buyer?.email || '',
        buyerName: buyer?.profile
          ? `${buyer.profile.firstName || ''} ${buyer.profile.lastName || ''}`.trim()
          : buyer?.email || '',
        vendorName: order.vendor?.company?.name || 'Bilinmeyen Satıcı',
        vendorTaxNumber: order.vendor?.company?.taxNumber || undefined,
      };

      await this.attachPdf(buyerInvoice, orderData);
      await this.attachPdf(vendorInvoice, orderData);
    }

    this.logger.log(
      `Invoices generated for order ${orderId}: ` +
      `buyer=${buyerInvoice.invoiceNumber}, vendor=${vendorInvoice.invoiceNumber}`
    );

    return {
      buyerInvoice: {
        id: buyerInvoice.id,
        invoiceNumber: buyerInvoice.invoiceNumber,
        pdfUrl: buyerInvoice.pdfUrl
      },
      vendorInvoice: {
        id: vendorInvoice.id,
        invoiceNumber: vendorInvoice.invoiceNumber,
        pdfUrl: vendorInvoice.pdfUrl
      }
    };
  }

  private async createInvoice(params: {
    order: any;
    type: 'BUYER_INVOICE' | 'VENDOR_INVOICE';
    recipientId: string;
    recipientType: 'BUYER' | 'VENDOR';
    vatRate: Prisma.Decimal;
  }): Promise<Invoice> {
    const { order, type, recipientId, recipientType, vatRate } = params;

    const items = order.orderItems.map((oi: any) => {
      const unitPrice = new Prisma.Decimal(oi.price);
      const totalPrice = new Prisma.Decimal(oi.totalAmount);
      const taxRate = vatRate;
      return {
        description: oi.productName,
        quantity: oi.quantity,
        unitPrice,
        totalPrice,
        taxRate,
      };
    });

    const subtotal = new Prisma.Decimal(order.totalAmount);
    const taxAmount = subtotal.mul(vatRate).div(100);
    const totalAmount = subtotal.plus(taxAmount);

    const invoice = Invoice.create({
      invoiceNumber: InvoiceNumber.generate(
        type === 'BUYER_INVOICE' ? 'BUYER' : 'VENDOR'
      ),
      orderId: order.id,
      type,
      recipientId,
      recipientType,
      subtotal,
      taxAmount,
      totalAmount,
      currency: order.currency || 'TRY',
      items,
    });

    invoice.issue();
    await this.invoiceRepository.save(invoice);
    return invoice;
  }

  private async attachPdf(invoice: Invoice, orderData: any): Promise<void> {
    try {
      const buffer = await this.invoicePdfService.generate(invoice, orderData);
      const key = `${invoice.id}/${invoice.invoiceNumber}.pdf`;
      const result = await this.storageService.upload(buffer, key);
      invoice.attachPdf(result.url);
      await this.invoiceRepository.save(invoice);
    } catch (e: any) {
      this.logger.warn(
        `PDF üretilemedi (${invoice.invoiceNumber}): ${e.message}`
      );
      // PDF hatası faturayı bloklamasın
    }
  }
}
