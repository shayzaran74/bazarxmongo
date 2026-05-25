// apps/backend/src/modules/advertising/domain/repositories/ad-campaign.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { AdCampaign } from '../entities/ad-campaign.entity';
import { AdSlotType } from '../enums/advertising.enums';

export interface IAdCampaignRepository extends IRepository<AdCampaign> {
  findActiveBySlot(slotType: AdSlotType, platform: string): Promise<AdCampaign[]>;
  findByVendorId(vendorId: string): Promise<AdCampaign[]>;
  findActiveByListingAndSlot(listingId: string, slotType: string): Promise<AdCampaign | null>;
  updateMetric(campaignId: string, type: 'impression' | 'click', cost: number): Promise<void>;
}
