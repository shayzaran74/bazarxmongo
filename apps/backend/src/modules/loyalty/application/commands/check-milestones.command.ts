import { Command } from '@barterborsa/shared-core';
import { XpSourceType } from '../../domain/enums/loyalty.enums';

export class CheckMilestonesCommand extends Command {
  constructor(public readonly userId: string, public readonly orderAmount?: number) { super(); }
}
