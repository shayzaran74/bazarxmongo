// apps/backend/src/modules/catalog/application/commands/bulk-delete-admin-products.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { BulkDeleteAdminProductsCommand } from './bulk-delete-admin-products.command';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';

@CommandHandler(BulkDeleteAdminProductsCommand)
export class BulkDeleteAdminProductsHandler implements ICommandHandler<BulkDeleteAdminProductsCommand> {
  private readonly logger = new Logger(BulkDeleteAdminProductsHandler.name);

  async execute(command: BulkDeleteAdminProductsCommand) {
    const { ids } = command;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('Silinecek ürün ID listesi boş veya geçersiz');
    }

    let successCount = 0;
    const failedIds: string[] = [];

    for (const id of ids) {
      try {
        await Listing.deleteMany({ catalogProductId: id }).exec();
        await CatalogProduct.deleteOne({ id }).exec();
        successCount++;
      } catch (e: unknown) {
        this.logger.warn(`Ürün silinemedi: ${id} — ${(e instanceof Error ? e.message : String(e))}`);
        failedIds.push(id);
      }
    }

    const message = failedIds.length > 0
      ? `${successCount} ürün silindi. ${failedIds.length} ürün silinemedi (sipariş geçmişi). Lütfen pasife alın.`
      : `${successCount} ürün başarıyla silindi.`;

    return {
      success: true,
      message,
      details: { successCount, failedCount: failedIds.length }
    };
  }
}
