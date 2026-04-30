import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { DeleteBrandCommand } from './delete-brand.command';

@CommandHandler(DeleteBrandCommand)
export class DeleteBrandHandler implements ICommandHandler<DeleteBrandCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteBrandCommand) {
    const { userId, brandId } = command;

    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    // Yalnızca PENDING durumdaki kendi markasını geri çekebilir
    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, vendorId: vendor.id, status: 'PENDING' },
    });
    if (!brand) throw new NotFoundException('Silinebilir başvuru bulunamadı');

    await this.prisma.brand.delete({ where: { id: brandId } });
    return { success: true };
  }
}
