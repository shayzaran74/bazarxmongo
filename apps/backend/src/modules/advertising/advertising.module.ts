// apps/backend/src/modules/advertising/advertising.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { AdCampaignController } from './presentation/ad-campaign.controller';
import { AdCampaignVendorController } from './presentation/ad-campaign-vendor.controller';
import { AdvertisingAdminController } from './presentation/advertising-admin.controller';
import { SettingsController } from './presentation/settings.controller';
import { B2BAdPackageController } from './presentation/b2b-ad-package.controller';

import { CreateAdCampaignHandler } from './application/commands/create-ad-campaign.handler';
import { ApproveAdCampaignHandler, RecordImpressionHandler, RecordClickHandler } from './application/commands/ad-lifecycle.handlers';

import { GetAdsForSlotHandler, GetVendorCampaignsHandler, GetAdsAdminHandler, GetSideAdsHandler } from './application/queries/advertising-query.handlers';

import { AdAuctionService } from './application/services/ad-auction.service';
import { BudgetManagerService } from './application/services/budget-manager.service';
import { B2BAdPackageService } from './application/services/b2b-ad-package.service';

import { PrismaAdCampaignRepository } from './infrastructure/persistence/prisma-ad-campaign.repository';
import { PrismaAdSlotRepository, PrismaSideAdRepository, PrismaAdCampaignMetricRepository } from './infrastructure/persistence/ad-misc.repositories';

const CommandHandlers = [
  CreateAdCampaignHandler,
  ApproveAdCampaignHandler,
  RecordImpressionHandler,
  RecordClickHandler,
];

const QueryHandlers = [
  GetAdsForSlotHandler,
  GetVendorCampaignsHandler,
  GetAdsAdminHandler,
  GetSideAdsHandler,
];

const Repositories = [
  { provide: 'IAdCampaignRepository', useClass: PrismaAdCampaignRepository },
  { provide: 'IAdSlotRepository', useClass: PrismaAdSlotRepository },
  { provide: 'ISideAdRepository', useClass: PrismaSideAdRepository },
  { provide: 'IAdCampaignMetricRepository', useClass: PrismaAdCampaignMetricRepository },
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [AdCampaignController, AdCampaignVendorController, AdvertisingAdminController, SettingsController, B2BAdPackageController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    AdAuctionService,
    BudgetManagerService,
    B2BAdPackageService,
  ],
  exports: [AdAuctionService, B2BAdPackageService],
})
export class AdvertisingModule {}
