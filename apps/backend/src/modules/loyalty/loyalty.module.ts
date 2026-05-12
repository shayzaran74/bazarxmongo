// apps/backend/src/modules/loyalty/loyalty.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { XpController } from './presentation/xp.controller';
import { MissionController, LoyaltyAdminController } from './presentation/mission-admin.controllers';

import { EarnXpHandler, SpendXpHandler } from './application/commands/xp-management.handlers';
import { LoyaltyIntegrationEventHandler } from './application/event-handlers/loyalty-event.handlers';

import { 
  GetUserLevelHandler, 
  GetXpBalanceHandler, 
  GetXpHistoryHandler, 
  GetMissionsHandler, 
  GetUserMissionsHandler 
} from './application/queries/loyalty-query.handlers';

import { XpCalculatorService } from './application/services/xp-calculator.service';
import { LevelCalculatorService } from './application/services/level-calculator.service';
import { SpendingLimitService } from './application/services/spending-limit.service';
import { MilestoneCheckerService } from './application/services/milestone-checker.service';

import * as repos from './infrastructure/persistence/prisma-loyalty.repositories';
import * as ruleRepos from './infrastructure/persistence/loyalty-rules.repositories';

const Handlers = [
  EarnXpHandler, SpendXpHandler,
  LoyaltyIntegrationEventHandler,
  GetUserLevelHandler, GetXpBalanceHandler, GetXpHistoryHandler, GetMissionsHandler, GetUserMissionsHandler
];

const Repositories = [
  { provide: 'IUserLevelRepository', useClass: repos.PrismaUserLevelRepository },
  { provide: 'IXpTransactionRepository', useClass: repos.PrismaXpTransactionRepository },
  { provide: 'IXpBatchRepository', useClass: repos.PrismaXpBatchRepository },
  { provide: 'IMissionRepository', useClass: repos.PrismaMissionRepository },
  { provide: 'IUserMissionRepository', useClass: repos.PrismaUserMissionRepository },
  { provide: 'IMilestoneTrackerRepository', useClass: repos.PrismaMilestoneTrackerRepository },
  { provide: 'IXpDistributionRuleRepository', useClass: ruleRepos.PrismaXpDistributionRuleRepository },
  { provide: 'IXpSpendingLimitRuleRepository', useClass: ruleRepos.PrismaXpSpendingLimitRuleRepository },
];

import { BadgeAdminController } from './presentation/badge-admin.controller';
import { TierController } from './presentation/tier.controller';
import { AdminTierController } from './presentation/admin-tier.controller';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [
    XpController, 
    MissionController, 
    LoyaltyAdminController, 
    BadgeAdminController, 
    TierController,
    AdminTierController
  ],
  providers: [
    ...Handlers,
    ...Repositories,
    XpCalculatorService,
    LevelCalculatorService,
    SpendingLimitService,
    MilestoneCheckerService,
  ],
  exports: [XpCalculatorService, LevelCalculatorService],
})
export class LoyaltyModule {}
