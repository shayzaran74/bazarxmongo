// apps/backend/src/modules/commerce/application/services/order-expiry.service.ts

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ORDER_PAYMENT_EXPIRY_MS, ORDER_EXPIRY_CHECK_INTERVAL_MS } from '@barterborsa/shared-core';

@Injectable()
export class OrderExpiryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderExpiryService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    // Uygulama başlarken ilk kontrolü hemen yap, sonra aralıklı çalıştır
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

    // expiresAt geçmiş ve hâlâ PENDING olan tüm siparişleri bul
    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lte: now, not: null },
      },
      include: {
        orderItems: { select: { listingId: true, quantity: true } },
      },
    });

    if (expiredOrders.length === 0) return;

    this.logger.log(`Süresi dolmuş ${expiredOrders.length} PENDING sipariş iptal ediliyor`);

    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Siparişi iptal et
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'CANCELLED',
              cancelReason: 'Ödeme süresi doldu',
              cancelledAt: now,
            },
          });

          // Rezerve edilen stokları geri al
          for (const item of order.orderItems) {
            await tx.listing.updateMany({
              where: {
                id: item.listingId,
                reservedQuantity: { gte: item.quantity },
              },
              data: {
                availableQuantity: { increment: item.quantity },
                reservedQuantity: { decrement: item.quantity },
              },
            });
          }
        });

        this.logger.log(`Sipariş iptal edildi ve stok serbest bırakıldı`, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          itemCount: order.orderItems.length,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error(`Sipariş iptal işlemi başarısız`, {
          orderId: order.id,
          error: msg,
        });
        // Hata tek siparişi etkilememeli; döngü devam eder
      }
    }
  }
}
