import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { DeleteAdminVendorCommand } from './delete-admin-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';

@CommandHandler(DeleteAdminVendorCommand)
export class DeleteAdminVendorHandler implements ICommandHandler<DeleteAdminVendorCommand> {
  private readonly logger = new Logger(DeleteAdminVendorHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
  ) {}

  async execute(command: DeleteAdminVendorCommand): Promise<{ success: boolean }> {
    this.logger.log(`Deleting vendor (admin operation) - VendorID: ${command.vendorId}`);
    
    const vendor = await this.vendorRepo.findById(command.vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    await this.vendorRepo.delete(command.vendorId);

    this.logger.log(`Vendor ${command.vendorId} deleted by admin ${command.adminId}`);
    return { success: true };
  }
}
