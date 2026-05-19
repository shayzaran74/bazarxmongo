// apps/backend/src/modules/catalog/application/commands/bulk-update-admin-products.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { BulkUpdateAdminProductsCommand } from './bulk-update-admin-products.command';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';

@CommandHandler(BulkUpdateAdminProductsCommand)
export class BulkUpdateAdminProductsHandler implements ICommandHandler<BulkUpdateAdminProductsCommand> {
  async execute(command: BulkUpdateAdminProductsCommand) {
    const { ids, updates } = command;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('Güncellenecek ürün ID listesi boş');
    }

    const parseBool = (val: unknown): boolean | undefined => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    };

    const isFeatured = parseBool(updates.isFeatured);
    const isFlashSale = parseBool(updates.isFlashSale);
    const isSpecialOffer = parseBool(updates.isSpecialOffer);
    const isActive = parseBool(updates.isActive);

    const catalogData: Record<string, unknown> = {};
    if (updates.status) catalogData.status = updates.status;
    if (isFeatured !== undefined) catalogData.isFeatured = isFeatured;
    if (isFlashSale !== undefined) catalogData.isFlashSale = isFlashSale;
    if (isSpecialOffer !== undefined) catalogData.isSpecialOffer = isSpecialOffer;

    const listingData: Record<string, unknown> = { ...catalogData };
    if (isActive !== undefined) {
      listingData.status = isActive ? 'ACTIVE' : 'INACTIVE';
    }

    if (Object.keys(catalogData).length > 0) {
      await CatalogProduct.updateMany({ id: { $in: ids } }, { $set: catalogData }).exec();
    }
    if (Object.keys(listingData).length > 0) {
      await Listing.updateMany({ catalogProductId: { $in: ids } }, { $set: listingData }).exec();
    }

    return { success: true, message: `${ids.length} ürün başarıyla güncellendi` };
  }
}
