// apps/backend/src/modules/advertising/application/queries/advertising.queries.ts

import { Query } from '@barterborsa/shared-core';
import { AdSlotType } from '../../domain/enums/advertising.enums';

export class GetAdsForSlotQuery extends Query {
  constructor(
    public readonly slotType: AdSlotType, 
    public readonly platform: string = 'BAZARX',
    public readonly context: any = {}
  ) { super(); }
}

export class GetVendorCampaignsQuery extends Query {
  constructor(public readonly vendorId: string) { super(); }
}

export class GetAdsAdminQuery extends Query {
  constructor() { super(); }
}

export class GetSideAdsQuery extends Query {
  constructor(public readonly ecosystem: string = 'BAZARX') { super(); }
}
