import { Module } from '@nestjs/common';
import { InventoryAdminController } from './presentation/inventory-admin.controller';
import { VendorInventoryController } from './presentation/vendor-inventory.controller';
import { PurchaseOrderController } from './presentation/purchase-order.controller';
import { PrismaModule } from '@barterborsa/shared-persistence';

@Module({
  imports: [PrismaModule],
  controllers: [
    InventoryAdminController, 
    VendorInventoryController,
    PurchaseOrderController
  ],
  providers: [],
  exports: [],
})
export class InventoryModule {}
