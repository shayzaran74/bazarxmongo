// apps/backend/src/modules/loyalty/domain/entities/loyalty-rules.entities.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface XpDistributionRuleProps {
  city?: string;
  vendorTier?: string;
  commissionRate?: number;
  adSpendRate?: number;
  serviceRate?: number;
  priority: number;
  isActive: boolean;
  distributionType?: string;
  name?: string;
}

export class XpDistributionRule extends AggregateRoot<XpDistributionRuleProps> {
  private constructor(props: XpDistributionRuleProps, id?: string) { super(props, id); }
  public static create(props: XpDistributionRuleProps, id?: string): XpDistributionRule {
    return new XpDistributionRule(props, id);
  }
}

export interface XpSpendingLimitRuleProps {
  vendorTier?: string;
  loyaltyTier?: string;
  maxSpendPerTx?: number;
  monthlyVolumeLimit?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  maxSpendPercentage?: number;
  minCartAmount?: number;
  xpToTlRate?: number;
  priority: number;
  isActive: boolean;
}

export class XpSpendingLimitRule extends AggregateRoot<XpSpendingLimitRuleProps> {
  private constructor(props: XpSpendingLimitRuleProps, id?: string) { super(props, id); }
  public static create(props: XpSpendingLimitRuleProps, id?: string): XpSpendingLimitRule {
    return new XpSpendingLimitRule(props, id);
  }
}
