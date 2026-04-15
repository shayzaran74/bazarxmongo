import { Module } from '@nestjs/common';
import { BannerController } from './presentation/banner.controller';
import { CampaignController } from './presentation/campaign.controller';

@Module({
  controllers: [BannerController, CampaignController],
})
export class MarketingModule {}
