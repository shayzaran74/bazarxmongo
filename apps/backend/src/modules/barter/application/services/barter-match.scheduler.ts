// apps/backend/src/modules/barter/application/services/barter-match.scheduler.ts
// BarterMatchScheduler — Master Plan v4.3 §4.4 Batch Matching Engine
// Her gece 02:00'de çalışır (@Cron tetikleyici).

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IWantedItemRepository } from '../../domain/repositories/wanted-item.repository.interface';
import { MatchingService } from './matching.service';
import { CollateralCalculatorService } from './collateral-calculator.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { SurplusItem, SurplusItemProps } from '../../domain/entities/surplus-item.entity';
import { WantedItem } from '../../domain/entities/wanted-item.entity';
import { RedisService } from '@barterborsa/shared-security';

const BATCH_SIZE = 100;
const LOCK_KEY = 'scheduler:barter-match:lock';
const LOCK_TTL_SECONDS = 110;

@Injectable()
export class BarterMatchScheduler {
  private readonly logger = new Logger(BarterMatchScheduler.name);

  constructor(
    @Inject('ISurplusItemRepository') private readonly surplusRepo: ISurplusItemRepository,
    @Inject('ITradeOfferRepository') private readonly offerRepo: ITradeOfferRepository,
    @Inject('ISwapSessionRepository') private readonly swapRepo: ISwapSessionRepository,
    @Inject('IWantedItemRepository') private readonly wantedRepo: IWantedItemRepository,
    private readonly matchingService: MatchingService,
    private readonly collateralCalc: CollateralCalculatorService,
    private readonly auditLog: AuditLogService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * runDailyBatch — Master Plan v4.3 §4.4
   * Her gece 02:00'de otomatik çalışır.
   */
  @Cron('0 2 * * *')
  async runDailyBatch(): Promise<void> {
    const locked = await this.redisService.get(LOCK_KEY);
    if (locked === '1') {
      this.logger.debug('Kilit meşgul — diğer instance çalışıyor, atlanıyor');
      return;
    }
    await this.redisService.set(LOCK_KEY, '1', LOCK_TTL_SECONDS);

    try {
      await this.runDailyBatchUnsafe();
    } finally {
      await this.redisService.del(LOCK_KEY);
    }
  }

  async runDailyBatchUnsafe(): Promise<void> {
    const now = new Date();
    this.logger.log('BarterMatchScheduler: Günlük batch matching başlatıldı');

    try {
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

  /** Manuel tetikleme — admin endpoint'ten çağrılır */
  async runManually(): Promise<void> {
    this.logger.log('BarterMatchScheduler: Manuel batch matching tetiklendi');
    await this.runDailyBatchUnsafe();
  }

  private async processSurplusForMatch(surplus: SurplusItem): Promise<{ matched: boolean; reason?: string }> {
    const surplusProps: SurplusItemProps = surplus.getProps();
    const matchPreference = surplusProps.matchPreference ?? 'FULL_ONLY';

    const wantedItems = await this.findWantedItemsForSurplus(surplusProps);

    if (wantedItems.length === 0) {
      return { matched: false, reason: 'Eşleşen wanted item yok' };
    }

    let bestMatch: WantedItem | null = null;
    let bestScore = 0;

    for (const wanted of wantedItems) {
      const score = this.matchingService.calculateMatchScore(surplus, wanted);
      if (score > bestScore && score >= 50) {
        bestScore = score;
        bestMatch = wanted;
      }
    }

    if (!bestMatch) {
      return { matched: false, reason: 'Yeterli eşleşme skoru yok (min: 50)' };
    }

    if (matchPreference === 'FULL_ONLY' && bestScore < 80) {
      return { matched: false, reason: 'FULL_ONLY: Eşleşme skoru yeterli değil (min: 80)' };
    }

    const collateralAmount = this.collateralCalc.calculateCollateral(
      surplusProps.estimatedValue ?? surplusProps.unitPrice ?? 0,
    );

    await this.createSwapSession(surplus, bestMatch, collateralAmount, bestScore);

    return { matched: true };
  }

  private async findWantedItemsForSurplus(surplusProps: SurplusItemProps): Promise<WantedItem[]> {
    const category = surplusProps.category;
    if (!category) return [];

    try {
      const wantedItems = await this.wantedRepo.findAll();
      return wantedItems.filter(w => {
        const props = w.getProps();
        return props.categoryId === category && props.isActive && props.status === 'ACTIVE';
      });
    } catch {
      return [];
    }
  }

  private async createSwapSession(
    surplus: SurplusItem,
    wanted: WantedItem,
    collateralAmount: number,
    matchScore: number,
  ): Promise<void> {
    const surplusProps = surplus.getProps();
    const wantedProps = wanted.getProps();

    const initiatorId = surplusProps.companyId;
    const receiverId = wantedProps.companyId;

    if (!initiatorId || !receiverId) {
      this.logger.warn('SwapSession oluşturulamadı: taraflardan biri eksik', {
        initiatorId,
        receiverId,
      });
      return;
    }

    if (initiatorId === receiverId) {
      this.logger.warn('Ekonomi içi takas engellendi', { initiatorId, receiverId });
      return;
    }

    const { SwapSession } = await import('../../domain/entities/swap-session.entity');
    const session = SwapSession.create(
      'batch-match',
      initiatorId,
      receiverId,
      collateralAmount,
      30,
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
