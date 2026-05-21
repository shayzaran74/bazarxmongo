// apps/backend/src/modules/content/content.module.ts
// ContentModule — Mongoose migration (ADR-005 Faz 2c)

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { HomeBannerController } from './presentation/home-banner.controller';
import { HelpController } from './presentation/help.controller';
import { ContentAdminController } from './presentation/content-admin.controller';
import { HomeQuadCardsController } from './presentation/home-quad-cards.controller';
import { DynamicContentController } from './presentation/dynamic-content.controller';
import { LegalController } from './presentation/legal.controller';
import { BannersAdminController } from './presentation/banners-admin.controller';
import { DynamicContentAdminController } from './presentation/dynamic-admin.controller';
import { HelpAdminController } from './presentation/help-admin.controller';
import { SideAdsAdminController } from './presentation/side-ads-admin.controller';
import { SideAdsController } from './presentation/side-ads.controller';

import { CreateHomeBannerHandler } from './application/commands/create-home-banner.handler';
import { CreateQuadCardHandler } from './application/commands/create-quad-card.handler';
import { CreateHelpCategoryHandler, CreateHelpArticleHandler } from './application/commands/create-help.handlers';
import {
  CreateAnnouncementHandler,
  CreatePolicyHandler,
  CreateDynamicContentHandler,
  UpsertSeoMetadataHandler
} from './application/commands/content-misc.handlers';

import {
  GetHomeBannersHandler,
  GetHomeQuadCardsHandler,
  GetHelpCategoriesHandler,
  GetHelpArticleHandler,
  SearchHelpArticlesHandler,
  GetAnnouncementsHandler,
  GetPoliciesHandler,
  GetPolicyBySlugHandler,
  GetDynamicContentHandler,
  GetSeoMetadataHandler
} from './application/queries/content-query.handlers';

import { MongoHomeBannerRepository } from './infrastructure/persistence/mongo-home-banner.repository';
import { MongoHomeQuadCardRepository } from './infrastructure/persistence/mongo-home-quad-card.repository';
import { PrismaHelpCategoryRepository, PrismaHelpArticleRepository } from './infrastructure/persistence/mongo-help.repositories';
import {
  PrismaAnnouncementRepository,
  PrismaPolicyRepository,
  PrismaDynamicContentRepository,
  PrismaSeoMetadataRepository
} from './infrastructure/persistence/content-misc.repositories';

import { HomeBanner, HomeBannerSchema } from '@barterborsa/shared-persistence/schemas/backend/homeBanner.schema';
import { HomeQuadCard, HomeQuadCardSchema } from '@barterborsa/shared-persistence/schemas/backend/homeQuadCard.schema';
import { HelpArticle, HelpArticleSchema } from '@barterborsa/shared-persistence/schemas/backend/helpArticle.schema';
import { HelpCategory, HelpCategorySchema } from '@barterborsa/shared-persistence/schemas/backend/helpCategory.schema';
import { DynamicContent, DynamicContentSchema } from '@barterborsa/shared-persistence/schemas/backend/dynamicContent.schema';
import {
  AnnouncementSchema, PolicySchema, SeoMetadataSchema,
  SideAdSchema, AdLocationSchema, SystemSettingSchema,
  HomeQuadCardItemSchema,
} from '@barterborsa/shared-persistence';

const CommandHandlers = [
  CreateHomeBannerHandler,
  CreateQuadCardHandler,
  CreateHelpCategoryHandler,
  CreateHelpArticleHandler,
  CreateAnnouncementHandler,
  CreatePolicyHandler,
  CreateDynamicContentHandler,
  UpsertSeoMetadataHandler,
];

const QueryHandlers = [
  GetHomeBannersHandler,
  GetHomeQuadCardsHandler,
  GetHelpCategoriesHandler,
  GetHelpArticleHandler,
  SearchHelpArticlesHandler,
  GetAnnouncementsHandler,
  GetPoliciesHandler,
  GetPolicyBySlugHandler,
  GetDynamicContentHandler,
  GetSeoMetadataHandler,
];

const Repositories = [
  { provide: 'IHomeBannerRepository', useClass: MongoHomeBannerRepository },
  { provide: 'IHomeQuadCardRepository', useClass: MongoHomeQuadCardRepository },
  { provide: 'IHelpCategoryRepository', useClass: PrismaHelpCategoryRepository },
  { provide: 'IHelpArticleRepository', useClass: PrismaHelpArticleRepository },
  { provide: 'IAnnouncementRepository', useClass: PrismaAnnouncementRepository },
  { provide: 'IPolicyRepository', useClass: PrismaPolicyRepository },
  { provide: 'IDynamicContentRepository', useClass: PrismaDynamicContentRepository },
  { provide: 'ISeoMetadataRepository', useClass: PrismaSeoMetadataRepository },
];

import { SettingsAdminController } from './presentation/settings-admin.controller';
import { SettingsController } from './presentation/settings.controller';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'HomeBanner', schema: HomeBannerSchema },
      { name: 'HomeQuadCard', schema: HomeQuadCardSchema },
      { name: 'HelpArticle', schema: HelpArticleSchema },
      { name: 'HelpCategory', schema: HelpCategorySchema },
      { name: 'DynamicContent', schema: DynamicContentSchema },
      { name: 'Announcement',    schema: AnnouncementSchema },
      { name: 'Policy',          schema: PolicySchema },
      { name: 'SeoMetadata',     schema: SeoMetadataSchema },
      { name: 'SideAd',          schema: SideAdSchema },
      { name: 'AdLocation',      schema: AdLocationSchema },
      { name: 'SystemSetting',   schema: SystemSettingSchema },
      { name: 'HomeQuadCardItem',schema: HomeQuadCardItemSchema },
    ]),
  ],
  controllers: [
    HomeBannerController,
    HelpController,
    ContentAdminController,
    HomeQuadCardsController,
    DynamicContentController,
    LegalController,
    SettingsAdminController,
    SettingsController,
    BannersAdminController,
    DynamicContentAdminController,
    HelpAdminController,
    SideAdsAdminController,
    SideAdsController,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
  ],
})
export class ContentModule {}
