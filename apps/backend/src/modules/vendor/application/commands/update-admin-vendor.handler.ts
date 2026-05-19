import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateAdminVendorCommand } from './update-admin-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoVendorProfileRepository } from '../../infrastructure/persistence/mongo-vendor-profile.repository';

@CommandHandler(UpdateAdminVendorCommand)
export class UpdateAdminVendorHandler
  implements ICommandHandler<UpdateAdminVendorCommand> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly profileRepo: MongoVendorProfileRepository,
  ) {}

  async execute(command: UpdateAdminVendorCommand) {
    const { vendorId, data } = command;

    const existing = await this.vendorRepo.findById(vendorId);
    if (!existing) throw new NotFoundException('Vendor not found');

    const { isFeatured, storeName, description, city, district, vendorType, ...vendorFields } = data;

    const profileFields: Record<string, unknown> = {};
    if (isFeatured !== undefined) profileFields.isFeatured = isFeatured;
    if (storeName !== undefined) profileFields.storeName = storeName;
    if (description !== undefined) profileFields.description = description;
    if (city !== undefined) profileFields.city = city;
    if (district !== undefined) profileFields.district = district;

    if (Object.keys(profileFields).length > 0) {
      await this.profileRepo.updateByVendorId(vendorId, profileFields as Parameters<typeof this.profileRepo.updateByVendorId>[1]);
    }

    const vendorUpdateData: Record<string, unknown> = { ...vendorFields };
    if (vendorType) vendorUpdateData.vendorType = vendorType;

    const updated = await this.vendorRepo.update(vendorId, vendorUpdateData as { status?: string });
    return updated;
  }
}
