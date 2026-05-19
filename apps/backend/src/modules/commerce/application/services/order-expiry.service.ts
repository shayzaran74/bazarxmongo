// apps/backend/src/modules/commerce/application/services/order-expiry.service.ts
// OrderExpiryService — Mongoose migration (ADR-005 Faz 2b)

import { Injectable, Logger, OnModuleDestroy, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { ORDER_PAYMENT_EXPIRY_MS, ORDER_EXPIRY_CHECK_INTERVAL_MS } from '@barterborsa/shared-core';
import { MongoOrderRepository } from '../../infrastructure/persistence/mongo-order.repository';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';

@Injectable()
export class OrderExpiryService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OrderExpiryService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly orderRepo: MongoOrderRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  onApplicationBootstrap(): void {
    void this.cancelExpiredOrders();
    this.intervalHandle = setInterval(
      () => void this.cancelExpiredOrders(),
      ORDER_EXPIRY_CHECK_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async cancelExpiredOrders(): Promise<void> {
    const now = new Date();

    const expiredOrders = await this.orderRepo.findExpiredPending(now);

    if (expiredOrders.length === 0) return;

    this.logger.log(`Süresi dolmuş ${expiredOrders.length} PENDING sipariş iptal ediliyor`);

    for (const order of expiredOrders) {
      try {
        // Siparişi iptal et
        await this.orderRepo.updateStatus(order.id, 'CANCELLED');

        // Rezerve edilen stokları geri al
        const items = order.getProps().items ?? [];
        for (const item of items) {
          await this.listingRepo.releaseStock(
            item.getProps().listingId,
            item.getProps().quantity,
          );
        }

        this.logger.log(`Sipariş iptal edildi ve stok serbest bırakıldı`, {
          orderId: order.id,
          orderNumber: order.getProps().orderNumber.value,
          itemCount: items.length,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error(`Sipariş iptal işlemi başarısız`, {
          orderId: order.id,
          error: msg,
        });
      }
    }
  }
}