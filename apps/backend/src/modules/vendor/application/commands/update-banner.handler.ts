import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateBannerCommand } from './update-banner.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorBannerRepository } from '../../infrastructure/persistence/mongo-vendor-banner.repository';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(UpdateBannerCommand)
export class UpdateBannerHandler implements ICommandHandler<UpdateBannerCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly bannerRepo: MongoVendorBannerRepository,
  ) {}

  async execute(command: UpdateBannerCommand) {
    const { userId, bannerId, dto } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const existing = await this.bannerRepo.findById(bannerId);
    if (!existing || existing.vendorId !== vendor.id) throw new NotFoundException('Banner bulunamadı');

    const updateData: Partial<{
      imageUrl: string;
      linkUrl: string;
      type: number;
      template: string;
      order: number;
      targetCities: string[];
      targetDistricts: string[];
    }> = {};
    if (dto.imageUrl        !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.linkUrl         !== undefined) updateData.linkUrl = dto.linkUrl;
    if (dto.type            !== undefined) updateData.type = dto.type;
    if (dto.template        !== undefined) updateData.template = dto.template;
    if (dto.order           !== undefined) updateData.order = dto.order;
    if (dto.targetCities    !== undefined) updateData.targetCities = dto.targetCities;
    if (dto.targetDistricts !== undefined) updateData.targetDistricts = dto.targetDistricts;

    const updated = await this.bannerRepo.update(bannerId, updateData);
    return { success: true, data: updated };
  }
}
