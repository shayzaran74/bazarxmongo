// apps/backend/src/modules/loyalty/application/services/spending-limit.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { IXpSpendingLimitRuleRepository, IXpTransactionRepository } from '../../domain/repositories/loyalty.repository.interfaces';
import { DomainException } from '@barterborsa/shared-core';

@Injectable()
export class SpendingLimitService {
  constructor(
    @Inject('IXpSpendingLimitRuleRepository') private readonly ruleRepository: IXpSpendingLimitRuleRepository,
    @Inject('IXpTransactionRepository') private readonly txRepository: IXpTransactionRepository,
  ) {}

  async validateSpending(userId: string, xpAmount: number, cartTotal: number, vendorTier?: string, loyaltyTier?: string): Promise<void> {
    const rules = await this.ruleRepository.findApplicable(vendorTier, loyaltyTier);
    if (rules.length === 0) return; // No rules, assume allowed (or strict mode)

    const rule = rules[0]; // Priority logic handled by repo

    // 1. Min Cart Amount
    const minCart = rule.getProps().minCartAmount;
    if (minCart && cartTotal < minCart) {
      throw new DomainException(`Minimum cart amount for XP usage is ${minCart}`);
    }

    // 2. Max Percentage
    const xpToTlRate = rule.getProps().xpToTlRate || 0.1; // Default 1 XP = 0.1 TL
    const tlValue = xpAmount * xpToTlRate;
    const maxPct = rule.getProps().maxSpendPercentage;
    if (maxPct && (tlValue / cartTotal) * 100 > maxPct) {
      throw new DomainException(`You can pay maximum ${maxPct}% of the order with XP`);
    }

    const dailyLimit = rule.getProps().dailyLimit;
    if (dailyLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const spentToday = await this.txRepository.sumSpentInPeriod(userId, today, new Date());
      if (Math.abs(spentToday) + xpAmount > dailyLimit) {
        throw new DomainException('Daily XP spending limit exceeded');
      }
    }
  }

  async calculateXpToTl(xpAmount: number, vendorTier?: string, loyaltyTier?: string): Promise<number> {
    const rules = await this.ruleRepository.findApplicable(vendorTier, loyaltyTier);
    const rate = rules.length > 0 ? (rules[0].getProps().xpToTlRate || 0.1) : 0.1;
    return xpAmount * rate;
  }
}
