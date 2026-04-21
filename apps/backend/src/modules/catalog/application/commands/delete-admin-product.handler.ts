import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { DeleteAdminProductCommand } from './delete-admin-product.command';

@CommandHandler(DeleteAdminProductCommand)
export class DeleteAdminProductHandler
  implements ICommandHandler<DeleteAdminProductCommand> {
  private readonly logger = new Logger(DeleteAdminProductHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteAdminProductCommand) {
    const { productId } = command;

    const existing = await this.prisma.catalogProduct.findUnique({
      where: { id: productId }
    });
    if (!existing) throw new NotFoundException('Ürün bulunamadı');

    await this.prisma.$transaction(async (tx) => {
      await tx.listing.deleteMany({ where: { catalogProductId: productId } });
      await tx.catalogProduct.delete({ where: { id: productId } });
    });

    return { success: true, message: 'Ürün başarıyla silindi' };
  }
}
