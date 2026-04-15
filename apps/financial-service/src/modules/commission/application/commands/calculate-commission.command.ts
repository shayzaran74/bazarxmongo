// apps/financial-service/src/modules/commission/application/commands/calculate-commission.command.ts

import { Command } from '@barterborsa/shared-core';
import { Decimal } from 'decimal.js';

export class CalculateCommissionCommand extends Command {
  constructor(
    public readonly vendorId: string,
    public readonly vendorTier: string,
    public readonly amount: Decimal,
    public readonly type: 'CASH' | 'BARTER',
    public readonly referenceId: string,
    public readonly referenceType: 'ORDER' | 'TRADE',
  ) {
    super();
  }
}
