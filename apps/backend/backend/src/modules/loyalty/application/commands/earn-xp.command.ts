import { Command } from '@barterborsa/shared-core';
import { XpSourceType } from '../../domain/enums/loyalty.enums';

export class EarnXpCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly sourceType: XpSourceType,
    public readonly referenceId?: string,
    public readonly referenceType?: string,
    public readonly metadata?: Record<string, unknown>
  ) { super(); }
}
