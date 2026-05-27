import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, Inject } from '@nestjs/common';
import { UpdateVendorProductCommand } from './update-vendor-product.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';
import { MongoListingImageRepository } from '../../infrastructure/persistence/mongo-listing-image.repository';

@CommandHandler(UpdateVendorProductCommand)
export class UpdateVendorProductHandler
  implements ICommandHandler<UpdateVendorProductCommand> {
  private readonly logger = new Logger(UpdateVendorProductHandler.name);
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly listingRepo: MongoListingRepository,
    private readonly listingImageRepo: MongoListingImageRepository,
  ) {}

  async execute(command: UpdateVendorProductCommand) {
    const { userId, listingId, body } = command;
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const existing = await this.listingRepo.findById(listingId);
    if (!existing || existing.vendorId !== vendor.id) {
      throw new NotFoundException('Product not found or access denied');
    }

    if (body.productImages && Array.isArray(body.productImages)) {
      await this.listingImageRepo.deleteByListingId(listingId);
    }

    const updateData: Partial<{ title: string; description: string; price: number; stock: number; status: string }> = {};
    if (body.name !== undefined) updateData.title = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (!isNaN(Number(body.price))) updateData.price = Number(body.price);
    if (!isNaN(Number(body.stock))) updateData.stock = Number(body.stock);
    if (body.isActive !== undefined) updateData.status = body.isActive ? 'ACTIVE' : 'INACTIVE';

    const updated = await this.listingRepo.update(listingId, updateData);

    if (body.productImages && Array.isArray(body.productImages)) {
      for (let i = 0; i < body.productImages.length; i++) {
        await this.listingImageRepo.create({ listingId, url: body.productImages[i], order: i });
      }
    }

    return { success: true, data: updated };
  }
}
