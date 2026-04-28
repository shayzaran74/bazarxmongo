// apps/backend/src/modules/advertising/application/queries/advertising-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdsForSlotQuery } from './get-ads-for-slot.query';
import { GetVendorCampaignsQuery } from './get-vendor-campaigns.query';
import { GetAdsAdminQuery } from './get-ads-admin.query';
import { GetSideAdsQuery } from './get-side-ads.query';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { ISideAdRepository } from '../../domain/repositories/ad-misc.repositories.interface';
import { AdAuctionService } from '../services/ad-auction.service';

@QueryHandler(GetAdsForSlotQuery)
export class GetAdsForSlotHandler implements IQueryHandler<GetAdsForSlotQuery> {
  constructor(private readonly auctionService: AdAuctionService) {}
  async execute(query: GetAdsForSlotQuery) {
    return this.auctionService.getAdsForSlot(query.slotType, query.platform, query.context);
  }
}

@QueryHandler(GetVendorCampaignsQuery)
export class GetVendorCampaignsHandler implements IQueryHandler<GetVendorCampaignsQuery> {
  constructor(@Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository) {}
  async execute(query: GetVendorCampaignsQuery) {
    return this.repository.findByVendorId(query.vendorId);
  }
}

@QueryHandler(GetAdsAdminQuery)
export class GetAdsAdminHandler implements IQueryHandler<GetAdsAdminQuery> {
  constructor(@Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository) {}
  async execute() {
    return this.repository.findAll();
  }
}

@QueryHandler(GetSideAdsQuery)
export class GetSideAdsHandler implements IQueryHandler<GetSideAdsQuery> {
  constructor(@Inject('ISideAdRepository') private readonly repository: ISideAdRepository) {}
  async execute(query: GetSideAdsQuery) {
    const ads = await this.repository.findAllActive();
    return ads.filter(ad =>
      ad.getProps().ecosystems.includes('GLOBAL') ||
      ad.getProps().ecosystems.includes(query.ecosystem.toUpperCase())
    );
  }
}
