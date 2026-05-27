import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveCartItemCommand } from './remove-cart-item.command';
import { MongoCartRepository } from '../../infrastructure/persistence/mongo-cart.repository';

@CommandHandler(RemoveCartItemCommand)
export class RemoveCartItemHandler
  implements ICommandHandler<RemoveCartItemCommand> {

  constructor(private readonly cartRepo: MongoCartRepository) {}

  async execute(command: RemoveCartItemCommand) {
    const { userId, itemId } = command;

    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart) return { success: true, message: 'Ürün sepetten silindi' };

    await this.cartRepo.removeItem(itemId);
    return { success: true, message: 'Ürün sepetten silindi' };
  }
}
