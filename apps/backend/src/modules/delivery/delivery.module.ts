// apps/backend/src/modules/delivery/delivery.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { DeliveryController } from './presentation/delivery.controller';
import { DispatchCourierHandler } from './application/commands/dispatch-courier.handler';
import { MarkDeliveredHandler } from './application/commands/mark-delivered.handler';
import { DispatchNotificationProcessor } from './application/workers/dispatch-notification.processor';
import { PrismaDeliveryDispatchRepository } from './infrastructure/persistence/prisma-delivery-dispatch.repository';
import { CommerceModule } from '../commerce/commerce.module';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { AuditModule } from '../audit/audit.module';
import { DELIVERY_DISPATCH_QUEUE } from '@barterborsa/shared-queue';

const CommandHandlers = [DispatchCourierHandler, MarkDeliveredHandler];
const Processors = [DispatchNotificationProcessor];

@Module({
  imports: [
    CqrsModule,
    CommerceModule,
    PrismaModule,
    AuditModule,
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
  controllers: [DeliveryController],
  providers: [
    ...CommandHandlers,
    ...Processors,
    PrismaDeliveryDispatchRepository,
    { provide: 'IDeliveryDispatchRepository', useExisting: PrismaDeliveryDispatchRepository },
  ],
  exports: [PrismaDeliveryDispatchRepository],
})
export class DeliveryModule {}