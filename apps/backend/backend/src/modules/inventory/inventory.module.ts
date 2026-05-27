// apps/backend/src/modules/inventory/inventory.module.ts
// InventoryModule — Mongoose migration (ADR-005 Faz 2c)
// Catalog bağımlılıkları CatalogModule üzerinden çözülüyor

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from '../catalog/catalog.module';
import { InventoryAdminController } from './presentation/inventory-admin.controller';
import { VendorInventoryController } from './presentation/vendor-inventory.controller';
import { PurchaseOrderController } from './presentation/purchase-order.controller';

// Repository
import { MongoTransferRepository } from './infrastructure/persistence/mongo-transfer.repository';
import { Transfer, TransferSchema } from '@barterborsa/shared-persistence/schemas/backend/transfer.schema';
import { TransferItem, TransferItemSchema } from '@barterborsa/shared-persistence/schemas/backend/transferItem.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transfer.name, schema: TransferSchema },
      { name: TransferItem.name, schema: TransferItemSchema },
    ]),
    CatalogModule,
  ],
  controllers: [
    InventoryAdminController,
    VendorInventoryController,
    PurchaseOrderController,
  ],
  providers: [
    { provide: 'ITransferRepository', useClass: MongoTransferRepository },
  ],
  exports: ['ITransferRepository'],
})
export class InventoryModule {}