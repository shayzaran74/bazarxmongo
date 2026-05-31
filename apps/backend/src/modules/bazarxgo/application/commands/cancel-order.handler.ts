// apps/backend/src/modules/bazarxgo/application/commands/cancel-order.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { CancelGoOrderCommand } from './cancel-order.command';
import { IGoOrderRepository } from '../../domain/repositories/go-order.repository.interface';
import { GoOrder } from '../../domain/entities/go-order.entity';
import { GoOrderMode } from '../../domain/enums/go-order-mode.enum';
import { GoOrderStatus } from '../../domain/enums/go-order-status.enum';
import { GoOrderStatusValue } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { GoOrderGateway } from '../../infrastructure/websocket/go-order.gateway';
import { GoOrderSettlementService } from '../services/go-order-settlement.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(CancelGoOrderCommand)
export class CancelGoOrderHandler implements ICommandHandler<CancelGoOrderCommand> {
  constructor(
    @Inject('IGoOrderRepository') private readonly orderRepo: IGoOrderRepository,
    private readonly auditLog: AuditLogService,
    private readonly gateway: GoOrderGateway,
    private readonly settlement: GoOrderSettlementService,
  ) {}

  async execute(command: CancelGoOrderCommand): Promise<{ success: boolean; status: string }> {
    const doc = await this.orderRepo.findById(command.orderId);
    if (!doc) throw new DomainException('Sipariş bulunamadı');

    // Veri izolasyonu: yalnızca siparişin sahibi iptal edebilir
    if (doc.userId !== command.userId) {
      throw new ForbiddenException('Bu siparişi iptal etme yetkiniz yok');
    }

    // Domain entity üzerinden iptal geçişini doğrula (yalnızca RECEIVED/PREPARING iptal edilebilir)
    const order = GoOrder.createFrom(
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
        status: doc.status as GoOrderStatus,
        holdId: doc.holdId,
        estimatedMinutes: doc.estimatedMinutes,
        addressLine: doc.addressLine,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
      doc.id,
    );

    order.cancel(); // geçiş geçersizse DomainException fırlatır

    await this.orderRepo.updateStatus(doc.id, GoOrderStatus.CANCELLED as GoOrderStatusValue);

    // Bloke ödemeyi müşteriye iade et (idempotent — yalnızca HELD iken)
    await this.settlement.refundOnCancellation(doc.id);

    this.gateway.notifyStatusChange({
      orderId: doc.id,
      status: GoOrderStatus.CANCELLED as GoOrderStatusValue,
      updatedAt: new Date(),
    });

    await this.auditLog.log({
      actorId: command.userId,
      action: 'GO_ORDER_CANCELLED',
      resourceType: 'GoOrder',
      resourceId: doc.id,
      oldValue: { status: doc.status },
      newValue: { status: GoOrderStatus.CANCELLED },
    });

    return { success: true, status: GoOrderStatus.CANCELLED };
  }
}
