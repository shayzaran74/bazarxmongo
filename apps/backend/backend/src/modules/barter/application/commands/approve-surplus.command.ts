// apps/backend/src/modules/barter/application/commands/approve-surplus.command.ts

import { Command } from '@barterborsa/shared-core';

export class ApproveSurplusCommand extends Command {
  constructor(
    public readonly surplusId: string,
    public readonly adminId:   string,
  ) {
    super();
  }
}
