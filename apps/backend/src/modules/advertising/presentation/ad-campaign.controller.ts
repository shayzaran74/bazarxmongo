// apps/backend/src/modules/advertising/presentation/ad-campaign.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Public } from '@barterborsa/shared-security';
import { GetAdsForSlotQuery } from '../application/queries/advertising.queries';
import { AdSlotType } from '../domain/enums/advertising.enums';

@Controller('ads')
export class AdCampaignController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Get('slot/:slotType')
  async getAdsBySlot(
    @Param('slotType') slotType: AdSlotType,
    @Query('platform') platform: string = 'BAZARX',
    @Query('keywords') keywords?: string
  ) {
    const context = { keywords: keywords ? keywords.split(',') : [] };
    return this.queryBus.execute(new GetAdsForSlotQuery(slotType, platform, context));
  }
}
