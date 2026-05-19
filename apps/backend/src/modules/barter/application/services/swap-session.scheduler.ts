// apps/backend/src/modules/barter/application/services/swap-session.scheduler.ts
// SwapSchedulerService — Master Plan v4.3 §2 SwapSession Zaman Aşımı
// Her gece 02:00'de çalışır (BarterMatchScheduler'dan sonra).
// Timeout geçen PENDING_COLLATERAL ve ACTIVE session'ları TIMEOUT'a geçirir.

import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, Inject } from '@nestjs/common';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';

const TICK_INTERVAL_MS = 60 * 60 * 1000; // 1 saat
const BATCH_SIZE = 50;

@Injectable()
export class SwapSchedulerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(SwapSchedulerService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('ISwapSessionRepository') private readonly swapRepo: ISwapSessionRepository,
    @Inject('ITradeOfferRepository') private readonly offerRepo: ITradeOfferRepository,
    private readonly auditLog: AuditLogService,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  onApplicationBootstrap(): void {
    setTimeout(() => {
      void this.checkTimeouts();
      this.intervalHandle = setInterval(() => void this.checkTimeouts(), TICK_INTERVAL_MS);
    }, 30_000); // Sistem yüklenene kadar 30 saniye bekle
    this.logger.log('SwapSchedulerService başlatıldı');
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  /**
   * checkTimeouts — Master Plan v4.3 §2
   * Zaman aşımına uğramış swap session'ları TIMEOUT'a geçirir.
   * 1. deadlineAt < now olan PENDING_COLLATERAL ve ACTIVE session'ları bul
   * 2. Her birinde state machine üzerinden transitionTo(TIMEOUT) çağır
   * 3. Audit log yaz
   */
  async checkTimeouts(): Promise<void> {
    const now = new Date();

    try {
      // 1. PENDING_COLLATERAL timeout — teminat yatırılmadan süre dolanlar
      const pendingExpired = await this.swapRepo.findByStatusAndDeadlineBefore(
        SwapSessionStatus.PENDING_COLLATERAL,
        now,
        BATCH_SIZE,
      );

      if (pendingExpired.length > 0) {
        this.logger.log(`${pendingExpired.length} PENDING_COLLATERAL session timeout'a geçiyor`);
        for (const session of pendingExpired) {
          await this.transitionToTimeout(session, 'Teminat yatırılmadan 30 gün geçti');
        }
      }

      // 2. ACTIVE timeout — takas süreci tamamlanmadan süre dolanlar
      const activeExpired = await this.swapRepo.findByStatusAndDeadlineBefore(
        SwapSessionStatus.ACTIVE,
        now,
        BATCH_SIZE,
      );

      if (activeExpired.length > 0) {
        this.logger.log(`${activeExpired.length} ACTIVE session timeout'a geçiyor`);
        for (const session of activeExpired) {
          await this.transitionToTimeout(session, 'Takas oturumu 30 gün içinde tamamlanamadı');
        }
      }

      // 3. SHIPPING timeout — gönderim yapılmadan süre dolanlar (opsiyonel ek güvenlik)
      const shippingExpired = await this.swapRepo.findByStatusAndDeadlineBefore(
        SwapSessionStatus.SHIPPING,
        now,
        BATCH_SIZE,
      );

      if (shippingExpired.length > 0) {
        this.logger.log(`${shippingExpired.length} SHIPPING session timeout'a geçiyor`);
        for (const session of shippingExpired) {
          await this.transitionToTimeout(session, 'Gönderim tamamlanmadan süre doldu');
        }
      }

      if (
        pendingExpired.length === 0 &&
        activeExpired.length === 0 &&
        shippingExpired.length === 0
      ) {
        this.logger.debug('Timeout geçen swap session bulunamadı');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('SwapSchedulerService checkTimeouts hatası', { error: msg });
    }
  }

  private async transitionToTimeout(session: any, reason: string): Promise<void> {
    try {
      const props = session;
      const hasHoldIds = props.fromCollateralHoldId && props.toCollateralHoldId;

      // Teminat iadesi — TIMEOUT durumunda her iki tarafın hold'larını geri al
      if (hasHoldIds) {
        const timeoutBase = `swap-timeout-${session.id}`;
        try {
          // TIMEOUT = her iki taraf da onaylamadı → teminat iade
          await this.financialGateway.refundFunds(
            props.fromCollateralHoldId,
            `${timeoutBase}-from-refund`,
          );
          await this.financialGateway.refundFunds(
            props.toCollateralHoldId,
            `${timeoutBase}-to-refund`,
          );
          this.logger.log('Timeout teminat iadeleri yapıldı', {
            sessionId: session.id,
            fromHoldId: props.fromCollateralHoldId,
            toHoldId: props.toCollateralHoldId,
          });
        } catch (refundErr: unknown) {
          const msg = refundErr instanceof Error ? refundErr.message : 'Bilinmeyen hata';
          this.logger.error('Timeout teminat iadesi başarısız', {
            sessionId: session.id,
            error: msg,
          });
        }
      }

      // Domain entity üzerinden validasyonlu geçiş
      const domainSession = this.toDomainSession(session);
      if (domainSession) {
        domainSession.markTimeout();
        await this.swapRepo.save(domainSession);
      } else {
        // Domain entity dönüştürme başarısız olursa direkt DB güncelle
        await this.swapRepo.updateStatus(session.id, SwapSessionStatus.TIMEOUT);
      }

      await this.auditLog.log({
        actorId: 'SYSTEM',
        action: 'SWAP_SESSION_TIMEOUT',
        resourceType: 'SwapSession',
        resourceId: session.id,
        newValue: {
          reason,
          previousStatus: session.status,
          newStatus: SwapSessionStatus.TIMEOUT,
          deadlineAt: session.deadlineAt ? session.deadlineAt.toISOString() : null,
          collateralReleased: hasHoldIds,
        },
      });

      this.logger.log('Swap session timeout geçiş', {
        sessionId: session.id,
        reason,
        collateralReleased: !!hasHoldIds,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Session timeout geçiş hatası', {
        sessionId: session.id,
        error: msg,
      });
    }
  }

  private toDomainSession(doc: any): any | null {
    try {
      const { SwapSession } = require('../../domain/entities/swap-session.entity');
      return SwapSession.createFrom(
        {
          tradeOfferId: doc.tradeOfferId,
          initiatorId: doc.initiatorId,
          receiverId: doc.receiverId,
          shipmentMode: doc.shipmentMode ?? 'CARRIER',
          shipments: doc.shipments,
          escrowId: doc.escrowId,
          collateralAmount: doc.collateralAmount,
          collateralCurrency: doc.collateralCurrency ?? 'TRY',
          collateralStatus: doc.collateralStatus ?? 'PENDING',
          collateralLockedAt: doc.collateralLockedAt,
          collateralReleasedAt: doc.collateralReleasedAt,
          status: doc.status,
          fromCollateralHoldId: doc.fromCollateralHoldId,
          toCollateralHoldId: doc.toCollateralHoldId,
          timeoutAt: doc.deadlineAt,
          completedAt: doc.completedAt,
          cancelledAt: doc.cancelledAt,
          disputedAt: doc.disputedAt,
          parts: doc.parts ?? [],
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
        doc.id,
      );
    } catch {
      return null;
    }
  }
}