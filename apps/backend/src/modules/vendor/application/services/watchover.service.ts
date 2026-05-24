// apps/backend/src/modules/vendor/application/services/watchover.service.ts

import { Injectable, Logger, ForbiddenException, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types } from 'mongoose';
import { IEcosystemOrderRepository } from '../../domain/repositories/i-ecosystem-order.repository';

@Injectable()
export class WatchoverService {
  private readonly logger = new Logger(WatchoverService.name);

  constructor(
    @Inject('IEcosystemOrderRepository')
    private readonly orderRepo: IEcosystemOrderRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Kontrol 1 — maxOrderQtyPerDealer (Bayi Kota Kontrolü)
   * EcosystemOrder koleksiyonunda aggregate ile mevcut aktif sipariş toplamını bulur.
   * Atomic transaction session kullanır — race condition'ı önler.
   */
  async checkDealerQuota(
    dealerId: string,
    productId: string,
    requestedQty: number,
    maxOrderQtyPerDealer: number,
    session: ClientSession,
  ): Promise<void> {
    const totalQty = await this.orderRepo.sumQuantityByDealerAndProduct(
      dealerId,
      productId,
      ['PENDING', 'CONFIRMED'],
      session,
    );

    if (totalQty + requestedQty > maxOrderQtyPerDealer) {
      this.logger.warn({
        msg: 'DEALER_QUOTA_EXCEEDED',
        dealerId,
        productId,
        currentTotal: totalQty,
        requested: requestedQty,
        limit: maxOrderQtyPerDealer,
      });

      throw new ForbiddenException({
        code: 'DEALER_QUOTA_EXCEEDED',
        dealerId,
        productId,
        currentTotal: totalQty,
        requested: requestedQty,
        limit: maxOrderQtyPerDealer,
        remaining: maxOrderQtyPerDealer - totalQty,
      });
    }
  }

  /**
   * Kontrol 2 — Smart Cap (%25 Havuz Payı)
   * Tek siparişte toplam stoğun %25'inden fazlasının alınmasını engeller.
   * Geçmiş siparişlere değil, sadece bu siparişe bakar.
   */
  async checkSmartCap(
    productId: string,
    requestedQty: number,
    totalStock: number,
    session: ClientSession,
  ): Promise<void> {
    const smartCapLimit = Math.floor(totalStock * 0.25);

    if (requestedQty > smartCapLimit) {
      this.logger.warn({
        msg: 'SMART_CAP_EXCEEDED',
        productId,
        requested: requestedQty,
        smartCapLimit,
        totalStock,
      });

      throw new ForbiddenException({
        code: 'SMART_CAP_EXCEEDED',
        productId,
        requested: requestedQty,
        smartCapLimit,
        totalStock,
        message: 'Tek siparişte havuz stoğunun %25inden fazlası alınamaz',
      });
    }
  }
}