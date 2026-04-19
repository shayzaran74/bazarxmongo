import { Module } from '@nestjs/common';
import { BannerController } from './presentation/banner.controller';
import { CampaignController } from './presentation/campaign.controller';
import { GroupBuyController } from './presentation/group-buy.controller';

@Module({
  controllers: [BannerController, CampaignController, GroupBuyController],
})
export class MarketingModule {}
