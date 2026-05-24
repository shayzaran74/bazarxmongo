// apps/backend/src/modules/loyalty/loyalty.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserLevelSchema, XpTransactionSchema, XpBatchSchema, MissionSchema,
  UserMissionSchema, MilestoneTrackerSchema, XpDistributionRuleSchema,
  XpSpendingLimitRuleSchema, UserSubscriptionSchema, MembershipPlanSchema,
  MembershipTierSchema, VendorSchema, BadgeRuleSchema, ListingSchema,
  TierBenefitSchema,
} from '@barterborsa/shared-persistence';

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
import { XpRulesService } from './application/services/xp-rules.service';

import * as repos from './infrastructure/persistence/mongo-loyalty.repositories';
import * as ruleRepos from './infrastructure/persistence/loyalty-rules.repositories';

const Handlers = [
  EarnXpHandler, SpendXpHandler,
  LoyaltyIntegrationEventHandler,
  GetUserLevelHandler, GetXpBalanceHandler, GetXpHistoryHandler, GetMissionsHandler, GetUserMissionsHandler
];

const Repositories = [
  { provide: 'IUserLevelRepository', useClass: repos.MongoUserLevelRepository },
  { provide: 'IXpTransactionRepository', useClass: repos.MongoXpTransactionRepository },
  { provide: 'IXpBatchRepository', useClass: repos.MongoXpBatchRepository },
  { provide: 'IMissionRepository', useClass: repos.MongoMissionRepository },
  { provide: 'IUserMissionRepository', useClass: repos.MongoUserMissionRepository },
  { provide: 'IMilestoneTrackerRepository', useClass: repos.MongoMilestoneTrackerRepository },
  { provide: 'IXpDistributionRuleRepository', useClass: ruleRepos.MongoXpDistributionRuleRepository },
  { provide: 'IXpSpendingLimitRuleRepository', useClass: ruleRepos.MongoXpSpendingLimitRuleRepository },
];

import { BadgeAdminController } from './presentation/badge-admin.controller';
import { TierController } from './presentation/tier.controller';
import { AdminTierController } from './presentation/admin-tier.controller';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'UserLevel',           schema: UserLevelSchema },
      { name: 'XpTransaction',       schema: XpTransactionSchema },
      { name: 'XpBatch',             schema: XpBatchSchema },
      { name: 'Mission',             schema: MissionSchema },
      { name: 'UserMission',         schema: UserMissionSchema },
      { name: 'MilestoneTracker',    schema: MilestoneTrackerSchema },
      { name: 'XpDistributionRule',  schema: XpDistributionRuleSchema },
      { name: 'XpSpendingLimitRule', schema: XpSpendingLimitRuleSchema },
      { name: 'UserSubscription',    schema: UserSubscriptionSchema },
      { name: 'MembershipPlan',      schema: MembershipPlanSchema },
      { name: 'MembershipTier',      schema: MembershipTierSchema },
      { name: 'Vendor',              schema: VendorSchema },
      { name: 'BadgeRule',           schema: BadgeRuleSchema },
      { name: 'Listing',             schema: ListingSchema },
      { name: 'TierBenefit',         schema: TierBenefitSchema },
    ]),
  ],
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
    XpRulesService,
  ],
  exports: [XpCalculatorService, LevelCalculatorService, XpRulesService],
})
export class LoyaltyModule {}
