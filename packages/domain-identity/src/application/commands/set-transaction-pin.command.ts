import { Command } from '@barterborsa/shared-core';

export class SetTransactionPinCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly pin: string
  ) {
    super();
  }
}
