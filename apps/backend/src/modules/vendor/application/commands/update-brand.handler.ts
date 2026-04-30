import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateBrandCommand } from './update-brand.command';

@CommandHandler(UpdateBrandCommand)
export class UpdateBrandHandler implements ICommandHandler<UpdateBrandCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateBrandCommand) {
    const { userId, brandId, dto } = command;

    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    // Sahiplik kontrolü: yalnızca kendi markasını güncelleyebilir
    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, vendorId: vendor.id },
    });
    if (!brand) throw new NotFoundException('Marka bulunamadı');

    const updated = await this.prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.aliases !== undefined && { aliases: dto.aliases }),
      },
    });
    return { success: true, data: updated };
  }
}
