// apps/backend/src/modules/advertising/advertising.module.ts
// AdvertisingModule — Mongoose migration (ADR-005 Faz 2b)

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

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

import { MongoAdCampaignRepository } from './infrastructure/persistence/mongo-ad-campaign.repository';
import { MongoAdSlotRepository, MongoSideAdRepository, MongoAdCampaignMetricRepository } from './infrastructure/persistence/ad-misc.repositories';

import { AdCampaign, AdCampaignSchema } from '@barterborsa/shared-persistence/schemas/backend/adCampaign.schema';
import { AdSlot, AdSlotSchema } from '@barterborsa/shared-persistence/schemas/backend/adSlot.schema';
import { AdCampaignMetric, AdCampaignMetricSchema } from '@barterborsa/shared-persistence/schemas/backend/adCampaignMetric.schema';

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
  { provide: 'IAdCampaignRepository', useClass: MongoAdCampaignRepository },
  { provide: 'IAdSlotRepository', useClass: MongoAdSlotRepository },
  { provide: 'ISideAdRepository', useClass: MongoSideAdRepository },
  { provide: 'IAdCampaignMetricRepository', useClass: MongoAdCampaignMetricRepository },
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: AdCampaign.name, schema: AdCampaignSchema },
      { name: AdSlot.name, schema: AdSlotSchema },
      { name: AdCampaignMetric.name, schema: AdCampaignMetricSchema },
    ]),
  ],
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
