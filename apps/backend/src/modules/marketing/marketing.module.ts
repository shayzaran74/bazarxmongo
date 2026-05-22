// apps/backend/src/modules/marketing/marketing.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';

import { BannerController } from './presentation/banner.controller';
import { CampaignController } from './presentation/campaign.controller';
import { GroupBuyController } from './presentation/group-buy.controller';
import { GiftCardAdminController } from './presentation/gift-card-admin.controller';
import { CouponAdminController } from './presentation/coupon-admin.controller';
import { PublicCouponController } from './presentation/public-coupon.controller';
import { MarketingAdminController, GroupBuyAdminController } from './presentation/marketing-admin.controller';
import { IssueGiftVoucherHandler } from './application/commands/issue-gift-voucher.handler';
import { RedeemGiftVoucherHandler } from './application/commands/redeem-gift-voucher.handler';
import { GiftVoucherSchedulerService } from './application/services/gift-voucher-scheduler.service';

@Module({
  imports: [CqrsModule, FinancialGatewayModule],
  controllers: [
    BannerController,
    CampaignController,
    GroupBuyController,
    GiftCardAdminController,
    CouponAdminController,
    PublicCouponController,
    MarketingAdminController,
    GroupBuyAdminController,
  ],
  providers: [
    IssueGiftVoucherHandler,
    RedeemGiftVoucherHandler,
    GiftVoucherSchedulerService,
  ],
  exports: [IssueGiftVoucherHandler],
})
export class MarketingModule {}
