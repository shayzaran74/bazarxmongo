// packages/shared/shared-messaging/src/rabbitmq/rabbitmq.service.ts

import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Prisma } from '@prisma/client';

@Injectable()
export class RabbitMQService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(exchange: string, routingKey: string, payload: unknown): Promise<void> {
    await this.amqpConnection.publish(exchange, routingKey, payload);
  }

  // Transactional outbox: Event'i transaction içinde OutboxMessage tablosuna yazar
  async publishTransactional(
    tx: Prisma.TransactionClient,
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    exchange: string,
    routingKey: string,
    payload: any,
  ): Promise<void> {
    await tx.outboxMessage.create({
      data: {
        aggregateId,
        aggregateType,
        eventType,
        exchange,
        routingKey,
        payload,
        status: 'PENDING',
      },
    });
  }
}
