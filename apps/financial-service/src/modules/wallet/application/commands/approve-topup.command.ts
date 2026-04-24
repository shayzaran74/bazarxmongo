import { Command } from '@barterborsa/shared-core';

export class ApproveTopUpCommand extends Command {
  constructor(
    public readonly requestId: string,
    public readonly adminId: string,
  ) {
    super();
  }
}
