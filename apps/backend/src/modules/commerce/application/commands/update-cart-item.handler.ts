import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCartItemCommand } from './update-cart-item.command';
import { MongoCartRepository } from '../../infrastructure/persistence/mongo-cart.repository';

@CommandHandler(UpdateCartItemCommand)
export class UpdateCartItemHandler
  implements ICommandHandler<UpdateCartItemCommand> {

  constructor(private readonly cartRepo: MongoCartRepository) {}

  async execute(command: UpdateCartItemCommand) {
    const { userId, itemId, quantity } = command;

    if (quantity <= 0) {
      await this.cartRepo.removeItem(itemId);
    } else {
      await this.cartRepo.updateItemQuantity(itemId, quantity);
    }

    return { success: true, message: 'Sepet güncellendi' };
  }
}
