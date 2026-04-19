// apps/backend/src/modules/advertising/application/queries/advertising-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as qry from './advertising.queries';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { ISideAdRepository } from '../../domain/repositories/ad-misc.repositories.interface';
import { AdAuctionService } from '../services/ad-auction.service';

@QueryHandler(qry.GetAdsForSlotQuery)
export class GetAdsForSlotHandler implements IQueryHandler<qry.GetAdsForSlotQuery> {
  constructor(private readonly auctionService: AdAuctionService) {}
  async execute(query: qry.GetAdsForSlotQuery) {
    return this.auctionService.getAdsForSlot(query.slotType, query.platform, query.context);
  }
}

@QueryHandler(qry.GetVendorCampaignsQuery)
export class GetVendorCampaignsHandler implements IQueryHandler<qry.GetVendorCampaignsQuery> {
  constructor(@Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository) {}
  async execute(query: qry.GetVendorCampaignsQuery) {
    return this.repository.findByVendorId(query.vendorId);
  }
}

@QueryHandler(qry.GetAdsAdminQuery)
export class GetAdsAdminHandler implements IQueryHandler<qry.GetAdsAdminQuery> {
  constructor(@Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository) {}
  async execute() {
    return this.repository.findAll();
  }
}

@QueryHandler(qry.GetSideAdsQuery)
export class GetSideAdsHandler implements IQueryHandler<qry.GetSideAdsQuery> {
  constructor(@Inject('ISideAdRepository') private readonly repository: ISideAdRepository) {}
  async execute(query: qry.GetSideAdsQuery) {
    // In current repo, findAllActive takes ecosystem via filter if needed
    // or just returns all active and we filter here.
    const ads = await this.repository.findAllActive();
    return ads.filter(ad => 
      ad.getProps().ecosystems.includes('GLOBAL') || 
      ad.getProps().ecosystems.includes(query.ecosystem.toUpperCase())
    );
  }
}
