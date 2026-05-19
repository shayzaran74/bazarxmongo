// packages/shared/shared-persistence/src/mongodb/outbox/mongo-outbox.repository.ts
// Outbox repository — MongoDB transaction ile outbox event yazma
// ADR-005 §8.1: Tek outbox_events collection + module discriminator
// Outbox pattern: Business operation + outbox mesajı aynı transaction'da yazılır
// Outbox processor ayrı poll ile mesajları RabbitMQ'ya publish eder

import { Injectable, Logger } from '@nestjs/common';
import { Model, Connection, ClientSession } from 'mongoose';
import { OutboxMessage, IOutboxMessage, OutboxStatus } from '../../schemas/backend/outbox-message.schema';
import { withTransactionSimple } from '../mongo-unit-of-work';

export interface CreateOutboxMessageInput {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  exchange?: string;
  routingKey?: string;
  payload: Record<string, unknown>;
  module: string;
  maxRetries?: number;
}

@Injectable()
export class MongoOutboxRepository {
  private readonly logger = new Logger(MongoOutboxRepository.name);

  constructor(private readonly connection: Connection) {}

  private get model(): Model<IOutboxMessage> {
    return OutboxMessage;
  }

  /**
   * Outbox mesajı oluştur — transaction içinde business operation ile birlikte yazılır
   * Kullanım:
   *   await withTransactionSimple(connection, async (session) => {
   *     await orderRepo.create(order, { session });
   *     await outboxRepo.createOutboxMessage({ ... }, session);
   *   });
   */
  async createOutboxMessage(
    input: CreateOutboxMessageInput,
    session?: ClientSession
  ): Promise<IOutboxMessage> {
    const doc = new this.model({
      aggregateId: input.aggregateId,
      aggregateType: input.aggregateType,
      eventType: input.eventType,
      exchange: input.exchange ?? '',
      routingKey: input.routingKey ?? '',
      payload: input.payload,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3,
      module: input.module,
    });

    await doc.save({ session });
    return doc;
  }

  /**
   * Outbox processor — PENDING mesajları alır ve publish eder
   * Her mesaj için:
   * 1. Status → PROCESSING
   * 2. Publish to RabbitMQ
   * 3. Status → COMPLETED veya FAILED + retryCount++
   */
  async pollPendingMessages(batchSize = 100): Promise<IOutboxMessage[]> {
    return this.model
      .find({
        status: 'PENDING',
        retryCount: { $lt: 3 },
      })
      .sort({ createdAt: 1 })
      .limit(batchSize)
      .lean();
  }

  async markAsProcessing(id: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: { status: 'PROCESSING' } }
    );
  }

  async markAsCompleted(id: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      }
    );
  }

  async markAsFailed(id: string, errorMessage: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          status: 'FAILED',
          error: errorMessage,
        },
        $inc: { retryCount: 1 },
      }
    );
  }

  /**
   * Retry için FAILED → PENDING çevir
   * retryCount < maxRetries olanları tekrar dener
   */
  async resetForRetry(id: string): Promise<void> {
    const doc = await this.model.findById(id).lean();
    if (!doc) return;

    if (doc.retryCount < doc.maxRetries) {
      await this.model.updateOne(
        { _id: id },
        {
          $set: { status: 'PENDING' },
          $unset: { error: '' },
        }
      );
    }
  }

  /**
   * Belirli aggregate için bekleyen mesajları bul
   */
  async findByAggregate(
    aggregateType: string,
    aggregateId: string
  ): Promise<IOutboxMessage[]> {
    return this.model
      .find({
        aggregateType,
        aggregateId,
        status: { $in: ['PENDING', 'PROCESSING'] },
      })
      .sort({ createdAt: 1 })
      .lean();
  }

  /**
   * Module discriminator ile filtrele
   */
  async findByModule(module: string, limit = 100): Promise<IOutboxMessage[]> {
    return this.model
      .find({ module })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Eski tamamlanmış mesajları temizle (cleanup job)
   */
  async cleanupCompleted(daysOld = 7): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.model.deleteMany({
      status: 'COMPLETED',
      processedAt: { $lt: cutoff },
    });

    return result.deletedCount;
  }

  /**
   * Eski failed mesajları temizle (retries exhausted)
   */
  async cleanupFailed(daysOld = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.model.deleteMany({
      status: 'FAILED',
      retryCount: { $gte: 3 },
      createdAt: { $lt: cutoff },
    });

    return result.deletedCount;
  }
}