import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { BulkUpdateAdminProductsCommand }
  from './bulk-update-admin-products.command';

@CommandHandler(BulkUpdateAdminProductsCommand)
export class BulkUpdateAdminProductsHandler
  implements ICommandHandler<BulkUpdateAdminProductsCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BulkUpdateAdminProductsCommand) {
    const { ids, updates } = command;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('Güncellenecek ürün ID listesi boş');
    }

    const parseBool = (val: any): boolean | undefined => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    };

    const isFeatured    = parseBool(updates.isFeatured);
    const isFlashSale   = parseBool(updates.isFlashSale);
    const isSpecialOffer = parseBool(updates.isSpecialOffer);
    const isActive      = parseBool(updates.isActive);

    const catalogData: any = {};
    if (updates.status)              catalogData.status = updates.status;
    if (isFeatured !== undefined)    catalogData.isFeatured = isFeatured;
    if (isFlashSale !== undefined)   catalogData.isFlashSale = isFlashSale;
    if (isSpecialOffer !== undefined) catalogData.isSpecialOffer = isSpecialOffer;

    const listingData: any = { ...catalogData };
    if (isActive !== undefined) {
      listingData.status = isActive ? 'ACTIVE' : 'INACTIVE';
    }

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(catalogData).length > 0) {
        await tx.catalogProduct.updateMany({
          where: { id: { in: ids } },
          data: catalogData
        });
      }
      if (Object.keys(listingData).length > 0) {
        await tx.listing.updateMany({
          where: { catalogProductId: { in: ids } },
          data: listingData
        });
      }
    });

    return { success: true, message: `${ids.length} ürün başarıyla güncellendi` };
  }
}
