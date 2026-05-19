// apps/backend/src/modules/delivery/delivery.module.ts
// DeliveryModule — Mongoose migration (ADR-005 Faz 2b)

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { DeliveryController } from './presentation/delivery.controller';
import { CargoTrackingController, CargoWebhookController, AdminCargoController } from './presentation/cargo-tracking.controller';
import { DispatchCourierHandler } from './application/commands/dispatch-courier.handler';
import { MarkDeliveredHandler } from './application/commands/mark-delivered.handler';
import { DispatchNotificationProcessor } from './application/workers/dispatch-notification.processor';
import { MongoDeliveryDispatchRepository } from './infrastructure/persistence/mongo-delivery-dispatch.repository';
import { CommerceModule } from '../commerce/commerce.module';
import { AuditMongooseModule } from '../audit/audit-mongoose.module';
import { DELIVERY_DISPATCH_QUEUE } from '@barterborsa/shared-queue';
import { DeliveryDispatch, DeliveryDispatchSchema } from '@barterborsa/shared-persistence/schemas/backend/deliveryDispatch.schema';
import { CargoTrackingService } from './application/services/cargo-tracking.service';
import { CargoPollingScheduler } from './application/services/cargo-polling.scheduler';
import { MngCargoAdapter } from './infrastructure/adapters/mng-cargo.adapter';
import { YurticiCargoAdapter } from './infrastructure/adapters/yurtici-cargo.adapter';
import { SuratCargoAdapter } from './infrastructure/adapters/surat-cargo.adapter';
import { TexCargoAdapter } from './infrastructure/adapters/tex-cargo.adapter';

const CommandHandlers = [DispatchCourierHandler, MarkDeliveredHandler];
const Processors = [DispatchNotificationProcessor];

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    CommerceModule,
    AuditMongooseModule,
    MongooseModule.forFeature([
      { name: DeliveryDispatch.name, schema: DeliveryDispatchSchema },
    ]),
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
  controllers: [
    DeliveryController,
    CargoTrackingController,
    CargoWebhookController,
    AdminCargoController,
  ],
  providers: [
    ...CommandHandlers,
    ...Processors,
    MongoDeliveryDispatchRepository,
    { provide: 'IDeliveryDispatchRepository', useExisting: MongoDeliveryDispatchRepository },
    CargoTrackingService,
    CargoPollingScheduler,
    MngCargoAdapter,
    YurticiCargoAdapter,
    SuratCargoAdapter,
    TexCargoAdapter,
    { provide: 'ICargoProvider_MNG', useClass: MngCargoAdapter },
    { provide: 'ICargoProvider_YURTICI', useClass: YurticiCargoAdapter },
    { provide: 'ICargoProvider_SURAT', useClass: SuratCargoAdapter },
    { provide: 'ICargoProvider_TEX', useClass: TexCargoAdapter },
  ],
  exports: [MongoDeliveryDispatchRepository],
})
export class DeliveryModule {}