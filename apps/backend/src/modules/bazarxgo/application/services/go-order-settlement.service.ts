// apps/backend/src/modules/bazarxgo/application/services/go-order-settlement.service.ts
// GO sipariş ödeme mutabakatı (Seçenek B): place-order'da HELD bloke edilen tutar
// teslimatta PLATFORM hesabına capture edilir, iptalde müşteriye iade edilir.
//
// Teslimatta ayrıca restoran hakedişi (place-order'da hesaplanıp persist edilen
// restaurantPayoutAmount) payoutStatus=PENDING'e geçer; gerçek restoran ödemesi
// periyodik batch payout (Faz 3) ile TransferBetweenUsers üzerinden yapılır.

import { Injectable, Logger, Inject } from '@nestjs/common';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { IGoOrderRepository } from '../../domain/repositories/go-order.repository.interface';

@Injectable()
export class GoOrderSettlementService {
  private readonly logger = new Logger(GoOrderSettlementService.name);

  constructor(
    @Inject('IGoOrderRepository') private readonly orderRepo: IGoOrderRepository,
    private readonly financial: FinancialGatewayService,
  ) {}

  /** Teslimatta blokajı platforma capture eder. Idempotent: yalnızca HELD iken çalışır. */
  async captureOnDelivery(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order || order.settlementStatus !== 'HELD' || !order.holdId) return;

    try {
      // releaseFunds → blokajın sellerId'si (PLATFORM) hesabına capture eder
      await this.financial.releaseFunds(order.holdId, `go-capture-${orderId}`);
      await this.orderRepo.updateSettlementStatus(orderId, 'CAPTURED');
      // Restoran hakedişi batch payout için kuyruğa alınır (tutar place-order'da persist edildi)
      await this.orderRepo.updatePayoutStatus(orderId, 'PENDING');
      this.logger.log('GO sipariş ödemesi platforma capture edildi; restoran hakedişi PENDING', { orderId });
    } catch (err: unknown) {
      // Status akışını bozmamak için yutulur ama error seviyesinde loglanır (HELD kalır → manuel/yeniden mutabakat)
      this.logger.error('GO sipariş capture başarısız — settlement HELD kaldı', {
        orderId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /** İptalde blokajı müşteriye iade eder. Idempotent: yalnızca HELD iken çalışır. */
  async refundOnCancellation(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order || order.settlementStatus !== 'HELD' || !order.holdId) return;

    try {
      await this.financial.refundFunds(order.holdId, `go-refund-${orderId}`);
      await this.orderRepo.updateSettlementStatus(orderId, 'REFUNDED');
      // İptal → restoran hakedişi iptal edilir (ödeme yapılmaz)
      await this.orderRepo.updatePayoutStatus(orderId, 'CANCELLED');
      this.logger.log('GO sipariş ödemesi müşteriye iade edildi; hakediş iptal', { orderId });
    } catch (err: unknown) {
      this.logger.error('GO sipariş iadesi başarısız — settlement HELD kaldı', {
        orderId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
