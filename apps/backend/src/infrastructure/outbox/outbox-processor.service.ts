// apps/backend/src/infrastructure/outbox/outbox-processor.service.ts

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RabbitMQService } from '@barterborsa/shared-messaging';

@Injectable()
export class OutboxProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private readonly POLL_INTERVAL_MS = 5000;
  private readonly BATCH_SIZE = 100;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQService,
  ) {}

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
      const pendingMessages = await this.prisma.outboxMessage.findMany({
        where: {
          status: 'PENDING',
          retryCount: { lt: 3 },
        },
        take: this.BATCH_SIZE,
        orderBy: { createdAt: 'asc' },
      });

      for (const msg of pendingMessages) {
        await this.processMessage(msg);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processMessage(msg: { id: string; exchange: string; routingKey: string; payload: unknown; retryCount: number }): Promise<void> {
    try {
      await this.prisma.outboxMessage.update({
        where: { id: msg.id },
        data: { status: 'PROCESSING' },
      });

      await this.rabbitMQ.publish(msg.exchange, msg.routingKey, msg.payload);

      await this.prisma.outboxMessage.update({
        where: { id: msg.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';

      await this.prisma.outboxMessage.update({
        where: { id: msg.id },
        data: {
          status: 'PENDING',
          retryCount: { increment: 1 },
          error: errorMessage,
        },
      });

      this.logger.warn(`Outbox mesajı işlenemedi: ${msg.id}, tekrar deneme: ${msg.retryCount + 1}`, {
        error: errorMessage,
      });
    }
  }
}
