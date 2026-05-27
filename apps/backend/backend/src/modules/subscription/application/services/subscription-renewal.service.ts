// apps/backend/src/modules/subscription/application/services/subscription-renewal.service.ts
// Master Plan v4.3 — Aylık yenileme ve downgrade koruması

import { Injectable, Logger, OnModuleDestroy, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserSubscription, IMembershipPlan, IMenuUsage } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 saat

@Injectable()
export class SubscriptionRenewalService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(SubscriptionRenewalService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private readonly notifiedAt = new Map<string, number>();

  constructor(
    @InjectModel('UserSubscription') private readonly subModel:   Model<IUserSubscription>,
    @InjectModel('MembershipPlan')   private readonly planModel:  Model<IMembershipPlan>,
    @InjectModel('MenuUsage')        private readonly usageModel: Model<IMenuUsage>,
    private readonly auditLog: AuditLogService,
  ) {}

  onApplicationBootstrap(): void {
    void this.runChecks();
    this.intervalHandle = setInterval(() => void this.runChecks(), CHECK_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  async runChecks(): Promise<void> {
    await Promise.all([
      this.expireSubscriptions(),
      this.processRenewals(),
      this.notifyNearBreakeven(),
    ]);
  }

  private async expireSubscriptions(): Promise<void> {
    const now     = new Date();
    const expired = await this.subModel
      .find({ status: 'ACTIVE', endDate: { $lte: now }, autoRenew: false }, { _id: 1, id: 1, userId: 1 })
      .lean();

    for (const sub of expired) {
      await this.subModel.updateOne({ _id: sub._id ?? sub.id }, { $set: { status: 'EXPIRED' } });
      this.logger.log('Abonelik süresi doldu', { userId: sub.userId });
    }
  }

  private async processRenewals(): Promise<void> {
    const now      = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const due = await this.subModel
      .find({ status: 'ACTIVE', autoRenew: true, nextBillingDate: { $gte: now, $lte: tomorrow } })
      .lean();

    for (const sub of due) {
      try {
        const newEndDate     = new Date(sub.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        const newBillingDate = new Date(sub.nextBillingDate!);
        newBillingDate.setMonth(newBillingDate.getMonth() + 1);

        await this.subModel.updateOne(
          { _id: sub._id ?? sub.id },
          { $set: { endDate: newEndDate, nextBillingDate: newBillingDate } },
        );

        // Plan tier'ını al
        const plan = await this.planModel.findOne({ id: sub.planId }, { tier: 1 }).lean();
        this.logger.log('Abonelik yenilendi', { userId: sub.userId, tier: plan?.tier });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('Abonelik yenileme başarısız', { userId: sub.userId, error: msg });
      }
    }
  }

  private async notifyNearBreakeven(): Promise<void> {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const activeSubs = await this.subModel.find({ status: 'ACTIVE' }).limit(500).lean();

    for (const sub of activeSubs) {
      try {
        const lastNotified = this.notifiedAt.get(sub.userId) ?? 0;
        if (Date.now() - lastNotified < 23 * 60 * 60 * 1000) continue;

        const [usage, plan] = await Promise.all([
          this.usageModel.findOne({ subscriptionId: sub.id, month, year }, { usedCredit: 1, totalCredit: 1 }).lean(),
          this.planModel.findOne({ id: sub.planId }, { monthlyFee: 1, tier: 1 }).lean(),
        ]);

        if (!plan) continue;

        const usedCredit      = parseFloat((usage?.usedCredit ?? 0).toString());
        const monthlyFee      = parseFloat(plan.monthlyFee.toString());
        const breakevenTarget = monthlyFee * 5;
        const threshold80     = breakevenTarget * 0.80;

        if (usedCredit >= threshold80 && usedCredit < breakevenTarget) {
          const progressPct = Math.round((usedCredit / breakevenTarget) * 100);

          await this.auditLog.log({
            actorId:      sub.userId,
            action:       'UPGRADE_THRESHOLD_NEAR',
            resourceType: 'UserSubscription',
            resourceId:   sub.id,
            newValue: {
              progressPct, usedCredit, breakevenTarget, tier: plan.tier,
              message: `Tier yükseltme eşiğinin %${progressPct}'ine ulaştınız!`,
            },
          });

          this.notifiedAt.set(sub.userId, Date.now());
          this.logger.log('Breakeven yakınlık bildirimi gönderildi', { userId: sub.userId, progressPct, tier: plan.tier });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('Breakeven bildirim hatası', { userId: sub.userId, error: msg });
      }
    }
  }
}
