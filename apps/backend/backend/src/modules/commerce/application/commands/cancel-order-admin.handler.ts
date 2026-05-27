// apps/backend/src/modules/commerce/application/commands/cancel-order-admin.handler.ts
// CancelOrderAdminHandler — Mongoose migration (ADR-005 Faz 2b)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CancelOrderAdminCommand } from './cancel-order-admin.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { MongoOrderRepository } from '../../infrastructure/persistence/mongo-order.repository';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(CancelOrderAdminCommand)
export class CancelOrderAdminHandler implements ICommandHandler<CancelOrderAdminCommand> {
  private readonly logger = new Logger(CancelOrderAdminHandler.name);

  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly auditLog:        AuditLogService,
  ) {}

  async execute(command: CancelOrderAdminCommand): Promise<{ orderId: string; status: string }> {
    const { orderId, adminId, reason, refund } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const previousStatus = order.status;
    order.cancel();
    await this.orderRepository.save(order);

    // İptal sebebi ve zamanını Order entity üzerinden işle
    // (order entity cancel() metodu içinde cancelReason/cancelledAt set edilecek)
    // MongoDB'de Order.update() ile güncelle — OrderRepository'ye update metodu ekle
    await (this.orderRepository as MongoOrderRepository).updateCancel(orderId, reason);

    if (refund) {
      this.logger.log(`Sipariş için iade tetiklendi`, { orderId, adminId });
    }

    await this.auditLog.log({
      actorId: adminId,
      action: 'ORDER_CANCELLED_BY_ADMIN',
      resourceType: 'Order',
      resourceId: orderId,
      oldValue: { status: previousStatus },
      newValue: { status: 'CANCELLED', reason, refund: Boolean(refund) },
    });

    return { orderId, status: 'CANCELLED' };
  }
}
