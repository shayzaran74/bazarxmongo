import { Module } from '@nestjs/common';
import { InventoryAdminController } from './presentation/inventory-admin.controller';
import { PrismaService } from '@barterborsa/shared-persistence';

@Module({
  controllers: [InventoryAdminController],
  providers: [PrismaService],
  exports: [],
})
export class InventoryModule {}
