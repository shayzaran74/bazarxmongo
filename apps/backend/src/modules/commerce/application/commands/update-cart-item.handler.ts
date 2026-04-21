import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateCartItemCommand } from './update-cart-item.command';

@CommandHandler(UpdateCartItemCommand)
export class UpdateCartItemHandler
  implements ICommandHandler<UpdateCartItemCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateCartItemCommand) {
    const { itemId, quantity } = command;

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });
    }

    return { success: true, message: 'Sepet güncellendi' };
  }
}
