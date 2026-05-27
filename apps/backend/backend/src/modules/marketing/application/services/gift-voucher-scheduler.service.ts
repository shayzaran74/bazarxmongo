// apps/backend/src/modules/marketing/application/services/gift-voucher-scheduler.service.ts
// Master Plan v4.3 §2.4 — Otomatik hediye çeki tetikleyicileri

import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UserProfile } from '@barterborsa/shared-persistence/schemas/backend/userProfile.schema';
import { UserSubscription } from '@barterborsa/shared-persistence/schemas/backend/userSubscription.schema';
import { GiftVoucher } from '@barterborsa/shared-persistence/schemas/backend/giftVoucher.schema';
import { IssueGiftVoucherCommand } from '../commands/issue-gift-voucher.command';

const DAILY_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class GiftVoucherSchedulerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(GiftVoucherSchedulerService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly commandBus: CommandBus) {}

  onApplicationBootstrap(): void {
    void this.runDailyChecks();
    this.intervalHandle = setInterval(() => void this.runDailyChecks(), DAILY_CHECK_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  private async runDailyChecks(): Promise<void> {
    await Promise.all([
      this.issueBirthdayVouchers(),
      this.issueThreeMonthVouchers(),
      this.issueAnniversaryVouchers(),
    ]);
  }

  // Doğum günü çeki
  private async issueBirthdayVouchers(): Promise<void> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day   = today.getDate();

    const users = await UserProfile.find({ birthday: { $ne: null } })
      .select('userId birthday')
      .lean();

    for (const u of users) {
      if (!u.birthday) continue;
      const b = u.birthday instanceof Date ? u.birthday : new Date(u.birthday);
      if (b.getMonth() + 1 !== month || b.getDate() !== day) continue;

      // Bu yıl doğum günü çeki verildi mi?
      const existing = await GiftVoucher.findOne({
        userId: u.userId,
        type:   'BIRTHDAY',
        createdAt: { $gte: new Date(today.getFullYear(), 0, 1) },
      }).lean();
      if (existing) continue;

      await this.commandBus.execute(
        new IssueGiftVoucherCommand(u.userId, 100, 'BIRTHDAY', 'SYSTEM', 30),
      );
      this.logger.log('Doğum günü çeki verildi', { userId: u.userId });
    }
  }

  // 3. ay tamamlama çeki (üyeliğin 90. günü)
  private async issueThreeMonthVouchers(): Promise<void> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyOneDaysAgo = new Date(ninetyDaysAgo);
    ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 1);

    const subs = await UserSubscription.find({
      status:    'ACTIVE',
      startDate: { $gte: ninetyOneDaysAgo, $lte: ninetyDaysAgo },
    }).select('userId').lean();

    for (const sub of subs) {
      const existing = await GiftVoucher.findOne({ userId: sub.userId, type: 'THREE_MONTH' }).lean();
      if (existing) continue;

      await this.commandBus.execute(
        new IssueGiftVoucherCommand(sub.userId, 150, 'THREE_MONTH', 'SYSTEM', 30),
      );
      this.logger.log('3. ay çeki verildi', { userId: sub.userId });
    }
  }

  // Yıl dönümü çeki (her yıl 1. günde)
  private async issueAnniversaryVouchers(): Promise<void> {
    const today      = new Date();
    const monthDay   = { month: today.getMonth() + 1, day: today.getDate() };

    const subs = await UserSubscription.find({ status: 'ACTIVE' })
      .select('userId startDate')
      .lean();

    for (const sub of subs) {
      const start = sub.startDate instanceof Date ? sub.startDate : new Date(sub.startDate);
      if (start.getMonth() + 1 !== monthDay.month || start.getDate() !== monthDay.day) continue;
      const years = today.getFullYear() - start.getFullYear();
      if (years < 1) continue;

      const existing = await GiftVoucher.findOne({
        userId:    sub.userId,
        type:      'ANNIVERSARY',
        createdAt: { $gte: new Date(today.getFullYear(), 0, 1) },
      }).lean();
      if (existing) continue;

      await this.commandBus.execute(
        new IssueGiftVoucherCommand(sub.userId, years * 50, 'ANNIVERSARY', 'SYSTEM', 30),
      );
      this.logger.log(`${years}. yıl dönümü çeki verildi`, { userId: sub.userId });
    }
  }
}
