import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateBannerCommand } from './update-banner.command';

@CommandHandler(UpdateBannerCommand)
export class UpdateBannerHandler implements ICommandHandler<UpdateBannerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateBannerCommand) {
    const { userId, bannerId, dto } = command;

    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    // Sahiplik kontrolü
    const existing = await this.prisma.vendorBanner.findFirst({
      where: { id: bannerId, vendorId: vendor.id },
    });
    if (!existing) throw new NotFoundException('Banner bulunamadı');

    const updated = await this.prisma.vendorBanner.update({
      where: { id: bannerId },
      data: {
        ...(dto.imageUrl        !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.linkUrl         !== undefined && { linkUrl: dto.linkUrl }),
        ...(dto.type            !== undefined && { type: dto.type }),
        ...(dto.template        !== undefined && { template: dto.template }),
        ...(dto.order           !== undefined && { order: dto.order }),
        ...(dto.targetCities    !== undefined && { targetCities: dto.targetCities }),
        ...(dto.targetDistricts !== undefined && { targetDistricts: dto.targetDistricts }),
      },
    });
    return { success: true, data: updated };
  }
}
