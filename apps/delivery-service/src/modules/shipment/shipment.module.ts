import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ShipmentDocument, ShipmentSchema } from './infrastructure/persistence/schemas/shipment.schema';
import { MongoShipmentRepository } from './infrastructure/persistence/mongo-shipment.repository';
import { CreateShipmentHandler } from './application/commands/create-shipment.handler';
import { GetShipmentHandler } from './application/queries/get-shipment.handler';
import { ShipmentController } from './presentation/shipment.controller';
import { ShipmentNumberService } from './application/services/shipment-number.service';
import { EstimatedDeliveryService } from './application/services/estimated-delivery.service';

import { OrderCreatedHandler } from './application/event-handlers/order-created.handler';
import { BarterAcceptedHandler } from './application/event-handlers/barter-accepted.handler';
import { CreateBarterShipmentsHandler } from './application/commands/create-barter-shipments.handler';

const Handlers = [
  CreateShipmentHandler, 
  CreateBarterShipmentsHandler,
  GetShipmentHandler, 
  OrderCreatedHandler,
  BarterAcceptedHandler
];
const Services = [ShipmentNumberService, EstimatedDeliveryService];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: ShipmentDocument.name, schema: ShipmentSchema }]),
  ],
  controllers: [ShipmentController],
  providers: [
    ...Handlers,
    ...Services,
    {
      provide: 'IShipmentRepository',
      useClass: MongoShipmentRepository,
    },
  ],
  exports: ['IShipmentRepository'],
})
export class ShipmentModule {}
