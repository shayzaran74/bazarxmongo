// apps/backend/src/modules/commerce/application/services/order-escrow-worker.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@barterborsa/shared-persistence';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrderEscrowWorker {
  private static readonly serviceName = 'OrderEscrowWorker';
  private readonly logger = new Logger(OrderEscrowWorker.serviceName);

  constructor(
    private readonly prisma: PrismaService,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  /**
   * Her saat başı çalışır. 
   * Teslim edilmiş ve itiraz süresi dolmuş siparişlerin ödemelerini satıcıya aktarır.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleEscrowReleases() {
    this.logger.log('Escrow release taraması başlatıldı...');

    const now = new Date();

    // 1. Kriterleri sağlayan siparişleri bul
    // - Status: DELIVERED
    // - escrowStatus: HELD
    // - escrowReleaseAt <= now
    const pendingReleases = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        escrowStatus: 'HELD',
        escrowReleaseAt: { lte: now },
        escrowHoldId: { not: null },
      } as any,
      take: 50, // Her seferinde 50 kayıt işle (safety first)
    });

    if (pendingReleases.length === 0) {
      this.logger.log('Serbest bırakılacak bekleyen ödeme bulunamadı.');
      return;
    }

    this.logger.log(`${pendingReleases.length} adet sipariş için release işlemi başlatılıyor.`);

    for (const order of pendingReleases) {
      try {
        const idempotencyKey = `release-order-${order.id}-${(order as any).orderNumber}`;
        
        this.logger.debug(`Sipariş ${(order as any).orderNumber} için fonlar serbest bırakılıyor (HoldId: ${(order as any).escrowHoldId})`);

        // Financial Service üzerinden release işlemini tetikle
        const result: any = await this.financialGateway.releaseFunds(
          (order as any).escrowHoldId!,
          idempotencyKey
        );

        if (result.success) {
          // Sipariş kaydını güncelle
          await this.prisma.order.update({
            where: { id: order.id },
            data: {
              escrowStatus: 'RELEASED',
              payoutStatus: 'PAID_TO_VENDOR',
              completedAt: new Date(),
            },
          });
          this.logger.log(`Sipariş ${(order as any).orderNumber} ödemesi satıcıya aktarıldı.`);
        } else {
          this.logger.error(`Sipariş ${(order as any).orderNumber} release başarısız: ${result.error || 'Bilinmeyen hata'}`);
        }
      } catch (error: any) {
        this.logger.error(`Sipariş ${(order as any).orderNumber} işlenirken hata oluştu: ${error.message}`);
      }
    }

    this.logger.log('Escrow release taraması tamamlandı.');
  }

  /**
   * Bonus: Her 12 saatte bir, teslimatı uzun süre önce yapılmış ama release edilmemiş 
   * (belki manuel müdahale bekleyen) kayıtları raporla/logla.
   */
  @Cron(CronExpression.EVERY_12_HOURS)
  async auditStaleEscrows() {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 7); // 7 günden eski olanlar

    const staleCount = await this.prisma.order.count({
      where: {
        escrowStatus: 'HELD',
        status: OrderStatus.DELIVERED,
        escrowReleaseAt: { lte: staleDate },
      }
    });

    if (staleCount > 0) {
      this.logger.warn(`${staleCount} adet sipariş 7 günden fazladır HELD durumunda bekliyor!`);
    }
  }
}
