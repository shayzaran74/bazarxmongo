import { Command } from '@barterborsa/shared-core';
import { XpSourceType } from '../../domain/enums/loyalty.enums';

export class SpendXpCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly cartTotal: number,
    public readonly vendorTier?: string,
    public readonly loyaltyTier?: string
  ) { super(); }
}
