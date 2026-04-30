// apps/backend/src/modules/subscription/application/services/subscription-renewal.service.ts
// Master Plan v4.3 — Aylık yenileme ve downgrade koruması

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';

// Her gece 01:00'de çalışır
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 saat

@Injectable()
export class SubscriptionRenewalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubscriptionRenewalService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
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

  // Süresi dolan abonelikler → EXPIRED durumuna al
  private async expireSubscriptions(): Promise<void> {
    const now = new Date();
    const expired = await this.prisma.userSubscription.findMany({
      where: { status: 'ACTIVE', endDate: { lte: now }, autoRenew: false },
      select: { id: true, userId: true },
    });

    for (const sub of expired) {
      await this.prisma.userSubscription.update({
        where: { id: sub.id },
        data:  { status: 'EXPIRED' },
      });
      this.logger.log('Abonelik süresi doldu', { userId: sub.userId });
    }
  }

  // Otomatik yenileme (auto_renew=true, ödeme sistemi entegrasyonu bekleniyor)
  private async processRenewals(): Promise<void> {
    const now      = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const due = await this.prisma.userSubscription.findMany({
      where: {
        status:          'ACTIVE',
        autoRenew:       true,
        nextBillingDate: { gte: now, lte: tomorrow },
      },
      include: { plan: true },
    });

    for (const sub of due) {
      try {
        // Gerçek ödeme entegrasyonu Faz 2'de (financial-service) yapılacak
        // Şimdilik tarihleri öteliyor
        const newEndDate     = new Date(sub.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        const newBillingDate = new Date(sub.nextBillingDate!);
        newBillingDate.setMonth(newBillingDate.getMonth() + 1);

        await this.prisma.userSubscription.update({
          where: { id: sub.id },
          data:  { endDate: newEndDate, nextBillingDate: newBillingDate },
        });
        this.logger.log('Abonelik yenilendi', { userId: sub.userId, tier: sub.plan.tier });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('Abonelik yenileme başarısız', { userId: sub.userId, error: msg });
      }
    }
  }

  // Ciro eşiğinin %80'ine ulaşan kullanıcılara bildirim hazırla
  private async notifyNearBreakeven(): Promise<void> {
    // Bildirim altyapısı hazır olduğunda (Faz 8) implemente edilecek
    // Şu an sadece loglama
    this.logger.debug('Breakeven yakınlık kontrolü çalıştı');
  }
}
