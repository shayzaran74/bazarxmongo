import { Command } from '@barterborsa/shared-core';

export class ProcessWithdrawalCommand extends Command {
  constructor(
    public readonly withdrawalId: string,
    public readonly action: 'approve' | 'reject',
    public readonly adminId: string,
    public readonly reason?: string,
  ) {
    super();
  }
}
