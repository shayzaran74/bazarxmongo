// apps/backend/src/modules/commerce/application/services/order-escrow-worker.service.ts
// OrderEscrowWorker — Mongoose migration (ADR-005 Faz 2b)

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { MongoOrderRepository } from '../../infrastructure/persistence/mongo-order.repository';

type EscrowReleaseResult = { success: boolean; error?: string; holdId?: string };

@Injectable()
export class OrderEscrowWorker {
  private static readonly serviceName = 'OrderEscrowWorker';
  private readonly logger = new Logger(OrderEscrowWorker.serviceName);

  constructor(
    private readonly orderRepo: MongoOrderRepository,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleEscrowReleases() {
    this.logger.log('Escrow release taraması başlatıldı...');

    const now = new Date();

    const allOrders = await this.orderRepo.findAll();
    const pendingReleases = allOrders.filter(o =>
      o.getProps().status === 'DELIVERED' &&
      o.getProps().escrowStatus === 'HELD' &&
      o.getProps().escrowReleaseAt &&
      o.getProps().escrowReleaseAt! <= now &&
      o.getProps().escrowHoldId
    ).slice(0, 50);

    if (pendingReleases.length === 0) {
      this.logger.log('Serbest bırakılacak bekleyen ödeme bulunamadı.');
      return;
    }

    this.logger.log(`${pendingReleases.length} adet sipariş için release işlemi başlatılıyor.`);

    for (const order of pendingReleases) {
      try {
        const escrowHoldId = order.getProps().escrowHoldId!;
        const idempotencyKey = `release-order-${order.id}-${order.getProps().orderNumber.value}`;

        this.logger.debug(`Sipariş ${order.getProps().orderNumber.value} için fonlar serbest bırakılıyor (HoldId: ${escrowHoldId})`);

        const result: EscrowReleaseResult = await this.financialGateway.releaseFunds(escrowHoldId, idempotencyKey);

        if (result.success) {
          await this.orderRepo.updateOne(
            order.id,
            {
              escrowStatus: 'RELEASED',
              payoutStatus: 'PAID_TO_VENDOR',
              completedAt: new Date(),
            }
          );
          this.logger.log(`Sipariş ${order.getProps().orderNumber.value} ödemesi satıcıya aktarıldı.`);
        } else {
          this.logger.error(`Sipariş ${order.getProps().orderNumber.value} release başarısız: ${result.error || 'Bilinmeyen hata'}`);
        }
      } catch (error: unknown) {
        this.logger.error(`Sipariş ${order.getProps().orderNumber.value} işlenirken hata oluştu: ${(error instanceof Error ? error.message : String(error))}`);
      }
    }

    this.logger.log('Escrow release taraması tamamlandı.');
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async auditStaleEscrows() {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 7);

    const allOrders = await this.orderRepo.findAll();
    const staleCount = allOrders.filter(o =>
      o.getProps().escrowStatus === 'HELD' &&
      o.getProps().status === 'DELIVERED' &&
      o.getProps().escrowReleaseAt &&
      o.getProps().escrowReleaseAt! <= staleDate
    ).length;

    if (staleCount > 0) {
      this.logger.warn(`${staleCount} adet sipariş 7 günden fazladır HELD durumunda bekliyor!`);
    }
  }
}