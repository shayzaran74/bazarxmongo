// apps/backend/src/modules/delivery/application/commands/mark-delivered.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { MarkDeliveredCommand } from './mark-delivered.command';
import { IDeliveryDispatchRepository } from '../../domain/repositories/delivery-dispatch.repository.interface';
import { IOrderRepository } from '../../../commerce/domain/repositories/order.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { OrderStatus } from '../../../commerce/domain/enums/order-status.enum';

@CommandHandler(MarkDeliveredCommand)
export class MarkDeliveredHandler implements ICommandHandler<MarkDeliveredCommand> {
  constructor(
    @Inject('IDeliveryDispatchRepository') private readonly dispatchRepo: IDeliveryDispatchRepository,
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: MarkDeliveredCommand): Promise<{ dispatchId: string; status: string }> {
    const { dispatchId, userId } = command;

    const dispatch = await this.dispatchRepo.findById(dispatchId);
    if (!dispatch) throw new NotFoundException('Teslimat kaydı bulunamadı.');

    dispatch.markDelivered();
    await this.dispatchRepo.save(dispatch);

    // Siparişi DELIVERED'a geçir
    const order = await this.orderRepository.findById(dispatch.orderId);
    if (order && order.status === OrderStatus.OUT_FOR_DELIVERY) {
      order.deliver();
      await this.orderRepository.save(order);
    }

    await this.auditLog.log({
      actorId:      userId,
      action:       'ORDER_DELIVERED',
      resourceType: 'DeliveryDispatch',
      resourceId:   dispatchId,
      newValue:     { status: dispatch.status, deliveredAt: dispatch.deliveredAt },
    });

    return { dispatchId, status: dispatch.status };
  }
}