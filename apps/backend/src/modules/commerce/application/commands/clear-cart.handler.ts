import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ClearCartCommand } from './clear-cart.command';

@CommandHandler(ClearCartCommand)
export class ClearCartHandler
  implements ICommandHandler<ClearCartCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ClearCartCommand) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: command.userId }
    });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true, message: 'Sepet temizlendi' };
  }
}
