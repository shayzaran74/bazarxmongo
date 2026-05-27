// apps/backend/src/modules/commerce/application/commands/mark-order-ready.handler.ts
// MarkOrderReadyHandler — Mongoose migration (ADR-005 Faz 2b)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { MarkOrderReadyCommand } from './mark-order-ready.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { MongoVendorRepository } from '../../../vendor/infrastructure/persistence/mongo-vendor.repository';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(MarkOrderReadyCommand)
export class MarkOrderReadyHandler implements ICommandHandler<MarkOrderReadyCommand> {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly vendorRepo:       MongoVendorRepository,
    private readonly auditLog:          AuditLogService,
  ) {}

  async execute(command: MarkOrderReadyCommand): Promise<{ orderId: string; status: string }> {
    const { orderId, userId } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor || vendor.id !== order.vendorId) {
      throw new ForbiddenException('Bu sipariş üzerinde işlem yetkiniz yok.');
    }
    if (vendor.getProps().vendorType !== 'RESTAURANT') {
      throw new BadRequestException('Bu aksiyon yalnızca RESTAURANT siparişlerinde geçerlidir.');
    }

    const oldStatus = order.status;
    order.markReady();
    await this.orderRepository.save(order);

    await this.auditLog.log({
      actorId:      userId,
      action:       'ORDER_MARKED_READY',
      resourceType: 'Order',
      resourceId:   orderId,
      oldValue:     { status: oldStatus },
      newValue:     { status: order.status },
    });

    return { orderId, status: order.status };
  }
}
