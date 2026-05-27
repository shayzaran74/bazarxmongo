// apps/backend/src/modules/auction/application/commands/place-bid.command.ts

import { Command } from '@barterborsa/shared-core';

export class PlaceBidCommand extends Command {
  constructor(
    public readonly auctionId: string,
    public readonly userId: string,
    public readonly amount: number | string
  ) {
    super();
  }
}
