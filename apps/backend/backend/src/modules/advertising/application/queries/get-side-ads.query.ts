import { Query } from '@barterborsa/shared-core';
import { AdSlotType } from '../../domain/enums/advertising.enums';

export class GetSideAdsQuery extends Query {
  constructor(public readonly ecosystem: string = 'BAZARX') { super(); }
}
