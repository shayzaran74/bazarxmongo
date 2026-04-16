// apps/backend/src/modules/loyalty/application/commands/loyalty.commands.ts

import { Command } from '@barterborsa/shared-core';
import { XpSourceType } from '../../domain/enums/loyalty.enums';

export class EarnXpCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly sourceType: XpSourceType,
    public readonly referenceId?: string,
    public readonly referenceType?: string,
    public readonly metadata?: any
  ) { super(); }
}

export class SpendXpCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly cartTotal: number,
    public readonly vendorTier?: string,
    public readonly loyaltyTier?: string
  ) { super(); }
}

export class RecalculateLevelCommand extends Command {
  constructor(public readonly userId: string) { super(); }
}

export class CheckMilestonesCommand extends Command {
  constructor(public readonly userId: string, public readonly orderAmount?: number) { super(); }
}

export class ExpireXpBatchesCommand extends Command {
  constructor() { super(); }
}
