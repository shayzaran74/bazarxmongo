// apps/backend/src/modules/barter/application/commands/reject-surplus.command.ts

import { Command } from '@barterborsa/shared-core';

export class RejectSurplusCommand extends Command {
  constructor(
    public readonly surplusId:       string,
    public readonly adminId:         string,
    public readonly rejectionReason: string,
  ) {
    super();
  }
}
