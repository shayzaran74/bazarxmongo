// apps/backend/src/modules/commerce/application/commands/update-order-status.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateOrderStatusCommand } from './update-order-status.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateOrderStatusCommand): Promise<{ orderId: string; status: string }> {
    const { orderId, status, adminId, reason } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const previousStatus = order.status;
    // Domain state machine — geçersiz geçiş DomainException fırlatır
    if (status === 'DELIVERED') {
      order.deliver();
    } else if (status === 'COMPLETED') {
      order.complete();
    } else if (status === 'CANCELLED') {
      order.cancel();
    } else {
      order.transitionTo(status);
    }
    await this.orderRepository.save(order);

    await this.auditLog.log({
      actorId: adminId,
      action: 'ORDER_STATUS_UPDATED',
      resourceType: 'Order',
      resourceId: orderId,
      oldValue: { status: previousStatus },
      newValue: { status, reason: reason ?? null },
    });

    return { orderId, status };
  }
}
