// apps/backend/src/modules/barter/application/commands/reactivate-surplus.command.ts

import { Command } from '@barterborsa/shared-core';

export class ReactivateSurplusCommand extends Command {
  constructor(
    public readonly surplusId:   string,
    public readonly userId:      string,
    public readonly newQuantity: number,
  ) {
    super();
  }
}
