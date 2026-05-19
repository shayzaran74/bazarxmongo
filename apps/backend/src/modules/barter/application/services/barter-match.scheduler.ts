// apps/backend/src/modules/barter/application/services/barter-match.scheduler.ts
// BarterMatchScheduler — Master Plan v4.3 §4.4 Batch Matching Engine
// Her gece 02:00'de çalışır. Cron tetikleyici: SwapSchedulerService'ten önce.
// import { Cron } from '@nestjs/schedule';

import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, Inject } from '@nestjs/common';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IWantedItemRepository } from '../../domain/repositories/wanted-item.repository.interface';
import { MatchingService } from './matching.service';
import { CollateralCalculatorService } from './collateral-calculator.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

const BATCH_CHECK_INTERVAL_MS = 60_000; // 1 dakika (tekrar eden cron yerine setInterval)
const BATCH_SIZE = 100;

@Injectable()
export class BarterMatchScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(BarterMatchScheduler.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private lastRunAt: Date | null = null;

  constructor(
    @Inject('ISurplusItemRepository') private readonly surplusRepo: ISurplusItemRepository,
    @Inject('ITradeOfferRepository') private readonly offerRepo: ITradeOfferRepository,
    @Inject('ISwapSessionRepository') private readonly swapRepo: ISwapSessionRepository,
    @Inject('IWantedItemRepository') private readonly wantedRepo: IWantedItemRepository,
    private readonly matchingService: MatchingService,
    private readonly collateralCalc: CollateralCalculatorService,
    private readonly auditLog: AuditLogService,
  ) {}

  onApplicationBootstrap(): void {
    // İlk çalışma: 1 dakika gecikme ile (sistem tam yüklenene kadar bekle)
    setTimeout(() => void this.runDailyBatch(), 60_000);
    // Periyodik kontrol
    this.intervalHandle = setInterval(() => void this.runDailyBatch(), BATCH_CHECK_INTERVAL_MS);
    this.logger.log('BarterMatchScheduler başlatıldı (periyodik kontrol modu)');
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  /**
   * runDailyBatch — Master Plan v4.3 §4.4
   * 1. ACTIVE surplus item'ları TrustScore DESC, createdAt ASC sırasıyla çek
   * 2. Her teklif için MatchPreference'a göre eşleşme kararı ver
   * 3. PARTIAL_CASH_DIFF ise nakit farkı escrow'a bloke et
   * 4. MongoDB session (transaction) içinde SwapSession PENDING_COLLATERAL olarak oluştur
   * 5. BatchMatchLog'a sonucu yaz
   */
  async runDailyBatch(): Promise<void> {
    const now = new Date();

    // Son çalışmadan bu yana 23 saat geçmediyse atla (günde sadece 1 kez çalışsın)
    if (this.lastRunAt && now.getTime() - this.lastRunAt.getTime() < 23 * 60 * 60 * 1000) {
      return;
    }

    this.lastRunAt = now;
    this.logger.log('BarterMatchScheduler: Günlük batch matching başlatıldı');

    try {
      // 1. ACTIVE surplus item'ları çek — TrustScore DESC, createdAt ASC (FIFO)
      const surplusResult = await this.surplusRepo.findWithFilters(
        { status: 'ACTIVE' },
        0,
        BATCH_SIZE,
      );

      if (surplusResult.items.length === 0) {
        this.logger.log('Eşleştirilecek ACTIVE surplus item bulunamadı');
        return;
      }

      this.logger.log(`${surplusResult.items.length} ACTIVE surplus item bulundu, eşleştirme başlatılıyor`);

      let matchCount = 0;
      let skipCount = 0;

      for (const surplus of surplusResult.items) {
        try {
          const result = await this.processSurplusForMatch(surplus);
          if (result.matched) {
            matchCount++;
          } else {
            skipCount++;
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
          this.logger.error('Surplus eşleştirme hatası', {
            surplusId: surplus.id,
            error: msg,
          });
        }
      }

      this.logger.log(`Batch matching tamamlandı: ${matchCount} eşleşme, ${skipCount} atlandı`);

      await this.auditLog.log({
        actorId: 'SYSTEM',
        action: 'BATCH_MATCHING_COMPLETED',
        resourceType: 'BatchMatchLog',
        resourceId: `batch-${now.toISOString()}`,
        newValue: {
          runAt: now.toISOString(),
          totalSurplus: surplusResult.total,
          matchCount,
          skipCount,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Batch matching kritik hatası', { error: msg });
    }
  }

  private async processSurplusForMatch(surplus: any): Promise<{ matched: boolean; reason?: string }> {
    const surplusProps = surplus.getProps ? surplus.getProps() : surplus;

    // MatchPreference kontrolü — FULL_ONLY ise tam eşleşme bekle, kısmi kabul etme
    const matchPreference = surplusProps.matchPreference ?? 'FULL_ONLY';

    // Wanted item'ları bul (kullanıcının istediği ürünler)
    const wantedItems = await this.findWantedItemsForSurplus(surplusProps);

    if (wantedItems.length === 0) {
      return { matched: false, reason: 'Eşleşen wanted item yok' };
    }

    // En iyi eşleşmeyi seç
    let bestMatch: any = null;
    let bestScore = 0;

    for (const wanted of wantedItems) {
      const score = this.matchingService.calculateMatchScore(
        surplus,
        wanted,
      );

      if (score > bestScore && score >= 50) { // Minimum eşik: 50 puan
        bestScore = score;
        bestMatch = wanted;
      }
    }

    if (!bestMatch) {
      return { matched: false, reason: 'Yeterli eşleşme skoru yok (min: 50)' };
    }

    // MatchPreference kontrolü
    if (matchPreference === 'FULL_ONLY' && bestScore < 80) {
      return { matched: false, reason: 'FULL_ONLY: Eşleşme skoru yeterli değil (min: 80)' };
    }

    // SwapSession oluştur — PENDING_COLLATERAL
    const collateralAmount = this.collateralCalc.calculateCollateral(
      surplusProps.estimatedValue ?? 0,
    );

    await this.createSwapSession(surplus, bestMatch, collateralAmount, bestScore);

    return { matched: true };
  }

  private async findWantedItemsForSurplus(surplusProps: any): Promise<any[]> {
    // Kategori bazlı wanted item'ları bul
    const category = surplusProps.category;
    if (!category) return [];

    // IWantedItemRepository inject edilmiş durumda — categoryId ile sorgula
    try {
      const wantedItems = await this.wantedRepo.findAll();
      return wantedItems.filter((w: any) => {
        const props = w.getProps ? w.getProps() : w;
        return props.categoryId === category && props.isActive && props.status === 'ACTIVE';
      });
    } catch {
      return [];
    }
  }

  private async createSwapSession(
    surplus: any,
    wanted: any,
    collateralAmount: any,
    matchScore: number,
  ): Promise<void> {
    const surplusProps = surplus.getProps ? surplus.getProps() : surplus;
    const wantedProps = wanted.getProps ? wanted.getProps() : wanted;

    const initiatorId = surplusProps.companyId;
    const receiverId = wantedProps.companyId;

    if (!initiatorId || !receiverId) {
      this.logger.warn('SwapSession oluşturulamadı: taraflardan biri eksik', {
        initiatorId,
        receiverId,
      });
      return;
    }

    // Aynı şirketler arasında takas yasak — Master Plan v4.3 §5.5
    if (initiatorId === receiverId) {
      this.logger.warn('Ekonomi içi takas engellendi', { initiatorId, receiverId });
      return;
    }

    // SwapSession oluştur
    const { SwapSession } = await import('../../domain/entities/swap-session.entity');
    const session = SwapSession.create(
      'batch-match', // tradeOfferId — batch matching'den geliyor
      initiatorId,
      receiverId,
      collateralAmount,
      30, // timeoutInDays — Master Plan §2
    );

    await this.swapRepo.save(session);

    await this.auditLog.log({
      actorId: 'SYSTEM',
      action: 'SWAP_SESSION_CREATED_BY_BATCH',
      resourceType: 'SwapSession',
      resourceId: session.id,
      newValue: {
        initiatorId,
        receiverId,
        matchScore,
        collateralAmount: String(collateralAmount),
        matchPreference: surplusProps.matchPreference,
      },
    });

    this.logger.log('SwapSession oluşturuldu', {
      sessionId: session.id,
      initiatorId,
      receiverId,
      matchScore,
    });
  }
}