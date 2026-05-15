// apps/backend/src/modules/subscription/application/services/subscription-renewal.service.ts
// Master Plan v4.3 — Aylık yenileme ve downgrade koruması

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';

// Her gece 01:00'de çalışır
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 saat

@Injectable()
export class SubscriptionRenewalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubscriptionRenewalService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  // Master Plan v4.3 §2.7 — %80 eşiği bildirimi için son gönderim saklama
  // Key: userId, Value: son bildirim timestamp (fazla spam engeli)
  private readonly notifiedAt = new Map<string, number>();

  constructor(
    private readonly prisma:    PrismaService,
    private readonly auditLog:  AuditLogService,
  ) {}

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

  // Master Plan v4.3 §2.7 — Ciro eşiğinin %80'ine ulaşan kullanıcılara bildirim
  // Breakeven ciro = aylık aidatın 5 katı. %80 eşiği = aidatın 4 katı.
  private async notifyNearBreakeven(): Promise<void> {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aktif B2C abonelikler
    const activeSubs = await this.prisma.userSubscription.findMany({
      where:   { status: 'ACTIVE' },
      include: { plan: true },
      take:    500, // Batch limit
    });

    for (const sub of activeSubs) {
      try {
        // Son bildirimi en az 23 saat önce gönderdik mi? (spam önlemi)
        const lastNotified = this.notifiedAt.get(sub.userId) ?? 0;
        if (Date.now() - lastNotified < 23 * 60 * 60 * 1000) continue;

        // Bu ayki menü kullanım cirosu
        const usage = await this.prisma.menuUsage.findFirst({
          where: {
            subscriptionId: sub.id,
            month:          now.getMonth() + 1,
            year:           now.getFullYear(),
          },
          select: { usedCredit: true, totalCredit: true },
        });

        const usedCredit      = Number(usage?.usedCredit ?? 0);
        const monthlyFee      = Number(sub.plan.monthlyFee);
        const breakevenTarget = monthlyFee * 5;     // §2.7: ciro ≥ aidat × 5
        const threshold80     = breakevenTarget * 0.80;

        // %80 eşiğine ulaştı ama henüz %100'e ulaşmadı
        if (usedCredit >= threshold80 && usedCredit < breakevenTarget) {
          const progressPct = Math.round((usedCredit / breakevenTarget) * 100);

          await this.auditLog.log({
            actorId:      sub.userId,
            action:       'UPGRADE_THRESHOLD_NEAR',
            resourceType: 'UserSubscription',
            resourceId:   sub.id,
            newValue: {
              progressPct,
              usedCredit,
              breakevenTarget,
              tier:    sub.plan.tier,
              message: `Tier yükseltme eşiğinin %${progressPct}'ine ulaştınız!`,
            },
          });

          this.notifiedAt.set(sub.userId, Date.now());
          this.logger.log('Breakeven yakınlık bildirimi gönderildi', {
            userId:      sub.userId,
            progressPct,
            tier:        sub.plan.tier,
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('Breakeven bildirim hatası', { userId: sub.userId, error: msg });
      }
    }
  }
}
