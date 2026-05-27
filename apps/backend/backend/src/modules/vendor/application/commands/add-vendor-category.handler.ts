import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddVendorCategoryCommand } from './add-vendor-category.command';
import { MongoVendorCategoryRepository } from '../../infrastructure/persistence/mongo-vendor-category.repository';

@CommandHandler(AddVendorCategoryCommand)
export class AddVendorCategoryHandler
  implements ICommandHandler<AddVendorCategoryCommand> {

  constructor(private readonly vendorCategoryRepo: MongoVendorCategoryRepository) {}

  async execute(command: AddVendorCategoryCommand) {
    const { vendorId, categoryId } = command;
    await this.vendorCategoryRepo.create({ vendorId, categoryId });
    return { success: true };
  }
}
