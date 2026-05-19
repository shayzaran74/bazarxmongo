// apps/backend/src/modules/catalog/application/commands/delete-admin-product.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { DeleteAdminProductCommand } from './delete-admin-product.command';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';

@CommandHandler(DeleteAdminProductCommand)
export class DeleteAdminProductHandler implements ICommandHandler<DeleteAdminProductCommand> {
  private readonly logger = new Logger(DeleteAdminProductHandler.name);

  async execute(command: DeleteAdminProductCommand) {
    const { productId } = command;

    const existing = await CatalogProduct.findOne({ id: productId }).exec();
    if (!existing) throw new NotFoundException('Ürün bulunamadı');

    await Listing.deleteMany({ catalogProductId: productId }).exec();
    await CatalogProduct.deleteOne({ id: productId }).exec();

    return { success: true, message: 'Ürün başarıyla silindi' };
  }
}
