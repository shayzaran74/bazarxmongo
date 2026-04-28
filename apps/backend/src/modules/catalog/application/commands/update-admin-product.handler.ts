import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateAdminProductCommand } from './update-admin-product.command';

@CommandHandler(UpdateAdminProductCommand)
export class UpdateAdminProductHandler
  implements ICommandHandler<UpdateAdminProductCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateAdminProductCommand) {
    const { productId, data } = command;

    const existing = await this.prisma.catalogProduct.findUnique({
      where: { id: productId }
    });
    if (!existing) throw new NotFoundException('Ürün bulunamadı');

    return await this.prisma.$transaction(async (tx) => {
      // ─── CatalogProduct güncellemesi ────────────────────────────────────────
      const productUpdate: Record<string, any> = {
        updatedAt: new Date(),
      }

      if (data.name || data.title)
        productUpdate.name = data.name || data.title

      if (data.description !== undefined)
        productUpdate.description = data.description

      if (data.gtin !== undefined || data.barcode !== undefined)
        productUpdate.gtin = data.gtin || data.barcode

      if (data.categoryId !== undefined) {
        productUpdate.categoryId = (data.categoryId && data.categoryId !== '')
          ? data.categoryId
          : null
      }

      if (data.status !== undefined)
        productUpdate.status = data.status

      if (data.isFeatured !== undefined)
        productUpdate.isFeatured = data.isFeatured

      if (data.isSpecialOffer !== undefined)
        productUpdate.isSpecialOffer = data.isSpecialOffer

      if (data.isFlashSale !== undefined)
        productUpdate.isFlashSale = data.isFlashSale

      await tx.catalogProduct.update({
        where: { id: productId },
        data: productUpdate,
      });

      // ─── Media güncellemesi ───────────────────────────────────────────────
      if (data.productImages && Array.isArray(data.productImages)) {
        await tx.productMedia.deleteMany({
          where: { productId }
        });

        if (data.productImages.length > 0) {
          await tx.productMedia.createMany({
            data: data.productImages.map((url: string, index: number) => ({
              productId,
              url,
              type: 'IMAGE',
              sortOrder: index
            }))
          });
        }
      }

      // ─── Listing güncellemesi ───────────────────────────────────────────────
      const listingUpdate: Record<string, any> = {}

      if (data.price !== undefined)
        listingUpdate.price = parseFloat(String(data.price))

      if (data.stock !== undefined)
        listingUpdate.stock = parseInt(String(data.stock), 10)

      if (data.name || data.title)
        listingUpdate.title = data.name || data.title

      if (data.description !== undefined)
        listingUpdate.description = data.description

      if (data.status !== undefined)
        listingUpdate.status = data.status

      if (data.isFeatured !== undefined)
        listingUpdate.isFeatured = data.isFeatured

      if (data.isSpecialOffer !== undefined)
        listingUpdate.isSpecialOffer = data.isSpecialOffer

      if (data.isFlashSale !== undefined)
        listingUpdate.isFlashSale = data.isFlashSale

      if (Object.keys(listingUpdate).length > 0) {
        await tx.listing.updateMany({
          where: { catalogProductId: productId },
          data: listingUpdate,
        });
      }

      return { success: true, message: 'Ürün başarıyla güncellendi' };
    });
  }
}
