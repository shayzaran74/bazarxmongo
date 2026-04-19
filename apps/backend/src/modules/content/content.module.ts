// apps/backend/src/modules/content/content.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { HomeBannerController } from './presentation/home-banner.controller';
import { HelpController } from './presentation/help.controller';
import { ContentAdminController } from './presentation/content-admin.controller';
import { HomeQuadCardsController } from './presentation/home-quad-cards.controller';
import { DynamicContentController } from './presentation/dynamic-content.controller';
import { LegalController } from './presentation/legal.controller';

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

import { PrismaHomeBannerRepository } from './infrastructure/persistence/prisma-home-banner.repository';
import { PrismaHomeQuadCardRepository } from './infrastructure/persistence/prisma-home-quad-card.repository';
import { PrismaHelpCategoryRepository, PrismaHelpArticleRepository } from './infrastructure/persistence/prisma-help.repositories';
import { 
  PrismaAnnouncementRepository, 
  PrismaPolicyRepository, 
  PrismaDynamicContentRepository, 
  PrismaSeoMetadataRepository 
} from './infrastructure/persistence/content-misc.repositories';

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
  { provide: 'IHomeBannerRepository', useClass: PrismaHomeBannerRepository },
  { provide: 'IHomeQuadCardRepository', useClass: PrismaHomeQuadCardRepository },
  { provide: 'IHelpCategoryRepository', useClass: PrismaHelpCategoryRepository },
  { provide: 'IHelpArticleRepository', useClass: PrismaHelpArticleRepository },
  { provide: 'IAnnouncementRepository', useClass: PrismaAnnouncementRepository },
  { provide: 'IPolicyRepository', useClass: PrismaPolicyRepository },
  { provide: 'IDynamicContentRepository', useClass: PrismaDynamicContentRepository },
  { provide: 'ISeoMetadataRepository', useClass: PrismaSeoMetadataRepository },
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [
    HomeBannerController, 
    HelpController, 
    ContentAdminController,
    HomeQuadCardsController,
    DynamicContentController,
    LegalController
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
  ],
})
export class ContentModule {}
