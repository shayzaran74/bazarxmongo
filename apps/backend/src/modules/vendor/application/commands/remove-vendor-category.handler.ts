import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RemoveVendorCategoryCommand } from './remove-vendor-category.command';

@CommandHandler(RemoveVendorCategoryCommand)
export class RemoveVendorCategoryHandler
  implements ICommandHandler<RemoveVendorCategoryCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveVendorCategoryCommand) {
    const { vendorId, categoryId } = command;
    await this.prisma.vendorCategory.delete({
      where: { vendorId_categoryId: { vendorId, categoryId } }
    });
    return { success: true };
  }
}
