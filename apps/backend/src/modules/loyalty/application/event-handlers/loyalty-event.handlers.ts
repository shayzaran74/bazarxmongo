// apps/backend/src/modules/loyalty/application/event-handlers/loyalty-event.handlers.ts

import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { XpCalculatorService } from '../services/xp-calculator.service';
import { EarnXpCommand, CheckMilestonesCommand } from '../commands/loyalty.commands';
import { XpSourceType } from '../../domain/enums/loyalty.enums';

// Bunlar genelde Integration Event'ler olacak ama burada basitlik için temsil ediliyor
@EventsHandler() // Gerçek event tipleri eklenecek (örn: OrderCompletedIntegrationEvent)
export class LoyaltyIntegrationEventHandler implements IEventHandler<any> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly xpCalc: XpCalculatorService
  ) {}

  async handle(event: any) {
    if (event.type === 'order.completed') {
      const xp = this.xpCalc.calculateOrderXp(event.totalAmount, event.isFirstOrder);
      await this.commandBus.execute(new EarnXpCommand(event.userId, xp, XpSourceType.ORDER, event.orderId));
      await this.commandBus.execute(new CheckMilestonesCommand(event.userId, event.totalAmount));
    }

    if (event.type === 'swap.completed') {
      const xp = this.xpCalc.calculateBarterXp(event.tradeValue);
      await this.commandBus.execute(new EarnXpCommand(event.userId, xp, XpSourceType.BARTER, event.swapId));
    }

    if (event.type === 'user.logged_in') {
      const xp = this.xpCalc.calculateLoginBonus();
      await this.commandBus.execute(new EarnXpCommand(event.userId, xp, XpSourceType.LOGIN));
    }
  }
}
