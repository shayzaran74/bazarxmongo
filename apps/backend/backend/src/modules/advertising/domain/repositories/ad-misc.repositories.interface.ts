// apps/backend/src/modules/advertising/domain/repositories/ad-misc.repositories.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { AdSlot, AdCampaignMetric, SideAd } from '../entities/ad-misc.entities';
import { AdSlotType } from '../enums/advertising.enums';

export interface IAdSlotRepository extends IRepository<AdSlot> {
  findByType(slotType: AdSlotType, platform: string): Promise<AdSlot | null>;
}

export interface IAdCampaignMetricRepository extends IRepository<AdCampaignMetric> {
  findByCampaignId(campaignId: string, startDate: Date, endDate: Date): Promise<AdCampaignMetric[]>;
}

export interface ISideAdRepository extends IRepository<SideAd> {
  findAllActive(): Promise<SideAd[]>;
}
