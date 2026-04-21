import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RemoveCartItemCommand } from './remove-cart-item.command';

@CommandHandler(RemoveCartItemCommand)
export class RemoveCartItemHandler
  implements ICommandHandler<RemoveCartItemCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveCartItemCommand) {
    await this.prisma.cartItem.delete({ where: { id: command.itemId } });
    return { success: true, message: 'Ürün sepetten silindi' };
  }
}
