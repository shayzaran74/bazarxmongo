// apps/backend/src/modules/commerce/application/services/order-escrow-worker.service.ts
// OrderEscrowWorker — Mongoose migration (ADR-005 Faz 2b)

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { MongoOrderRepository } from '../../infrastructure/persistence/mongo-order.repository';
import { AuditLogService } from '../../../audit/application/audit-log.service';

type EscrowReleaseResult = { success: boolean; error?: string; holdId?: string };

@Injectable()
export class OrderEscrowWorker {
  private static readonly serviceName = 'OrderEscrowWorker';
  private readonly logger = new Logger(OrderEscrowWorker.serviceName);

  constructor(
    private readonly orderRepo: MongoOrderRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
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
        const orderNumber = order.getProps().orderNumber.value;
        const idempotencyKey = `release-order-${order.id}-${orderNumber}`;

        this.logger.debug(`Sipariş ${orderNumber} için fonlar serbest bırakılıyor (HoldId: ${escrowHoldId})`);

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
          // Escrow release audit log — fire-and-forget
          this.auditLog.log({
            actorId:      'SYSTEM',
            action:       'ESCROW_RELEASED',
            resourceType: 'Order',
            resourceId:   order.id,
            oldValue:     { escrowStatus: 'HELD' },
            newValue:     { escrowStatus: 'RELEASED', payoutStatus: 'PAID_TO_VENDOR' },
          }).catch((err: Error) => {
            this.logger.warn('Escrow release audit log yazılamadı', { orderId: order.id, error: err.message });
          });
          this.logger.log(`Sipariş ${orderNumber} ödemesi satıcıya aktarıldı.`);
        } else {
          this.logger.error(`Sipariş ${orderNumber} release başarısız: ${result.error || 'Bilinmeyen hata'}`);
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