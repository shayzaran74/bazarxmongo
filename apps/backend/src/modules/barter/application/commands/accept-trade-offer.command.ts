// apps/backend/src/modules/barter/application/commands/accept-trade-offer.command.ts

import { Command } from '@barterborsa/shared-core';

export class AcceptTradeOfferCommand extends Command {
  constructor(
    public readonly offerId: string,
    public readonly actorId: string = 'UNKNOWN',
    // Kabul eden tarafın kendi komisyonuna uygulamak istediği XP (opt-in, §3 — max %50, grup oranıyla birleşemez)
    public readonly xpToApply: number = 0,
  ) {
    super();
  }
}
