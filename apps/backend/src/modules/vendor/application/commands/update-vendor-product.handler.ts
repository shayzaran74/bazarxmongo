import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateVendorProductCommand } from './update-vendor-product.command';

@CommandHandler(UpdateVendorProductCommand)
export class UpdateVendorProductHandler
  implements ICommandHandler<UpdateVendorProductCommand> {
  private readonly logger = new Logger(UpdateVendorProductHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateVendorProductCommand) {
    const { userId, listingId, body } = command;
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const existing = await this.prisma.listing.findUnique({
      where: { id: listingId }
    });
    if (!existing || existing.vendorId !== vendor.id) {
      throw new NotFoundException('Product not found or access denied');
    }

    // Eğer yeni resimler varsa eskilerini temizle
    if (body.productImages && Array.isArray(body.productImages)) {
      await this.prisma.listingImage.deleteMany({
        where: { listingId }
      });
    }

    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        title: body.name || existing.title,
        description: body.description,
        price: !isNaN(Number(body.price)) ? Number(body.price) : existing.price,
        stock: !isNaN(Number(body.stock)) ? Number(body.stock) : existing.stock,
        status: body.isActive !== undefined
          ? (body.isActive ? 'ACTIVE' : 'INACTIVE')
          : existing.status,
        images: (body.productImages && Array.isArray(body.productImages))
          ? {
              create: body.productImages.map((url: string, index: number) => ({
                url,
                order: index
              }))
            }
          : undefined
      }
    });

    return { success: true, data: updated };
  }
}
