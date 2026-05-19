// apps/backend/src/modules/commerce/application/consumers/order-delivered.consumer.ts
// OrderDeliveredConsumer — RabbitMQ consumer, sipariş teslim event'ini dinler
// Master Plan §3.7: "Sipariş teslim edildiğinde e-fatura oluşturulur"

import { Injectable, Logger } from '@nestjs/common';
import { EInvoiceGeneratorService } from '../services/einvoice-generator.service';

@Injectable()
export class OrderDeliveredConsumer {
  private readonly logger = new Logger(OrderDeliveredConsumer.name);

  constructor(private readonly einvoiceGenerator: EInvoiceGeneratorService) {}

  /**
   * RabbitMQ queue: order.status.delivered
   * Mesaj format: { orderId, invoiceData }
   */
  async handleOrderDelivered(message: any): Promise<void> {
    try {
      const { orderId, invoiceData } = message;

      this.logger.log('Sipariş teslim eventi alındı', { orderId });

      await this.einvoiceGenerator.onOrderDelivered(orderId, invoiceData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('OrderDeliveredConsumer hatası', { error: msg });
    }
  }
}