// packages/shared/shared-messaging/src/rabbitmq/rabbitmq.module.ts

import { Global, Module } from '@nestjs/common';
import { RabbitMQModule as gM } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';

@Global()
@Module({
  imports: [
    gM.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
        exchanges: [
          { name: 'identity.events', type: 'topic' },
          { name: 'commerce.events', type: 'topic' },
          { name: 'financial.events', type: 'topic' },
          { name: 'delivery.events', type: 'topic' },
        ],
        connectionInitOptions: { wait: true },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RabbitMQService],
  exports: [gM, RabbitMQService],
})
export class RabbitMQModule {}
