// apps/backend/src/modules/marketing/marketing.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { BannerController } from './presentation/banner.controller';
import { CampaignController } from './presentation/campaign.controller';
import { GroupBuyController } from './presentation/group-buy.controller';
import { GiftCardAdminController } from './presentation/gift-card-admin.controller';
import { CouponAdminController } from './presentation/coupon-admin.controller';
import { PublicCouponController } from './presentation/public-coupon.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    BannerController,
    CampaignController,
    GroupBuyController,
    GiftCardAdminController,
    CouponAdminController,
    PublicCouponController,
  ],
})
export class MarketingModule {}
