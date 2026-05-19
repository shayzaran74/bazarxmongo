import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClearCartCommand } from './clear-cart.command';
import { MongoCartRepository } from '../../infrastructure/persistence/mongo-cart.repository';

@CommandHandler(ClearCartCommand)
export class ClearCartHandler
  implements ICommandHandler<ClearCartCommand> {

  constructor(private readonly cartRepo: MongoCartRepository) {}

  async execute(command: ClearCartCommand) {
    await this.cartRepo.deleteByUserId(command.userId);
    return { success: true, message: 'Sepet temizlendi' };
  }
}
