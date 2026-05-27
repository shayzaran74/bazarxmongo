// apps/backend/src/modules/barterborsa/barterborsa.module.ts
// BarterBorsaModule — Mongoose (ADR-005 Faz 2c)

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { BarterModule } from '../barter/barter.module';
import { VendorModule } from '../vendor/vendor.module';
import { CatalogModule } from '../catalog/catalog.module';
import { BlindPoolController } from './presentation/blind-pool.controller';
import { BlindPoolService } from './application/services/blind-pool.service';
import { MongoBlindPoolRepository } from './infrastructure/persistence/mongo-blind-pool.repository';
import { MongoBlindPoolEntryRepository } from './infrastructure/persistence/mongo-blind-pool-entry.repository';
import { MongoVendorB2BDataRepository } from './infrastructure/persistence/mongo-vendor-b2b-data.repository';
import { MongoListingRepository } from '../catalog/infrastructure/persistence/mongo-listing.repository';
import { MongoVendorRepository } from '../vendor/infrastructure/persistence/mongo-vendor.repository';
import { BlindPool, BlindPoolSchema } from '@barterborsa/shared-persistence/schemas/backend/blindPool.schema';
import { BlindPoolEntry, BlindPoolEntrySchema } from '@barterborsa/shared-persistence/schemas/backend/blindPoolEntry.schema';
import { VendorB2BData, VendorB2BDataSchema } from '@barterborsa/shared-persistence/schemas/backend/vendorB2BData.schema';

@Module({
  imports: [
    CqrsModule,
    BarterModule,
    VendorModule,
    CatalogModule,
    MongooseModule.forFeature([
      { name: BlindPool.name, schema: BlindPoolSchema },
      { name: BlindPoolEntry.name, schema: BlindPoolEntrySchema },
      { name: VendorB2BData.name, schema: VendorB2BDataSchema },
    ]),
  ],
  controllers: [BlindPoolController],
  providers: [
    BlindPoolService,
    MongoBlindPoolRepository,
    MongoBlindPoolEntryRepository,
    MongoVendorB2BDataRepository,
    MongoListingRepository,
    MongoVendorRepository,
  ],
  exports: [BlindPoolService],
})
export class BarterBorsaModule {}
