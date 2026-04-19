import { Module } from '@nestjs/common';
import { InventoryAdminController } from './presentation/inventory-admin.controller';
import { PrismaModule } from '@barterborsa/shared-persistence';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryAdminController],
  providers: [],
  exports: [],
})
export class InventoryModule {}
