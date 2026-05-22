// apps/backend/src/modules/loyalty/application/event-handlers/loyalty-event.handlers.ts

import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { XpCalculatorService } from '../services/xp-calculator.service';
import { EarnXpCommand } from '../commands/earn-xp.command';
import { CheckMilestonesCommand } from '../commands/check-milestones.command';
import { XpSourceType } from '../../domain/enums/loyalty.enums';

interface OrderCompletedEvent {
  type: 'order.completed'
  userId: string
  totalAmount: number
  isFirstOrder: boolean
  orderId: string
}

interface SwapCompletedEvent {
  type: 'swap.completed'
  userId: string
  tradeValue: number
  swapId: string
}

interface UserLoggedInEvent {
  type: 'user.logged_in'
  userId: string
}

type LoyaltyEvent = OrderCompletedEvent | SwapCompletedEvent | UserLoggedInEvent

@EventsHandler()
export class LoyaltyIntegrationEventHandler implements IEventHandler<LoyaltyEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly xpCalc: XpCalculatorService
  ) {}

  async handle(event: LoyaltyEvent) {
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
