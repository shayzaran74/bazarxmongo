import { Query } from '@barterborsa/shared-core';
import { AdSlotType } from '../../domain/enums/advertising.enums';

export class GetVendorCampaignsQuery extends Query {
  constructor(public readonly vendorId: string) { super(); }
}
