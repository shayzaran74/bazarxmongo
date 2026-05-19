// apps/backend/src/modules/barter/application/services/trust-score-recalculation.service.ts
// Aylık TrustScore yeniden hesaplama cron servisi

import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ITrustScoreRepository } from '../../../vendor/domain/repositories/trust-score.repository.interface';
import { TrustScoreCalculatorService } from './trust-score-calculator.service';

const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class TrustScoreRecalculationService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(TrustScoreRecalculationService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepo: ITrustScoreRepository,
    private readonly calculator: TrustScoreCalculatorService,
  ) {}

  onApplicationBootstrap(): void {
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
    const isFirstOfMonth = now.getDate() === 1;

    if (isFirstOfMonth) {
      this.logger.log('Aylık TrustScore yeniden hesaplama başladı');
      await this.recalculateAll();
    } else {
      await this.updateInactiveDays();
    }
  }

  private async recalculateAll(): Promise<void> {
    const vendors = await this.vendorRepo.findByTier(['CORE', 'PRIME', 'ELITE', 'APEX']);

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

  private async updateInactiveDays(): Promise<void> {
    // Son 7 günde işlem yapmayan vendorları bul
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    // Tüm APPROVED vendorları al
    const vendors = await this.vendorRepo.findByTier(['CORE', 'PRIME', 'ELITE', 'APEX']);

    for (const v of vendors) {
      const existing = await this.trustScoreRepo.findByVendorId(v.id);
      if (!existing) continue;

      // inactiveDays'i 1 artır
      const currentInactiveDays = ((existing as any)?.inactiveDays ?? 0) + 1;
      await this.trustScoreRepo.updateScore(v.id, { inactiveDays: currentInactiveDays });
    }
  }
}