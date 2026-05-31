// apps/backend/src/modules/bazarxgo/application/services/go-order-simulation.scheduler.ts
// Simüle durum geçişi: gerçek kurye dispatch F5'te eklenir

import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoOrder, IGoOrder, GoOrderStatusValue } from '@barterborsa/shared-persistence';
import { GoOrderGateway } from '../../infrastructure/websocket/go-order.gateway';
import { GoOrderSettlementService } from './go-order-settlement.service';
import { GoOrder as GoOrderEntity } from '../../domain/entities/go-order.entity';
import { GoOrderStatus, DELIVERY_TRANSITIONS, GELAL_TRANSITIONS } from '../../domain/enums/go-order-status.enum';
import { GoOrderMode } from '../../domain/enums/go-order-mode.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';

// Bir durumdan sonraki duruma geçiş için bekleme süresi (saniye)
const ADVANCE_AFTER_SECONDS: Partial<Record<GoOrderStatus, number>> = {
  [GoOrderStatus.RECEIVED]:  25,
  [GoOrderStatus.PREPARING]: 50,
  [GoOrderStatus.ON_WAY]:    80,
  [GoOrderStatus.READY]:     40,
};

@Injectable()
export class GoOrderSimulationScheduler {
  constructor(
    @InjectModel(GoOrder.name) private readonly orderModel: Model<IGoOrder>,
    private readonly gateway: GoOrderGateway,
    private readonly auditLog: AuditLogService,
    private readonly settlement: GoOrderSettlementService,
  ) {}

  // Her 15 saniyede bir çalışır — simüle geçişler için yeterli
  @Cron('*/15 * * * * *')
  async advancePendingOrders(): Promise<void> {
    const cutoff = new Date();

    // Teslimat edilmemiş / iptal edilmemiş tüm siparişleri al
    const active = await this.orderModel.find({
      status: { $in: ['received', 'preparing', 'on_way', 'ready'] },
    }).lean().exec();

    for (const doc of active) {
      const status = doc.status as GoOrderStatus;
      const waitSec = ADVANCE_AFTER_SECONDS[status];
      if (!waitSec) continue;

      const elapsedSec = (cutoff.getTime() - new Date(doc.updatedAt).getTime()) / 1000;
      if (elapsedSec < waitSec) continue;

      // Domain entity ile geçişi doğrula
      const order = GoOrderEntity.createFrom(
        {
          userId: doc.userId,
          restaurantId: doc.restaurantId,
          restaurantName: doc.restaurantName,
          items: doc.items.map(i => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: Number(i.price.toString()),
            qty: i.qty,
          })),
          mode: doc.mode as GoOrderMode,
          subtotal: Number(doc.subtotal.toString()),
          deliveryFee: Number(doc.deliveryFee.toString()),
          discount: Number(doc.discount.toString()),
          total: Number(doc.total.toString()),
          couponCode: doc.couponCode,
          status,
          holdId: doc.holdId,
          estimatedMinutes: doc.estimatedMinutes,
          addressLine: doc.addressLine,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
        doc.id,
      );

      try {
        order.advance();
      } catch {
        // Geçiş mümkün değilse atla
        continue;
      }

      const newStatus = order.getProps().status as GoOrderStatusValue;

      await this.orderModel.updateOne(
        { id: doc.id },
        { $set: { status: newStatus, updatedAt: new Date() } },
      ).exec();

      this.gateway.notifyStatusChange({
        orderId: doc.id,
        status: newStatus,
        updatedAt: new Date(),
      });

      // Teslimata ulaşıldıysa ödeme blokajını platforma capture et
      if (newStatus === GoOrderStatus.DELIVERED) {
        await this.settlement.captureOnDelivery(doc.id);
      }

      await this.auditLog.log({
        actorId: 'scheduler',
        action: 'GO_ORDER_AUTO_ADVANCED',
        resourceType: 'GoOrder',
        resourceId: doc.id,
        oldValue: { status },
        newValue: { status: newStatus },
      });
    }
  }
}
