import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateAdminVendorCommand } from './update-admin-vendor.command';

@CommandHandler(UpdateAdminVendorCommand)
export class UpdateAdminVendorHandler
  implements ICommandHandler<UpdateAdminVendorCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateAdminVendorCommand) {
    const { vendorId, data } = command;

    const existing = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });
    if (!existing) throw new NotFoundException('Vendor not found');

    const { isFeatured, storeName, description,
            city, district, ...vendorFields } = data;

    const profileFields: any = {};
    if (isFeatured !== undefined) profileFields.isFeatured = isFeatured;
    if (storeName !== undefined) profileFields.storeName = storeName;
    if (description !== undefined) profileFields.description = description;
    if (city !== undefined) profileFields.city = city;
    if (district !== undefined) profileFields.district = district;

    if (Object.keys(profileFields).length > 0) {
      await this.prisma.vendorProfile.update({
        where: { vendorId },
        data: profileFields
      });
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: vendorFields,
      include: { profile: true }
    });
  }
}
