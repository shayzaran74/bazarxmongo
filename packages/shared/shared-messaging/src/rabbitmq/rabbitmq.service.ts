// packages/shared/shared-messaging/src/rabbitmq/rabbitmq.service.ts

import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(exchange: string, routingKey: string, payload: any): Promise<void> {
    await this.amqpConnection.publish(exchange, routingKey, payload);
  }
}
