// apps/backend/src/modules/barterborsa/barterborsa.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { BlindPoolController } from './presentation/blind-pool.controller';
import { BlindPoolService } from './application/services/blind-pool.service';
import { BarterModule } from '../barter/barter.module';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [CqrsModule, PrismaModule, BarterModule, VendorModule],
  controllers: [BlindPoolController],
  providers:   [BlindPoolService],
  exports:     [BlindPoolService],
})
export class BarterBorsaModule {}
