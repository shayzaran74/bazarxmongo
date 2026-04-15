import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackingEventDocument, TrackingEventSchema } from './infrastructure/persistence/schemas/tracking-event.schema';
import { ShipmentLocationDocument, ShipmentLocationSchema } from './infrastructure/persistence/schemas/shipment-location.schema';
import { TrackingGateway } from './infrastructure/websocket/tracking.gateway';
import { UpdateLocationHandler } from './application/commands/update-location.handler';
import { TrackingController } from './presentation/tracking.controller';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: TrackingEventDocument.name, schema: TrackingEventSchema },
      { name: ShipmentLocationDocument.name, schema: ShipmentLocationSchema },
    ]),
  ],
  controllers: [TrackingController],
  providers: [
    TrackingGateway,
    UpdateLocationHandler,
  ],
  exports: [TrackingGateway],
})
export class TrackingModule {}
