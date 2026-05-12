// packages/shared/shared-queue/src/shared-queue.module.ts
// Tüm modüller bu module'ü import ederek aynı Redis bağlantısını paylaşır.

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const PRODUCT_IMPORT_QUEUE = 'product-import';
export const DELIVERY_DISPATCH_QUEUE = 'delivery-dispatch';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'product-import',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    }),
    BullModule.registerQueue({
      name: 'delivery-dispatch',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    }),
  ],
  exports: [BullModule],
})
export class SharedQueueModule {}
