// apps/backend/src/modules/auction/application/commands/draw-lottery.command.ts

import { Command } from '@barterborsa/shared-core';

export class DrawLotteryCommand extends Command {
  constructor(public readonly lotteryId: string) {
    super();
  }
}
