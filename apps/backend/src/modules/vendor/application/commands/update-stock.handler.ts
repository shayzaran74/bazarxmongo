import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateStockCommand } from './update-stock.command';

@CommandHandler(UpdateStockCommand)
export class UpdateStockHandler implements ICommandHandler<UpdateStockCommand> {
  private readonly logger = new Logger(UpdateStockHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateStockCommand) {
    const { listingId, userId, change, reason } = command;

    // 1. Vendor lookup
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    // 2. Listing ownership check
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, vendorId: vendor.id }
    });
    if (!listing) throw new NotFoundException('Listing not found');

    // 3. Stock güncelle
    const newStock = Math.max(0, listing.stock + change);
    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: { stock: newStock }
    });

    // 4. InventoryLog kaydı (Schema'ya tam uyumlu mapping)
    try {
      await this.prisma.inventoryLog.create({
        data: {
          vendorId: vendor.id,
          listingId: listingId,
          quantity: change,
          type: change > 0 ? 'MANUAL_IN' : 'MANUAL_OUT',
          referenceType: 'MANUAL_ADJUSTMENT',
          referenceId: null,
          // Not: 'reason' field'ı schema'da olmadığı için metadata/log bazlı tutuluyor
        }
      });
      
      this.logger.log(
        `Stock updated: listing=${listingId}, change=${change}, reason=${reason}, newStock=${newStock}`
      );
    } catch (e: any) {
      // Log hatası işlemin kendisini (stock update) iptal etmemeli
      this.logger.warn(`InventoryLog yazılamadı: ${e.message}`);
    }

    return { success: true, data: updated };
  }
}
