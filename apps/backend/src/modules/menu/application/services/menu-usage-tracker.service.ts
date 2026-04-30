// apps/backend/src/modules/menu/application/services/menu-usage-tracker.service.ts
// Master Plan v4.3 §2.2 — Aylık 2× aidat menü kredisi takibi

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Decimal } from 'decimal.js';

@Injectable()
export class MenuUsageTrackerService {
  constructor(private readonly prisma: PrismaService) {}

  // Kullanıcının bu ay için kalan menü kredisini döndürür
  async getRemainingCredit(userId: string): Promise<{ total: number; used: number; remaining: number }> {
    const subscription = await this.prisma.userSubscription.findUnique({
      where:   { userId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return { total: 0, used: 0, remaining: 0 };
    }

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const total = Number(subscription.plan.menuCredit); // 2× aylık aidat

    let usage = await this.prisma.menuUsage.findUnique({
      where: { subscriptionId_month_year: { subscriptionId: subscription.id, month, year } },
    });

    if (!usage) {
      usage = await this.prisma.menuUsage.create({
        data: { subscriptionId: subscription.id, month, year, usedCredit: 0, totalCredit: total },
      });
    }

    const used = Number(usage.usedCredit);
    return { total, used, remaining: total - used };
  }

  // Satın alım öncesi kredi yeterli mi kontrol et
  async assertSufficientCredit(userId: string, amount: number): Promise<void> {
    const { remaining } = await this.getRemainingCredit(userId);
    if (remaining < amount) {
      throw new BadRequestException(
        `Yetersiz menü kredisi. Kalan: ${remaining.toLocaleString('tr-TR')}₺, Gereken: ${amount.toLocaleString('tr-TR')}₺`,
      );
    }
  }

  // Satın alım sonrası krediyi düş
  async deductCredit(userId: string, amount: number): Promise<void> {
    const subscription = await this.prisma.userSubscription.findUnique({
      where:   { userId },
      include: { plan: true },
    });
    if (!subscription) return;

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const total = Number(subscription.plan.menuCredit);

    await this.prisma.menuUsage.upsert({
      where:  { subscriptionId_month_year: { subscriptionId: subscription.id, month, year } },
      create: { subscriptionId: subscription.id, month, year, usedCredit: amount, totalCredit: total },
      update: { usedCredit: { increment: new Decimal(amount).toNumber() } },
    });
  }
}
