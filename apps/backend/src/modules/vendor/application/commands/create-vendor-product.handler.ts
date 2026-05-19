import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, Inject } from '@nestjs/common';
import { CreateVendorProductCommand } from './create-vendor-product.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';
import { MongoCatalogProductRepository } from '../../../catalog/infrastructure/persistence/mongo-catalog-product.repository';
import { MongoListingImageRepository } from '../../infrastructure/persistence/mongo-listing-image.repository';

@CommandHandler(CreateVendorProductCommand)
export class CreateVendorProductHandler
  implements ICommandHandler<CreateVendorProductCommand> {
  private readonly logger = new Logger(CreateVendorProductHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly listingRepo: MongoListingRepository,
    private readonly catalogProductRepo: MongoCatalogProductRepository,
    private readonly listingImageRepo: MongoListingImageRepository,
  ) {}

  async execute(command: CreateVendorProductCommand) {
    const { userId, body } = command;
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    let catalogProductId = body.catalogProductId;

    if (!catalogProductId) {
      const slug = body.name.toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        + '-' + Math.random().toString(36).substring(7);

      const catalogProduct = await this.catalogProductRepo.create({
        name: body.name,
        slug,
        description: body.description || '',
        brand: body.brand || 'Bilinmeyen',
        gtin: body.barcode || undefined,
        status: 'PENDING',
      });
      catalogProductId = catalogProduct.id;
    }

    const listing = await this.listingRepo.create({
      vendorId: vendor.id,
      catalogProductId,
      title: body.name,
      description: body.description || '',
      price: !isNaN(Number(body.price)) ? Number(body.price) : 0,
      stock: !isNaN(Number(body.stock)) ? Number(body.stock) : 0,
      status: body.isActive ? 'ACTIVE' : 'INACTIVE',
    });

    if (body.productImages && Array.isArray(body.productImages)) {
      for (let i = 0; i < body.productImages.length; i++) {
        await this.listingImageRepo.create({
          listingId: listing.id,
          url: body.productImages[i],
          order: i,
        });
      }
    }

    return { success: true, data: listing };
  }
}
