// apps/backend/src/modules/commerce/application/services/einvoice-generator.service.ts
// EInvoiceGeneratorService — e-Fatura oluşturma ve gönderme (Master Plan §3.7)
// RabbitMQ consumer: order.status.delivered event'ini dinler

import { Injectable, Logger, Inject } from '@nestjs/common';
import { IEInvoiceProvider } from '../../domain/interfaces/IEInvoiceProvider.interface';
import { EInvoiceStatus } from '../../domain/enums/einvoice-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@Injectable()
export class EInvoiceGeneratorService {
  private readonly logger = new Logger(EInvoiceGeneratorService.name);

  constructor(
    @Inject('IEInvoiceProvider') private readonly einvoiceProvider: IEInvoiceProvider,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Sipariş teslim edildiğinde e-fatura oluştur ve GİB'e gönder
   */
  async onOrderDelivered(orderId: string, invoiceData: any): Promise<void> {
    this.logger.log('e-Fatura oluşturma tetiklendi', { orderId });

    try {
      // 1. XML oluştur
      const xmlResult = await this.einvoiceProvider.generateXml(invoiceData);

      // 2. İmzala
      const signResult = await this.einvoiceProvider.signXml(
        xmlResult.xmlContent,
        process.env.EINVOICE_CERTIFICATE_DATA ?? '',
      );

      // 3. GİB'e gönder
      const sendResult = await this.einvoiceProvider.sendToGib(
        signResult.signedXml,
        invoiceData.recipientId,
      );

      await this.auditLog.log({
        actorId: 'SYSTEM',
        action: 'EINVOICE_GENERATED',
        resourceType: 'EInvoice',
        resourceId: orderId,
        newValue: {
          einvoiceNumber: sendResult.einvoiceNumber,
          status: sendResult.gibStatus,
        },
      });

      this.logger.log('e-Fatura başarıyla oluşturuldu ve gönderildi', {
        orderId,
        einvoiceNumber: sendResult.einvoiceNumber,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('e-Fatura oluşturma hatası', { orderId, error: msg });
    }
  }

  /**
   * Admin e-fatura tekrar gönderir
   */
  async resendEInvoice(einvoiceId: string): Promise<void> {
    // TODO: Veritabanından e-fatura kaydını çek ve tekrar gönder
    this.logger.log('e-Fatura yeniden gönderiliyor', { einvoiceId });
  }

  async getEInvoice(orderId: string): Promise<any> {
    // TODO: Veritabanından e-fatura kaydını getir
    return null;
  }
}