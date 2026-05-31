// apps/backend/src/modules/bazarxgo/application/services/go-payout.scheduler.ts
// BazarX Go restoran hakediş (payout) batch işi (bazarxgoplan.md Faz 3, Seçenek B).
// Dispute penceresi geçmiş, teslimat tahsilatı yapılmış (CAPTURED) ve hakedişi PENDING olan
// siparişlerde platform cüzdanından restoran hesabına TransferBetweenUsers ile ödeme yapar.

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { IGoOrderRepository } from '../../domain/repositories/go-order.repository.interface';
import { IGoRestaurantRepository } from '../../domain/repositories/go-restaurant.repository.interface';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

const BATCH_SIZE = 100;

@Injectable()
export class GoPayoutScheduler {
  private readonly logger = new Logger(GoPayoutScheduler.name);
  private readonly disputeWindowDays: number;
  private readonly platformAccountId: string;

  constructor(
    @Inject('IGoOrderRepository') private readonly orderRepo: IGoOrderRepository,
    @Inject('IGoRestaurantRepository') private readonly restaurantRepo: IGoRestaurantRepository,
    private readonly financial: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {
    const win = Number(process.env.GO_PAYOUT_DISPUTE_WINDOW_DAYS);
    this.disputeWindowDays = Number.isFinite(win) && win >= 0 ? win : 3;
    this.platformAccountId = process.env.BAZARXGO_PLATFORM_ACCOUNT_ID ?? '';
  }

  // Her gün 04:00 — dispute penceresi geçmiş hakedişleri restoranlara aktarır
  @Cron('0 4 * * *', { name: 'goRestaurantPayout', timeZone: 'Europe/Istanbul' })
  async runPayouts(): Promise<void> {
    if (!this.platformAccountId) {
      this.logger.warn('BAZARXGO_PLATFORM_ACCOUNT_ID tanımsız — restoran hakediş batch atlandı');
      return;
    }

    const cutoff = new Date(Date.now() - this.disputeWindowDays * 24 * 60 * 60 * 1000);
    const orders = await this.orderRepo.findPendingPayouts(cutoff, BATCH_SIZE);
    if (orders.length === 0) return;

    const batchId = `go-batch-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
    this.logger.log(`GO hakediş batch başladı: ${orders.length} sipariş — batch=${batchId}`);

    for (const order of orders) {
      try {
        const restaurant = await this.restaurantRepo.findById(order.restaurantId);
        const toUserId = restaurant?.payoutAccountId || restaurant?.ownerUserId;
        if (!toUserId) {
          // Restoran hesabı bağlı değil — hakediş platformda PENDING birikmeye devam eder
          this.logger.warn('Restoran hakediş hesabı (ownerUserId/payoutAccountId) yok — PENDING bırakıldı', {
            orderId: order.id,
            restaurantId: order.restaurantId,
          });
          continue;
        }

        const amount = order.restaurantPayoutAmount ? Number(order.restaurantPayoutAmount.toString()) : 0;
        if (amount <= 0) {
          await this.orderRepo.markPayoutPaid(order.id, batchId);
          continue;
        }

        const res = (await this.financial.transferBetweenUsers({
          fromUserId: this.platformAccountId,
          toUserId,
          amount: amount.toFixed(2),
          note: `BazarXGO hakediş — sipariş ${order.id}`,
          idempotencyKey: `go-payout-${order.id}`,
        })) as { success?: boolean; error?: string };

        if (res?.success) {
          await this.orderRepo.markPayoutPaid(order.id, batchId);
          await this.auditLog.log({
            actorId: 'scheduler',
            action: 'GO_PAYOUT_PAID',
            resourceType: 'GoOrder',
            resourceId: order.id,
            newValue: { toUserId, amount: amount.toFixed(2), batchId },
          });
        } else {
          this.logger.error('GO hakediş transferi başarısız — PENDING kaldı', {
            orderId: order.id,
            error: res?.error,
          });
        }
      } catch (err: unknown) {
        this.logger.error('GO hakediş işlenemedi — PENDING kaldı', {
          orderId: order.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.log(`GO hakediş batch tamamlandı — batch=${batchId}`);
  }
}
