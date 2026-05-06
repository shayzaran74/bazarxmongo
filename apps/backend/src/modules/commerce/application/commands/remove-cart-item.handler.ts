import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RemoveCartItemCommand } from './remove-cart-item.command';

@CommandHandler(RemoveCartItemCommand)
export class RemoveCartItemHandler
  implements ICommandHandler<RemoveCartItemCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveCartItemCommand) {
    const { userId, itemId } = command;
    
    await this.prisma.cartItem.delete({ 
      where: { id: itemId, cart: { userId } } 
    });

    return { success: true, message: 'Ürün sepetten silindi' };
  }
}
