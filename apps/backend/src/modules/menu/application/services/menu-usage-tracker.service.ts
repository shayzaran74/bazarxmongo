// apps/backend/src/modules/menu/application/services/menu-usage-tracker.service.ts
// Master Plan v4.3 §2.2 — Aylık 2× aidat menü kredisi takibi

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserSubscription, IMembershipPlan, IMenuUsage } from '@barterborsa/shared-persistence';

@Injectable()
export class MenuUsageTrackerService {
  constructor(
    @InjectModel('UserSubscription') private readonly subModel:   Model<IUserSubscription>,
    @InjectModel('MembershipPlan')   private readonly planModel:  Model<IMembershipPlan>,
    @InjectModel('MenuUsage')        private readonly usageModel: Model<IMenuUsage>,
  ) {}

  async getRemainingCredit(userId: string): Promise<{ total: number; used: number; remaining: number }> {
    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription || subscription.status !== 'ACTIVE') return { total: 0, used: 0, remaining: 0 };

    const plan = await this.planModel.findOne({ id: subscription.planId }, { menuCredit: 1 }).lean();
    if (!plan) return { total: 0, used: 0, remaining: 0 };

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const total = parseFloat(plan.menuCredit.toString());

    let usage = await this.usageModel.findOne({ subscriptionId: subscription.id, month, year }).lean();
    if (!usage) {
      const newId = new Types.ObjectId().toString();
      await this.usageModel.create([{
        _id: newId, id: newId, subscriptionId: subscription.id, month, year,
        usedCredit:  Types.Decimal128.fromString('0'),
        totalCredit: Types.Decimal128.fromString(total.toFixed(2)),
      }]);
      usage = await this.usageModel.findOne({ subscriptionId: subscription.id, month, year }).lean();
    }

    const used = parseFloat((usage?.usedCredit ?? Types.Decimal128.fromString('0')).toString());
    return { total, used, remaining: total - used };
  }

  async assertSufficientCredit(userId: string, amount: number): Promise<void> {
    const { remaining } = await this.getRemainingCredit(userId);
    if (remaining < amount) {
      throw new BadRequestException(
        `Yetersiz menü kredisi. Kalan: ${remaining.toLocaleString('tr-TR')}₺, Gereken: ${amount.toLocaleString('tr-TR')}₺`,
      );
    }
  }

  async deductCredit(userId: string, amount: number): Promise<void> {
    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription) return;

    const plan = await this.planModel.findOne({ id: subscription.planId }, { menuCredit: 1 }).lean();
    if (!plan) return;

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const total = parseFloat(plan.menuCredit.toString());

    const amtD128   = Types.Decimal128.fromString(amount.toFixed(2));
    const totalD128 = Types.Decimal128.fromString(total.toFixed(2));
    const newId     = new Types.ObjectId().toString();

    await this.usageModel.findOneAndUpdate(
      { subscriptionId: subscription.id, month, year },
      {
        $inc:         { usedCredit: amtD128 },
        $setOnInsert: { _id: newId, id: newId, subscriptionId: subscription.id, month, year, usedCredit: amtD128, totalCredit: totalD128 },
      },
      { upsert: true },
    );
  }
}
