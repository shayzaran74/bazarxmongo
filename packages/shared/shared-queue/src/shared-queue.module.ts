// packages/shared/shared-queue/src/shared-queue.module.ts
// Tüm modüller bu module'ü import ederek aynı Redis bağlantısını paylaşır.

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const PRODUCT_IMPORT_QUEUE = 'product-import';

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
      name: PRODUCT_IMPORT_QUEUE,
      defaultJobOptions: {
        attempts: 3,                    // hata olursa 3 deneme
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,          // tamamlanan son 100 job'ı tut
        removeOnFail: 200,              // başarısız son 200 job'ı tut
      },
    }),
  ],
  exports: [BullModule],
})
export class SharedQueueModule {}
