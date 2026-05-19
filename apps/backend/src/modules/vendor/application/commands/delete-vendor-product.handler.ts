import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, Inject } from '@nestjs/common';
import { DeleteVendorProductCommand } from './delete-vendor-product.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';

@CommandHandler(DeleteVendorProductCommand)
export class DeleteVendorProductHandler
  implements ICommandHandler<DeleteVendorProductCommand> {
  private readonly logger = new Logger(DeleteVendorProductHandler.name);
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly listingRepo: MongoListingRepository,
  ) {}

  async execute(command: DeleteVendorProductCommand) {
    const { userId, listingId } = command;
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const existing = await this.listingRepo.findById(listingId);
    if (!existing || existing.vendorId !== vendor.id) {
      throw new NotFoundException('Product not found');
    }

    await this.listingRepo.delete(listingId);
    return { success: true };
  }
}
