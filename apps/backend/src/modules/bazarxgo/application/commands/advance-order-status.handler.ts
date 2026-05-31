// apps/backend/src/modules/bazarxgo/application/commands/advance-order-status.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AdvanceGoOrderStatusCommand } from './advance-order-status.command';
import { IGoOrderRepository } from '../../domain/repositories/go-order.repository.interface';
import { GoOrder } from '../../domain/entities/go-order.entity';
import { GoOrderMode } from '../../domain/enums/go-order-mode.enum';
import { GoOrderStatus } from '../../domain/enums/go-order-status.enum';
import { GoOrderStatusValue } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { GoOrderGateway } from '../../infrastructure/websocket/go-order.gateway';
import { GoOrderSettlementService } from '../services/go-order-settlement.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(AdvanceGoOrderStatusCommand)
export class AdvanceGoOrderStatusHandler implements ICommandHandler<AdvanceGoOrderStatusCommand> {
  constructor(
    @Inject('IGoOrderRepository') private readonly orderRepo: IGoOrderRepository,
    private readonly auditLog: AuditLogService,
    private readonly gateway: GoOrderGateway,
    private readonly settlement: GoOrderSettlementService,
  ) {}

  async execute(command: AdvanceGoOrderStatusCommand): Promise<{ success: boolean; status: string }> {
    const doc = await this.orderRepo.findById(command.orderId);
    if (!doc) throw new DomainException('Sipariş bulunamadı');

    // Domain entity üzerinden durum geçişini doğrula
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

    const previousStatus = order.getProps().status;
    order.advance();
    const newStatus = order.getProps().status;

    await this.orderRepo.updateStatus(doc.id, newStatus as GoOrderStatusValue);

    // Terminal durumda ödeme mutabakatı: teslimatta capture, iptalde iade
    if (newStatus === GoOrderStatus.DELIVERED) {
      await this.settlement.captureOnDelivery(doc.id);
    } else if (newStatus === GoOrderStatus.CANCELLED) {
      await this.settlement.refundOnCancellation(doc.id);
    }

    // Socket ile canlı bildirim
    this.gateway.notifyStatusChange({
      orderId: doc.id,
      status: newStatus as GoOrderStatusValue,
      updatedAt: new Date(),
    });

    await this.auditLog.log({
      actorId: command.actorId,
      action: 'GO_ORDER_STATUS_ADVANCED',
      resourceType: 'GoOrder',
      resourceId: doc.id,
      oldValue: { status: previousStatus },
      newValue: { status: newStatus },
    });

    return { success: true, status: newStatus };
  }
}
