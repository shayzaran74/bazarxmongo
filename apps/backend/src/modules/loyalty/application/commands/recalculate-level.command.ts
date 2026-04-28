import { Command } from '@barterborsa/shared-core';
import { XpSourceType } from '../../domain/enums/loyalty.enums';

export class RecalculateLevelCommand extends Command {
  constructor(public readonly userId: string) { super(); }
}
