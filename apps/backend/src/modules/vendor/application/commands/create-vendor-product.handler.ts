import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateVendorProductCommand } from './create-vendor-product.command';

@CommandHandler(CreateVendorProductCommand)
export class CreateVendorProductHandler
  implements ICommandHandler<CreateVendorProductCommand> {
  private readonly logger = new Logger(CreateVendorProductHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateVendorProductCommand) {
    const { userId, body } = command;
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    let catalogProductId = body.catalogProductId;

    if (!catalogProductId) {
      const slug = body.name.toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        + '-' + Math.random().toString(36).substring(7);

      const catalogProduct = await this.prisma.catalogProduct.create({
        data: {
          name: body.name,
          slug,
          description: body.description || '',
          brand: body.brand || 'Bilinmeyen',
          gtin: body.barcode || null,
          status: 'PENDING'
        }
      });
      catalogProductId = catalogProduct.id;
    }

    const listing = await this.prisma.listing.create({
      data: {
        vendorId: vendor.id,
        catalogProductId,
        title: body.name,
        description: body.description || '',
        price: !isNaN(Number(body.price)) ? Number(body.price) : 0,
        stock: !isNaN(Number(body.stock)) ? Number(body.stock) : 0,
        status: body.isActive ? 'ACTIVE' : 'INACTIVE',
        images: {
          create: (body.productImages || []).map((url: string, index: number) => ({
            url,
            order: index
          }))
        }
      }
    });

    return { success: true, data: listing };
  }
}
