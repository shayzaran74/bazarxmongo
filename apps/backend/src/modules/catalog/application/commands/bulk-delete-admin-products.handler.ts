import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { BulkDeleteAdminProductsCommand }
  from './bulk-delete-admin-products.command';

@CommandHandler(BulkDeleteAdminProductsCommand)
export class BulkDeleteAdminProductsHandler
  implements ICommandHandler<BulkDeleteAdminProductsCommand> {
  private readonly logger = new Logger(BulkDeleteAdminProductsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BulkDeleteAdminProductsCommand) {
    const { ids } = command;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('Silinecek ürün ID listesi boş veya geçersiz');
    }

    let successCount = 0;
    const failedIds: string[] = [];

    for (const id of ids) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.listing.deleteMany({ where: { catalogProductId: id } });
          await tx.catalogProduct.delete({ where: { id } });
        });
        successCount++;
      } catch (e: any) {
        this.logger.warn(`Ürün silinemedi: ${id} — ${e.message}`);
        failedIds.push(id);
      }
    }

    const message = failedIds.length > 0
      ? `${successCount} ürün silindi. ${failedIds.length} ürün silinemedi (sipariş geçmişi). Lütfen pasife alın.`
      : `${successCount} ürün başarıyla silindi.`;

    return {
      success: true,
      message,
      details: { successCount, failedCount: failedIds.length }
    };
  }
}
