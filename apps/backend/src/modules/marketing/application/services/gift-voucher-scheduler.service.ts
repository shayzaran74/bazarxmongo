// apps/backend/src/modules/marketing/application/services/gift-voucher-scheduler.service.ts
// Master Plan v4.3 §2.4 — Otomatik hediye çeki tetikleyicileri

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IssueGiftVoucherCommand } from '../commands/issue-gift-voucher.command';

const DAILY_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class GiftVoucherSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GiftVoucherSchedulerService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma:      PrismaService,
    private readonly commandBus:  CommandBus,
  ) {}

  onModuleInit(): void {
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

    const users = await this.prisma.userProfile.findMany({
      where: {
        birthday: {
          not: null,
        },
      },
      select: { userId: true, birthday: true },
    });

    for (const u of users) {
      if (!u.birthday) continue;
      if (u.birthday.getMonth() + 1 !== month || u.birthday.getDate() !== day) continue;

      // Bu yıl doğum günü çeki verildi mi?
      const existing = await this.prisma.giftVoucher.findFirst({
        where: {
          userId: u.userId,
          type:   'BIRTHDAY',
          createdAt: { gte: new Date(today.getFullYear(), 0, 1) },
        },
      });
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

    const subs = await this.prisma.userSubscription.findMany({
      where: {
        status:    'ACTIVE',
        startDate: { gte: ninetyOneDaysAgo, lte: ninetyDaysAgo },
      },
      select: { userId: true },
    });

    for (const sub of subs) {
      const existing = await this.prisma.giftVoucher.findFirst({
        where: { userId: sub.userId, type: 'THREE_MONTH' },
      });
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

    const subs = await this.prisma.userSubscription.findMany({
      where: { status: 'ACTIVE' },
      select: { userId: true, startDate: true },
    });

    for (const sub of subs) {
      const start = sub.startDate;
      if (start.getMonth() + 1 !== monthDay.month || start.getDate() !== monthDay.day) continue;
      const years = today.getFullYear() - start.getFullYear();
      if (years < 1) continue;

      const existing = await this.prisma.giftVoucher.findFirst({
        where: {
          userId:    sub.userId,
          type:      'ANNIVERSARY',
          createdAt: { gte: new Date(today.getFullYear(), 0, 1) },
        },
      });
      if (existing) continue;

      await this.commandBus.execute(
        new IssueGiftVoucherCommand(sub.userId, years * 50, 'ANNIVERSARY', 'SYSTEM', 30),
      );
      this.logger.log(`${years}. yıl dönümü çeki verildi`, { userId: sub.userId });
    }
  }
}
