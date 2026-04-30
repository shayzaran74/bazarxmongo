import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateBannerCommand } from './create-banner.command';

@CommandHandler(CreateBannerCommand)
export class CreateBannerHandler implements ICommandHandler<CreateBannerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateBannerCommand) {
    const { userId, dto } = command;

    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const banner = await this.prisma.vendorBanner.create({
      data: {
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
      },
    });
    return { success: true, data: banner };
  }
}
