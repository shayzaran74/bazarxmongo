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

    await this.prisma.catalogProduct.update({
      where: { id: productId },
      data: {
        name: data.name || data.title,
        description: data.description,
        gtin: data.gtin || data.barcode,
        categoryId: data.categoryId,
        status: data.status,
        updatedAt: new Date()
      }
    });

    if (data.price !== undefined || data.stock !== undefined
        || data.title || data.name) {
      const listingUpdate: any = {};
      if (data.price !== undefined)
        listingUpdate.price = parseFloat(String(data.price));
      if (data.stock !== undefined)
        listingUpdate.stock = parseInt(String(data.stock), 10);
      if (data.title || data.name)
        listingUpdate.title = data.title || data.name;
      if (data.description !== undefined)
        listingUpdate.description = data.description;

      await this.prisma.listing.updateMany({
        where: { catalogProductId: productId },
        data: listingUpdate
      });
    }

    return { success: true, message: 'Ürün başarıyla güncellendi' };
  }
}
