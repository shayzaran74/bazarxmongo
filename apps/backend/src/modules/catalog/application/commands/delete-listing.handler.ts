// apps/backend/src/modules/catalog/application/commands/delete-listing.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteListingCommand } from './delete-listing.command';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteListingCommand)
export class DeleteListingHandler implements ICommandHandler<DeleteListingCommand> {
  async execute(command: DeleteListingCommand) {
    const { userId, userRole, id } = command;

    const listing = await Listing.findOne({ id }).exec();
    if (!listing) throw new NotFoundException('İlan bulunamadı');

    const isAdmin = Array.isArray(userRole)
      ? userRole.includes('ADMIN')
      : userRole === 'ADMIN';

    if (!isAdmin) {
      const vendor = await Vendor.findOne({ userId }).exec();
      if (!vendor || (listing as any).vendorId !== vendor.id) {
        throw new ForbiddenException('Bu ilanı silme yetkiniz yok');
      }
    }

    await Listing.deleteOne({ id }).exec();
    return { success: true };
  }
}
