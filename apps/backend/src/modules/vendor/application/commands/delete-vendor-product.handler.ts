import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { DeleteVendorProductCommand } from './delete-vendor-product.command';

@CommandHandler(DeleteVendorProductCommand)
export class DeleteVendorProductHandler
  implements ICommandHandler<DeleteVendorProductCommand> {
  private readonly logger = new Logger(DeleteVendorProductHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteVendorProductCommand) {
    const { userId, listingId } = command;
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const existing = await this.prisma.listing.findUnique({
      where: { id: listingId }
    });
    if (!existing || existing.vendorId !== vendor.id) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.listing.delete({ where: { id: listingId } });
    return { success: true };
  }
}
