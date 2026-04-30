// apps/financial-service/src/modules/escrow/infrastructure/messaging/escrow.consumer.ts

import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { CommandBus } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { CreateEscrowCommand } from '../../application/commands/create-escrow.command';

// Sipariş oluşturulduğunda commerce.events'ten gelen mesaj yapısı
interface OrderCreatedMessage {
  orderId: string;
  buyerId: string;
  sellerId: string;
  totalAmount: string | number;
}

// Yeniden denemenin anlamsız olduğu kalıcı hata mesajları
const PERMANENT_ERROR_PATTERNS = [
  'Yersiz bakiye',
  'Yetersiz bakiye',
  'bulunamadı',
  'not found',
  'Invalid',
];

function isPermanentError(message: string): boolean {
  const lower = message.toLowerCase();
  return PERMANENT_ERROR_PATTERNS.some(pattern => lower.includes(pattern.toLowerCase()));
}

@Injectable()
export class EscrowConsumer {
  private readonly logger = new Logger(EscrowConsumer.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    exchange: 'commerce.events',
    routingKey: 'order.created',
    queue: 'financial.escrow.order_created',
    queueOptions: {
      // Başarısız mesajlar financial.dead-letter exchange'ine yönlendirilir
      deadLetterExchange: 'financial.dead-letter',
      deadLetterRoutingKey: 'escrow.order_created.failed',
      durable: true,
    },
  })
  async handleOrderCreated(msg: OrderCreatedMessage): Promise<Nack | void> {
    // Zorunlu alan kontrolü — eksik veriyle işlem yapılamaz
    if (!msg.orderId || !msg.buyerId || !msg.sellerId || msg.totalAmount == null) {
      this.logger.error(
        { msg },
        '[OrderCreated] Geçersiz mesaj yapısı — zorunlu alanlar eksik. DLQ\'ya yönlendiriliyor.',
      );
      // Kalıcı hata: requeue = false → dead-letter exchange'e gider
      return new Nack(false);
    }

    this.logger.log(
      { orderId: msg.orderId, buyerId: msg.buyerId },
      '[OrderCreated] Escrow başlatma isteği alındı.',
    );

    try {
      await this.commandBus.execute(
        new CreateEscrowCommand(
          msg.orderId,
          msg.buyerId,
          msg.sellerId,
          new Decimal(msg.totalAmount),
        ),
      );

      this.logger.log(
        { orderId: msg.orderId },
        '[OrderCreated] Escrow başarıyla oluşturuldu.',
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (isPermanentError(errorMessage)) {
        // Kalıcı hata: retry yapmak anlamsız — DLQ'ya yönlendir
        this.logger.error(
          { orderId: msg.orderId, error: errorMessage },
          '[OrderCreated] Kalıcı hata — escrow oluşturulamadı. DLQ\'ya yönlendiriliyor.',
        );
        return new Nack(false);
      }

      // Geçici hata (DB bağlantısı, timeout vb.): yeniden dene
      this.logger.warn(
        { orderId: msg.orderId, error: errorMessage },
        '[OrderCreated] Geçici hata — mesaj yeniden kuyruğa alınacak.',
      );
      // Hata fırlatmak yerine Nack(true) döndürüyoruz: daha kontrollü
      return new Nack(true);
    }
  }
}
