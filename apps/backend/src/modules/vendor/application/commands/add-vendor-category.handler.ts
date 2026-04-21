import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AddVendorCategoryCommand } from './add-vendor-category.command';

@CommandHandler(AddVendorCategoryCommand)
export class AddVendorCategoryHandler
  implements ICommandHandler<AddVendorCategoryCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddVendorCategoryCommand) {
    const { vendorId, categoryId } = command;
    return this.prisma.vendorCategory.create({
      data: { vendorId, categoryId }
    });
  }
}
