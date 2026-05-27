import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { CreateBannerCommand } from './create-banner.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorBannerRepository } from '../../infrastructure/persistence/mongo-vendor-banner.repository';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(CreateBannerCommand)
export class CreateBannerHandler implements ICommandHandler<CreateBannerCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly bannerRepo: MongoVendorBannerRepository,
  ) {}

  async execute(command: CreateBannerCommand) {
    const { userId, dto } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const banner = await this.bannerRepo.create({
      vendorId:        vendor.id,
      imageUrl:        dto.imageUrl,
      linkUrl:         dto.linkUrl,
      type:            dto.type ?? 1,
      template:        dto.template ?? 'A',
      order:           dto.order ?? 0,
      targetCities:    dto.targetCities ?? [],
      targetDistricts: dto.targetDistricts ?? [],
      status:          'PENDING',
      isActive:        false,
    });
    return { success: true, data: banner };
  }
}
