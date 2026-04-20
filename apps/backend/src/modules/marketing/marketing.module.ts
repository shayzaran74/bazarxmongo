import { Module } from '@nestjs/common';
import { BannerController } from './presentation/banner.controller';
import { CampaignController } from './presentation/campaign.controller';
import { GroupBuyController } from './presentation/group-buy.controller';

import { GiftCardAdminController, CouponAdminController, PublicCouponController } from './presentation/marketing-admin.controller';

@Module({
  controllers: [BannerController, CampaignController, GroupBuyController, GiftCardAdminController, CouponAdminController, PublicCouponController],
})
export class MarketingModule {}
