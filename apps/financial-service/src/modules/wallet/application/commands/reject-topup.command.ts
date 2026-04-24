import { Command } from '@barterborsa/shared-core';

export class RejectTopUpCommand extends Command {
  constructor(
    public readonly requestId: string,
    public readonly adminId: string,
    public readonly reason: string,
  ) {
    super();
  }
}
