// apps/backend/src/modules/barter/application/commands/accept-trade-offer.command.ts

import { Command } from '@barterborsa/shared-core';

export class AcceptTradeOfferCommand extends Command {
  constructor(public readonly offerId: string) {
    super();
  }
}
