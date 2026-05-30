// apps/backend/src/modules/barter/application/commands/create-trade-offer.command.ts

import { Command } from '@barterborsa/shared-core';

export interface TradeOfferItemInput {
  quantity?: number;
  estimatedValue?: number;
  listingId?: string;
  surplusItemId?: string;
}

export interface CreateTradeOfferInput {
  toCompanyId?: string;
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
  type?: string;
  barterAmount?: number;
  receiverId?: string;
}

export class CreateTradeOfferCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly body: CreateTradeOfferInput,
  ) {
    super();
  }
}
