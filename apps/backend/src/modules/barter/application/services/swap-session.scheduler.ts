// apps/backend/src/modules/barter/application/services/swap-session.scheduler.ts
// SwapSchedulerService — Master Plan v4.3 §2 SwapSession Zaman Aşımı
//
// Zamanlama: Her gece 02:05 (BarterMatchScheduler 02:00'da çalışır, bu 5 dk sonra)
//
// Düzeltmeler (2026-05-21):
//   1. setInterval → @Cron ile gerçek 02:05 zamanlaması
//   2. deadlineAt → timeoutAt (schema field adı düzeltmesi)
//   3. PENDING_COLLATERAL schema'ya eklendi

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { CommissionSettlementService } from './commission-settlement.service';
import { SurplusItem as SurplusItemModel } from '@barterborsa/shared-persistence/schemas/backend/surplusItem.schema';
import { BarterPart as BarterPartModel } from '@barterborsa/shared-persistence/schemas/backend/barterPart.schema';
import { RedisService } from '@barterborsa/shared-security';
import type { SwapSession } from '../../domain/entities/swap-session.entity';

const BATCH_SIZE = 50;
const LOCK_KEY = 'scheduler:swap-session:lock';
const LOCK_TTL_SECONDS = 55;

const TIMEOUT_ELIGIBLE_STATUSES: SwapSessionStatus[] = [
  SwapSessionStatus.PENDING_COLLATERAL,
  SwapSessionStatus.ACTIVE,
  SwapSessionStatus.SHIPPING,
];

@Injectable()
export class SwapSchedulerService {
  private readonly logger = new Logger(SwapSchedulerService.name);
  private readonly AUTO_RELEASE_SLA_DAYS = 3;

  constructor(
    @Inject('ISwapSessionRepository') private readonly swapRepo:  ISwapSessionRepository,
    @Inject('ITradeOfferRepository')  private readonly offerRepo: ITradeOfferRepository,
    private readonly auditLog:        AuditLogService,
    private readonly financialGateway:FinancialGatewayService,
    private readonly commissionSettlement: CommissionSettlementService,
    private readonly redisService:    RedisService,
  ) {}

  @Cron('5 2 * * *', { name: 'swapSessionTimeout', timeZone: 'Europe/Istanbul' })
  async checkTimeouts(): Promise<void> {
    const locked = await this.redisService.get(LOCK_KEY);
    if (locked === '1') {
      this.logger.debug('Kilit meşgul — diğer instance çalışıyor, atlanıyor');
      return;
    }
    await this.redisService.set(LOCK_KEY, '1', LOCK_TTL_SECONDS);

    try {
      await this.checkTimeoutsUnsafe();
    } finally {
      await this.redisService.del(LOCK_KEY);
    }
  }

  async checkTimeoutsUnsafe(): Promise<void> {
    const now = new Date();
    this.logger.log(`SwapSession timeout taraması başladı — ${now.toISOString()}`);

    let totalTimedOut = 0;

    const reasonMap: Record<string, string> = {
      [SwapSessionStatus.PENDING_COLLATERAL]: 'Teminat yatırılmadan 30 gün geçti',
      [SwapSessionStatus.ACTIVE]:             'Takas oturumu 30 gün içinde tamamlanamadı',
      [SwapSessionStatus.SHIPPING]:           'Gönderim tamamlanmadan süre doldu',
    };

    for (const status of TIMEOUT_ELIGIBLE_STATUSES) {
      try {
        const expired = await this.swapRepo.findByStatusAndDeadlineBefore(status, now, BATCH_SIZE);
        if (expired.length === 0) continue;

        this.logger.log(`${expired.length} ${status} session timeout'a geçiyor`);

        for (const session of expired) {
          await this.transitionToTimeout(session, reasonMap[status] ?? 'Süre aşımı');
          totalTimedOut++;
        }
      } catch (err: unknown) {
        this.logger.error(`${status} timeout taraması hatası:`, err instanceof Error ? err.message : String(err));
      }
    }

    this.logger.log(totalTimedOut > 0
      ? `Timeout taraması tamamlandı — ${totalTimedOut} session TIMEOUT'a geçirildi`
      : 'Timeout geçen swap session bulunamadı'
    );
  }

  async runManually(): Promise<void> {
    this.logger.log('SwapSession timeout taraması manuel tetiklendi');
    await this.checkTimeouts();
  }

  @Cron('0 9 * * 1-5', { name: 'autoReleaseStaleCollaterals', timeZone: 'Europe/Istanbul' })
  async autoReleaseStaleCollaterals(): Promise<void> {
    this.logger.log('Auto-release SLA kontrolü başlıyor...', SwapSchedulerService.name);

    const cutoffDate = new Date(
      Date.now() - this.AUTO_RELEASE_SLA_DAYS * 24 * 60 * 60 * 1000,
    );

    const staleSessions = await this.swapRepo.findByStatusAndPendingReleaseBefore(cutoffDate, BATCH_SIZE);

    for (const session of staleSessions) {
      try {
        const props = session.getProps();
        if (!props.initiatorHoldId || !props.receiverHoldId) {
          this.logger.warn(
            `Session ${session.id} holdId eksik — atlanıyor`,
            SwapSchedulerService.name,
          );
          continue;
        }

        // Komisyon önce capture edilir (HELD değilse no-op). Hata olursa teminat serbest
        // bırakılmaz; session PENDING_RELEASE kalır ve sonraki taramada yeniden denenir.
        await this.commissionSettlement.captureOnCompletion(session.id);

        await this.financialGateway.releaseFunds(
          props.initiatorHoldId,
          `auto-release-${session.id}-initiator`,
        );
        await this.financialGateway.releaseFunds(
          props.receiverHoldId,
          `auto-release-${session.id}-receiver`,
        );

        session.releaseCollateral();
        session.complete();
        await this.swapRepo.save(session);

        await this.auditLog.log({
          actorId:      'SYSTEM',
          action:       'SWAP_AUTO_RELEASED',
          resourceType: 'SwapSession',
          resourceId:   session.id,
          newValue:     { collateralStatus: 'RELEASED', autoReleasedAt: new Date().toISOString() },
        });

        this.logger.log(
          `Session ${session.id} SLA aşımı — teminat otomatik serbest bırakıldı`,
          SwapSchedulerService.name,
        );
      } catch (err: unknown) {
        this.logger.error(
          `Session ${session.id} auto-release başarısız: ${err instanceof Error ? err.message : String(err)}`,
          SwapSchedulerService.name,
        );
      }
    }
  }

  private async transitionToTimeout(session: SwapSession, reason: string): Promise<void> {
    const props = session.getProps();
    const hasHoldIds = props.fromCollateralHoldId && props.toCollateralHoldId;

    try {
      if (hasHoldIds) {
        await this.refundCollateral(session.id, props.fromCollateralHoldId!, props.toCollateralHoldId!);
      }

      // Takas gerçekleşmedi — bloke komisyon (varsa) iade edilir (HELD değilse no-op)
      await this.commissionSettlement.refundOnCancellation(session.id);

      // Timeout'ta SurplusItem.blockedQuantity düşür — session'a ait surplusItemId'leri bul
      await this.releaseBlockedQuantities(session.id);

      session.markTimeout();
      await this.swapRepo.save(session);

      await this.auditLog.log({
        actorId:      'SYSTEM',
        action:       'SWAP_SESSION_TIMEOUT',
        resourceType: 'SwapSession',
        resourceId:   session.id,
        oldValue:     { status: props.status },
        newValue:     {
          status:            SwapSessionStatus.TIMEOUT,
          reason,
          timeoutAt:         props.timeoutAt?.toISOString() ?? null,
          collateralRefunded:hasHoldIds,
        },
      });

      this.logger.log('Session TIMEOUT', { id: session.id, reason, from: props.status });
    } catch (err: unknown) {
      this.logger.warn(`Domain geçişi başarısız — direkt updateStatus: ${session.id}`);
      await this.swapRepo.updateStatus(session.id, SwapSessionStatus.TIMEOUT);

      await this.auditLog.log({
        actorId:      'SYSTEM',
        action:       'SWAP_SESSION_TIMEOUT_FALLBACK',
        resourceType: 'SwapSession',
        resourceId:   session.id,
        newValue:     { reason, error: err instanceof Error ? err.message : String(err) },
      });
    }
  }

  private async releaseBlockedQuantities(swapSessionId: string): Promise<void> {
    const parts = await BarterPartModel.find({ swapSessionId }).lean();
    for (const part of parts) {
      const surplusItemId = (part as unknown as { surplusItemId?: string }).surplusItemId;
      if (!surplusItemId) continue;
      try {
        await SurplusItemModel.updateOne(
          { _id: surplusItemId },
          {
            $inc: { blockedQuantity: -1 },
            $set: { status: 'ACTIVE' },
          },
        );
      } catch (err: unknown) {
        this.logger.error('blockedQuantity düşürme hatası', {
          surplusItemId,
          swapSessionId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  private async refundCollateral(sessionId: string, fromHoldId: string, toHoldId: string): Promise<void> {
    const base = `swap-timeout-${sessionId}`;
    try {
      await this.financialGateway.refundFunds(fromHoldId, `${base}-from`);
      await this.financialGateway.refundFunds(toHoldId,   `${base}-to`);
      this.logger.log('Teminat iadesi tamamlandı', { sessionId });
    } catch (err: unknown) {
      this.logger.error('Teminat iadesi başarısız', { sessionId, error: err instanceof Error ? err.message : String(err) });
    }
  }
}
