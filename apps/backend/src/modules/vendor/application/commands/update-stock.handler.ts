import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, Inject } from '@nestjs/common';
import { UpdateStockCommand } from './update-stock.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoInventoryLogRepository } from '../../infrastructure/persistence/mongo-inventory-log.repository';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';

@CommandHandler(UpdateStockCommand)
export class UpdateStockHandler implements ICommandHandler<UpdateStockCommand> {
  private readonly logger = new Logger(UpdateStockHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly listingRepo: MongoListingRepository,
    private readonly inventoryLogRepo: MongoInventoryLogRepository,
  ) {}

  async execute(command: UpdateStockCommand) {
    const { listingId, userId, change, reason } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const listing = await this.listingRepo.findById(listingId);
    if (!listing || listing.vendorId !== vendor.id) throw new NotFoundException('Listing not found');

    const newStock = Math.max(0, listing.stock + change);
    const updated = await this.listingRepo.update(listingId, { stock: newStock });

    try {
      await this.inventoryLogRepo.create({
        vendorId: vendor.id,
        listingId,
        quantity: change,
        type: 'ADJUSTMENT',
        reason: reason || undefined,
        referenceType: 'MANUAL_ADJUSTMENT',
      });

      this.logger.log(
        `Stock updated: listing=${listingId}, change=${change}, reason=${reason}, newStock=${newStock}`
      );
    } catch (e: unknown) {
      this.logger.warn(`InventoryLog yazılamadı: ${(e as Error).message}`);
    }

    return { success: true, data: updated };
  }
}