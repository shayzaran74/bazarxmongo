// apps/backend/src/modules/loyalty/application/services/xp-rules.service.ts
// Master Plan v4.3 §2.5 — XP kazanım ve harcama kuralları

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserLevel, IUserSubscription, IMembershipPlan, IXpTransaction } from '@barterborsa/shared-persistence';

export const XP_EARNING_RULES = {
  PROFILE_COMPLETE:    5,
  SOCIAL_SHARE:        10,
  MENU_QR_USE:         5,
  REFERRAL_GIVEN:      20,
  REFERRAL_RECEIVED:   10,
  MONTHLY_SPENDING_110: 15,
} as const;

const TIER_UPGRADE_MAX_XP_PCT   = 0.50;
const SYSTEM_PAYMENT_MAX_XP_PCT = 0.20;

@Injectable()
export class XpRulesService {
  constructor(
    @InjectModel('UserLevel')        private readonly userLevelModel: Model<IUserLevel>,
    @InjectModel('UserSubscription') private readonly subModel:       Model<IUserSubscription>,
    @InjectModel('MembershipPlan')   private readonly planModel:      Model<IMembershipPlan>,
    @InjectModel('XpTransaction')    private readonly xpTxModel:      Model<IXpTransaction>,
  ) {}

  async checkFirstOrderBlock(userId: string): Promise<boolean> {
    const level = await this.userLevelModel.findOne({ userId }, { isFirstOrder: 1 }).lean();
    return level?.isFirstOrder ?? true;
  }

  maxXpForTierUpgrade(feeDiff: number, hasThirdReferral: boolean): number {
    const pct = hasThirdReferral ? 0.60 : TIER_UPGRADE_MAX_XP_PCT;
    return Math.floor(feeDiff * pct);
  }

  maxXpForSystemPayment(transactionAmount: number): number {
    return Math.floor(transactionAmount * SYSTEM_PAYMENT_MAX_XP_PCT);
  }

  async checkMonthlySpendingBonus(userId: string, currentMonthRevenue: number): Promise<boolean> {
    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription) return false;

    const plan = await this.planModel.findOne({ id: subscription.planId }, { breakeven: 1 }).lean();
    if (!plan) return false;

    const target = parseFloat(plan.breakeven.toString()) * 1.10;
    return currentMonthRevenue >= target;
  }

  async hasSocialShareThisMonth(userId: string): Promise<boolean> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await this.xpTxModel.countDocuments({
      userId, type: 'SOCIAL_SHARE', createdAt: { $gte: startOfMonth },
    });
    return count > 0;
  }

  async hasProfileCompleteXp(userId: string): Promise<boolean> {
    const count = await this.xpTxModel.countDocuments({ userId, type: 'PROFILE_COMPLETE' });
    return count > 0;
  }

  async canEarnReferralXp(userId: string): Promise<boolean> {
    const count = await this.xpTxModel.countDocuments({ userId, type: 'REFERRAL_GIVEN' });
    return count < 3;
  }

  async erodeExpiredBatches(): Promise<number> {
    const now = new Date();
    let totalEroded = 0;

    const expiredBatches = await this.xpTxModel
      .find({ expiresAt: { $lte: now }, amount: { $gt: 0 }, type: { $ne: 'ERODED' } })
      .limit(500)
      .lean();

    for (const batch of expiredBatches) {
      const erosion = Math.ceil((batch.amount as number) * 0.10);
      if (erosion > 0) {
        const newId = batch._id ? new (require('mongoose').Types.ObjectId)().toString() : String(Date.now());
        await this.xpTxModel.create([{
          _id: newId, id: newId, userId: batch.userId, amount: -erosion,
          type: 'ERODED', description: 'Aylık %10 XP erozyonu', referenceType: 'XP_EROSION',
        }]);
        await this.userLevelModel.updateOne(
          { userId: batch.userId },
          { $inc: { currentXp: -erosion } },
        );
        totalEroded += erosion;
      }
    }

    return totalEroded;
  }
}
