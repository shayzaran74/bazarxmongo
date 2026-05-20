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
import type { SwapSession } from '../../domain/entities/swap-session.entity';

const BATCH_SIZE = 50;

const TIMEOUT_ELIGIBLE_STATUSES: SwapSessionStatus[] = [
  SwapSessionStatus.PENDING_COLLATERAL,
  SwapSessionStatus.ACTIVE,
  SwapSessionStatus.SHIPPING,
];

@Injectable()
export class SwapSchedulerService {
  private readonly logger = new Logger(SwapSchedulerService.name);

  constructor(
    @Inject('ISwapSessionRepository') private readonly swapRepo:  ISwapSessionRepository,
    @Inject('ITradeOfferRepository')  private readonly offerRepo: ITradeOfferRepository,
    private readonly auditLog:        AuditLogService,
    private readonly financialGateway:FinancialGatewayService,
  ) {}

  @Cron('5 2 * * *', { name: 'swapSessionTimeout', timeZone: 'Europe/Istanbul' })
  async checkTimeouts(): Promise<void> {
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

  private async transitionToTimeout(session: SwapSession, reason: string): Promise<void> {
    const props = session.getProps();
    const hasHoldIds = props.fromCollateralHoldId && props.toCollateralHoldId;

    try {
      if (hasHoldIds) {
        await this.refundCollateral(session.id, props.fromCollateralHoldId!, props.toCollateralHoldId!);
      }

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
