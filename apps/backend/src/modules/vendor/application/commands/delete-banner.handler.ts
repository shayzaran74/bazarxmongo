import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { DeleteBannerCommand } from './delete-banner.command';

@CommandHandler(DeleteBannerCommand)
export class DeleteBannerHandler implements ICommandHandler<DeleteBannerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteBannerCommand) {
    const { userId, bannerId } = command;

    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const existing = await this.prisma.vendorBanner.findFirst({
      where: { id: bannerId, vendorId: vendor.id },
    });
    if (!existing) throw new NotFoundException('Banner bulunamadı');

    await this.prisma.vendorBanner.delete({ where: { id: bannerId } });
    return { success: true };
  }
}
