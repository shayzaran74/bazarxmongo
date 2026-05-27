// apps/backend/src/modules/garage-sale/garage-sale.module.ts
// Master Plan v4.3 §4.4 — Garaj Günü modülü (Flash Sale).

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GarageSaleSchema, GarageSalePurchaseSchema,
  ListingSchema, VendorSchema,
} from '@barterborsa/shared-persistence';

import { GarageSaleController } from './presentation/garage-sale.controller';
import { CreateGarageSaleHandler } from './application/commands/create-garage-sale.handler';
import { PurchaseFromGarageSaleHandler } from './application/commands/purchase-from-garage-sale.handler';
import { SmartCapService } from './application/services/smart-cap.service';
import { GarageSaleCloserService } from './application/services/garage-sale-closer.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'GarageSale',         schema: GarageSaleSchema },
      { name: 'GarageSalePurchase', schema: GarageSalePurchaseSchema },
      { name: 'Listing',            schema: ListingSchema },
      { name: 'Vendor',             schema: VendorSchema },
    ]),
  ],
  controllers: [GarageSaleController],
  providers: [
    SmartCapService,
    GarageSaleCloserService,
    CreateGarageSaleHandler,
    PurchaseFromGarageSaleHandler,
  ],
  exports: [SmartCapService],
})
export class GarageSaleModule {}
