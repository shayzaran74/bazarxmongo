// apps/backend/src/infrastructure/outbox/outbox-processor.service.ts

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OutboxMessage } from '@barterborsa/shared-persistence/schemas/backend/outbox-message.schema';
import { RabbitMQService } from '@barterborsa/shared-messaging';

@Injectable()
export class OutboxProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private readonly POLL_INTERVAL_MS = 5000;
  private readonly BATCH_SIZE = 100;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor(private readonly rabbitMQ: RabbitMQService) {}

  onModuleInit() {
    this.startProcessing();
    this.logger.log('Outbox processor başlatıldı');
  }

  onModuleDestroy() {
    this.stopProcessing();
    this.logger.log('Outbox processor durduruldu');
  }

  private startProcessing() {
    this.intervalHandle = setInterval(() => {
      if (!this.isProcessing) {
        this.processPendingEvents().catch((err) => {
          this.logger.error('Outbox işleme hatası', err);
        });
      }
    }, this.POLL_INTERVAL_MS);
  }

  private stopProcessing() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private async processPendingEvents(): Promise<void> {
    this.isProcessing = true;

    try {
      let processedCount = 0;
      while (processedCount < this.BATCH_SIZE) {
        const msg = await OutboxMessage.findOneAndUpdate(
          {
            status: 'PENDING',
            $expr: {
              $lt: ['$retryCount', { $ifNull: ['$maxRetries', 3] }]
            }
          },
          {
            $set: { status: 'PROCESSING' },
          },
          {
            sort: { createdAt: 1 },
            new: true,
            lean: true,
          },
        );

        if (!msg) {
          break;
        }

        await this.processMessage(msg as any);
        processedCount++;
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processMessage(msg: { _id: string; exchange: string; routingKey: string; payload: unknown; retryCount: number; maxRetries?: number }): Promise<void> {
    try {
      await this.rabbitMQ.publish(msg.exchange, msg.routingKey, msg.payload);

      await OutboxMessage.updateOne(
        { _id: msg._id },
        {
          $set: {
            status: 'COMPLETED',
            processedAt: new Date(),
          },
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      const maxRetries = msg.maxRetries ?? 3;
      const nextRetryCount = msg.retryCount + 1;
      const status = nextRetryCount >= maxRetries ? 'FAILED' : 'PENDING';

      await OutboxMessage.updateOne(
        { _id: msg._id },
        {
          $set: { status, error: errorMessage },
          $inc: { retryCount: 1 },
        }
      );

      if (status === 'FAILED') {
        this.logger.error(`Outbox mesajı kalıcı olarak BAŞARISIZ oldu: ${msg._id}, exchange: ${msg.exchange}, routingKey: ${msg.routingKey}. Hata: ${errorMessage}`);
      } else {
        this.logger.warn(`Outbox mesajı işlenemedi: ${msg._id}, tekrar deneme: ${nextRetryCount}/${maxRetries}`, {
          error: errorMessage,
        });
      }
    }
  }
}
