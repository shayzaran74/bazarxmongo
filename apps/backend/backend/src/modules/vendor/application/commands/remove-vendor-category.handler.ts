import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveVendorCategoryCommand } from './remove-vendor-category.command';
import { MongoVendorCategoryRepository } from '../../infrastructure/persistence/mongo-vendor-category.repository';

@CommandHandler(RemoveVendorCategoryCommand)
export class RemoveVendorCategoryHandler
  implements ICommandHandler<RemoveVendorCategoryCommand> {

  constructor(private readonly vendorCategoryRepo: MongoVendorCategoryRepository) {}

  async execute(command: RemoveVendorCategoryCommand) {
    const { vendorId, categoryId } = command;
    await this.vendorCategoryRepo.delete(vendorId, categoryId);
    return { success: true };
  }
}
