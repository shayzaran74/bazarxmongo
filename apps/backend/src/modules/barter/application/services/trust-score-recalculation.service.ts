// apps/backend/src/modules/barter/application/services/trust-score-recalculation.service.ts
// Master Plan v4.3 §3.3 — TrustScore Cron Servisi
//
// Zamanlama:
//   - Her gün 03:00 → inactivity tracking + dondurma kontrolü
//   - Her ayın 1'i 03:00 → tüm vendor'ların tam TrustScore yeniden hesaplama
//
// Düzeltmeler (2026-05-21):
//   1. setInterval → @Cron ile doğru zamanlama
//   2. inactiveDays: işlem yapanlar sıfırlanır, yapmayanlara +1/gün
//   3. Dondurma: violationCount >= 3 → isFrozen=true, level=FROZEN
//   4. level alanı artık her hesaplamada güncelleniyor

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ITrustScoreRepository } from '../../../vendor/domain/repositories/trust-score.repository.interface';
import { TrustScoreCalculatorService } from './trust-score-calculator.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { scoreToLevel, FREEZE_VIOLATION_THRESHOLD, INACTIVITY_THRESHOLD_DAYS } from '../../domain/trust-level.constants';

const B2B_TIERS = ['CORE', 'PRIME', 'ELITE', 'APEX'];
const BATCH_SIZE = 100;

@Injectable()
export class TrustScoreRecalculationService {
  private readonly logger = new Logger(TrustScoreRecalculationService.name);

  constructor(
    @Inject('IVendorRepository')      private readonly vendorRepo:    IVendorRepository,
    @Inject('ITradeOfferRepository')  private readonly offerRepo:     ITradeOfferRepository,
    @Inject('ITrustScoreRepository')  private readonly trustScoreRepo:ITrustScoreRepository,
    private readonly calculator:  TrustScoreCalculatorService,
    private readonly auditLog:    AuditLogService,
  ) {}

  /**
   * Tam yeniden hesaplama — her ayın 1'i saat 03:00
   * Tüm B2B vendor'ların TrustScore'unu sıfırdan hesaplar.
   */
  @Cron('0 3 1 * *', { name: 'trustScoreMonthly', timeZone: 'Europe/Istanbul' })
  async recalculateAll(): Promise<void> {
    this.logger.log('Aylık TrustScore yeniden hesaplama başladı');
    const vendors = await this.vendorRepo.findByTier(B2B_TIERS);

    let success = 0;
    let failed  = 0;

    for (const v of vendors) {
      try {
        await this.calculator.recalculate(v.id);
        success++;
      } catch (err: unknown) {
        this.logger.error('TrustScore hesaplama hatası', {
          vendorId: v.id,
          error: err instanceof Error ? err.message : String(err),
        });
        failed++;
      }
    }

    this.logger.log(`Aylık TrustScore tamamlandı — ${success} başarılı, ${failed} hatalı`);
  }

  /**
   * Günlük bakım — her gün 03:00
   * 1. inactiveDays takibi (son 90 günde işlem yok → +1/gün, işlem var → 0)
   * 2. Dondurma kontrolü (violationCount >= 3 → isFrozen=true)
   */
  @Cron('0 3 * * *', { name: 'trustScoreDaily', timeZone: 'Europe/Istanbul' })
  async dailyMaintenance(): Promise<void> {
    this.logger.log('Günlük TrustScore bakımı başladı');
    await Promise.all([
      this.updateInactivityTracking(),
      this.applyAutoFreeze(),
    ]);
    this.logger.log('Günlük TrustScore bakımı tamamlandı');
  }

  /**
   * inactiveDays güncelleme:
   * - Son INACTIVITY_THRESHOLD_DAYS gün içinde COMPLETED/CLOSED offer varsa → inactiveDays = 0
   * - Yoksa → inactiveDays += 1
   */
  private async updateInactivityTracking(): Promise<void> {
    const vendors = await this.vendorRepo.findByTier(B2B_TIERS);
    const cutoff  = new Date(Date.now() - INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

    let active = 0;
    let inactive = 0;

    for (const v of vendors.slice(0, BATCH_SIZE)) {
      try {
        const existing = await this.trustScoreRepo.findByVendorId(v.id);
        if (!existing) continue;

        const props     = (typeof v.getProps === 'function' ? v.getProps() : v) as unknown as Record<string, unknown>;
        const companyId = props['companyId'] as string | undefined;

        let hasRecentActivity = false;
        if (companyId) {
          const recent = await this.offerRepo.findByCompanyWithFilters(
            companyId, 0, 1, ['COMPLETED', 'CLOSED'],
          );
          const latestOffer = recent.items[0];
          if (latestOffer) {
            const offerProps = (typeof latestOffer.getProps === 'function' ? latestOffer.getProps() : latestOffer) as unknown as Record<string, unknown>;
            const updatedAt  = offerProps['updatedAt'] as Date | undefined;
            hasRecentActivity = updatedAt ? updatedAt >= cutoff : false;
          }
        }

        const newInactiveDays = hasRecentActivity ? 0 : (existing.inactiveDays ?? 0) + 1;
        await this.trustScoreRepo.updateScore(v.id, { inactiveDays: newInactiveDays });

        hasRecentActivity ? active++ : inactive++;
      } catch (err: unknown) {
        this.logger.error('inactiveDays güncelleme hatası', {
          vendorId: v.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.log(`inactiveDays güncellendi — ${active} aktif, ${inactive} inaktif vendor`);
  }

  /**
   * Otomatik dondurma — violationCount >= FREEZE_VIOLATION_THRESHOLD
   */
  private async applyAutoFreeze(): Promise<void> {
    const candidates = await this.trustScoreRepo.findFreezeCandidates(FREEZE_VIOLATION_THRESHOLD);
    if (candidates.length === 0) return;

    this.logger.warn(`${candidates.length} vendor otomatik dondurma adayı`);

    for (const { vendorId, violationCount } of candidates) {
      try {
        const existing = await this.trustScoreRepo.findByVendorId(vendorId);
        const newScore = Number(existing?.score?.toString() ?? 0);

        await this.trustScoreRepo.updateScore(vendorId, {
          isFrozen:        true,
          level:           'FROZEN',
          violationCount,
          lastCalculatedAt: new Date(),
        });

        await this.auditLog.log({
          actorId:      'SYSTEM',
          action:       'TRUST_SCORE_AUTO_FROZEN',
          resourceType: 'TrustScore',
          resourceId:   vendorId,
          oldValue:     { isFrozen: false, level: scoreToLevel(newScore, false) },
          newValue:     { isFrozen: true, level: 'FROZEN', violationCount, reason: `${violationCount}. uyumluluk ihlali` },
        });

        this.logger.warn(`Vendor donduruldu: ${vendorId} (${violationCount} ihlal)`);
      } catch (err: unknown) {
        this.logger.error('Otomatik dondurma hatası', {
          vendorId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  /** Manuel tetikleme — admin endpoint için */
  async runFullRecalculation(): Promise<{ total: number; success: number; failed: number }> {
    const vendors = await this.vendorRepo.findByTier(B2B_TIERS);
    let success = 0;
    let failed  = 0;

    for (const v of vendors) {
      try {
        await this.calculator.recalculate(v.id);
        success++;
      } catch {
        failed++;
      }
    }

    return { total: vendors.length, success, failed };
  }
}
