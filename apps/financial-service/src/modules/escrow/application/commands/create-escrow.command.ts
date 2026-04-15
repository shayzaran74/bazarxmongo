// apps/financial-service/src/modules/escrow/application/commands/create-escrow.command.ts

import { Command } from '@barterborsa/shared-core';
import { Decimal } from 'decimal.js';

export class CreateEscrowCommand extends Command {
  constructor(
    public readonly orderId: string,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly amount: Decimal,
  ) {
    super();
  }
}
