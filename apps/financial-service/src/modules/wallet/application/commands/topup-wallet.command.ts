// apps/financial-service/src/modules/wallet/application/commands/topup-wallet.command.ts

import { Command } from '@barterborsa/shared-core';
import { Decimal } from 'decimal.js';

export class TopUpWalletCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly amount: Decimal,
    public readonly currency: string,
    public readonly idempotencyKey: string,
  ) {
    super();
  }
}
