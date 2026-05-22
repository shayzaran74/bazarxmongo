import { Query } from '@barterborsa/shared-core';
import { AdSlotType } from '../../domain/enums/advertising.enums';

export interface AdSlotContext {
  keywords?: string[];
}

export class GetAdsForSlotQuery extends Query {
  constructor(
    public readonly slotType: AdSlotType,
    public readonly platform: string = 'BAZARX',
    public readonly context: AdSlotContext = {},
  ) { super(); }
}
