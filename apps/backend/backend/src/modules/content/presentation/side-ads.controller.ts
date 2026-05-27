// apps/backend/src/modules/content/presentation/side-ads.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Public } from '@barterborsa/shared-security';
import { ISideAd } from '@barterborsa/shared-persistence';

@ApiTags('Side Ads')
@Controller('side-ads')
export class SideAdsController {
  constructor(
    @InjectModel('SideAd') private readonly sideAdModel: Model<ISideAd>,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get active side ads' })
  @Get()
  async getSideAds(
    @Query('side') side?: string,
    @Query('ecosystem') ecosystem?: string,
  ) {
    const where: Record<string, unknown> = { isActive: true };
    if (side) where.side = side;

    const items = await this.sideAdModel.find(where).sort({ order: 1 }).lean();
    return { success: true, data: items };
  }
}
