import { Command } from '@barterborsa/shared-core';

export class ProcessWalletRequestCommand extends Command {
  constructor(
    public readonly requestId: string,
    public readonly action: 'approve' | 'reject',
    public readonly adminId: string,
    public readonly reason?: string,
  ) {
    super();
  }
}
