// apps/backend/src/modules/barter/application/services/trust-score-recalculation.service.ts
// Aylık TrustScore yeniden hesaplama cron servisi

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { TrustScoreCalculatorService } from './trust-score-calculator.service';

// Her gün 02:00'de kontrol (UTC)
const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class TrustScoreRecalculationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TrustScoreRecalculationService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma:      PrismaService,
    private readonly calculator:  TrustScoreCalculatorService,
  ) {}

  onModuleInit(): void {
    // İlk çalışma biraz geciksin (uygulama ayağa kalkarken)
    setTimeout(() => {
      void this.runMonthlyRecalculation();
      this.intervalHandle = setInterval(() => void this.runMonthlyRecalculation(), DAILY_INTERVAL_MS);
    }, 30_000);
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  async runMonthlyRecalculation(): Promise<void> {
    const now = new Date();

    // Sadece ayın 1'inde tam hesaplama yap
    // Diğer günler sadece inactiveDays'i güncelle
    const isFirstOfMonth = now.getDate() === 1;

    if (isFirstOfMonth) {
      this.logger.log('Aylık TrustScore yeniden hesaplama başladı');
      await this.recalculateAll();
    } else {
      await this.updateInactiveDays();
    }
  }

  // Tüm B2B vendor'ların TrustScore'unu yeniden hesapla
  private async recalculateAll(): Promise<void> {
    // Vendor tier'ı CORE/PRIME/ELITE/APEX olanları al
    const vendors = await this.prisma.vendor.findMany({
      where: { tier: { in: ['CORE', 'PRIME', 'ELITE', 'APEX'] }, status: 'APPROVED' },
      select: { id: true },
    });

    let success = 0;
    let failed  = 0;

    for (const v of vendors) {
      try {
        await this.calculator.recalculate(v.id);
        success++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('TrustScore hesaplama hatası', { vendorId: v.id, error: msg });
        failed++;
      }
    }

    this.logger.log(`TrustScore yeniden hesaplama tamamlandı: ${success} başarılı, ${failed} hatalı`);
  }

  // Her gün hareketsizlik sayacını güncelle
  private async updateInactiveDays(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Son 7 günde takas işlemi olmayan vendor'ların inactiveDays değerini artır
    const inactiveVendors = await this.prisma.vendor.findMany({
      where: {
        tier:   { in: ['CORE', 'PRIME', 'ELITE', 'APEX'] },
        status: 'APPROVED',
        company: {
          givenOffers:    { none: { createdAt: { gte: sevenDaysAgo } } },
          receivedOffers: { none: { createdAt: { gte: sevenDaysAgo } } },
        },
      },
      select: { id: true },
    });

    for (const v of inactiveVendors) {
      await this.prisma.trustScore.upsert({
        where:  { vendorId: v.id },
        create: { vendorId: v.id, inactiveDays: 1 },
        update: { inactiveDays: { increment: 1 } },
      }).catch(() => undefined);
    }
  }
}
