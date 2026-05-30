// apps/backend/src/modules/barter/application/commands/counter-trade-offer.command.ts

import { Command } from '@barterborsa/shared-core';
import { TradeOfferItemInput } from './create-trade-offer.command';

export interface CounterTradeOfferInput {
  surplusItemId?: string;
  offeredItemId?: string;
  offeredItems?: TradeOfferItemInput[];
  requestedItems?: TradeOfferItemInput[];
  cashAmount?: number;
  cashDirection?: string;
  currency?: string;
  expiresInDays?: number;
  message?: string;
  note?: string;
  barterAmount?: number;
}

export class CounterTradeOfferCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly originalOfferId: string,
    public readonly body: CounterTradeOfferInput,
  ) {
    super();
  }
}
