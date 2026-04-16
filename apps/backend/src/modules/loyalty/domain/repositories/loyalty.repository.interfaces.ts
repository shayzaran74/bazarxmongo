// apps/backend/src/modules/loyalty/domain/repositories/loyalty.repository.interfaces.ts

import { IRepository } from '@barterborsa/shared-core';
import { UserLevel } from '../entities/user-level.entity';
import { XpTransaction, XpBatch, LoyaltyTierHistory } from '../entities/loyalty-misc.entities';
import { Mission, UserMission, MilestoneTracker } from '../entities/missions-milestones.entities';
import { XpDistributionRule, XpSpendingLimitRule } from '../entities/loyalty-rules.entities';

export interface IUserLevelRepository extends IRepository<UserLevel> {
  findByUserId(userId: string): Promise<UserLevel | null>;
}

export interface IXpTransactionRepository extends IRepository<XpTransaction> {
  findByUserId(userId: string, skip: number, take: number): Promise<XpTransaction[]>;
  sumSpentInPeriod(userId: string, startDate: Date, endDate: Date): Promise<number>;
}

export interface IXpBatchRepository extends IRepository<XpBatch> {
  findAvailableBatches(accountId: string): Promise<XpBatch[]>;
  findExpiredBatches(now: Date): Promise<XpBatch[]>;
}

export interface IMissionRepository extends IRepository<Mission> {
  findActive(): Promise<Mission[]>;
}

export interface IUserMissionRepository extends IRepository<UserMission> {
  findByUserId(userId: string): Promise<UserMission[]>;
  findOne(userId: string, missionId: string): Promise<UserMission | null>;
}

export interface IMilestoneTrackerRepository extends IRepository<MilestoneTracker> {
  findByUserId(userId: string): Promise<MilestoneTracker | null>;
}

export interface ILoyaltyTierHistoryRepository extends IRepository<LoyaltyTierHistory> {
  findByUserId(userId: string): Promise<LoyaltyTierHistory[]>;
}

export interface IXpDistributionRuleRepository extends IRepository<XpDistributionRule> {
  findAllActive(): Promise<XpDistributionRule[]>;
}

export interface IXpSpendingLimitRuleRepository extends IRepository<XpSpendingLimitRule> {
  findApplicable(vendorTier?: string, loyaltyTier?: string): Promise<XpSpendingLimitRule[]>;
}
