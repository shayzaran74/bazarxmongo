// apps/backend/src/modules/commerce/application/commands/open-order-dispute.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { OpenOrderDisputeCommand } from './open-order-dispute.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(OpenOrderDisputeCommand)
export class OpenOrderDisputeHandler implements ICommandHandler<OpenOrderDisputeCommand> {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @Inject('IDisputeRepository') private readonly disputeRepository: IDisputeRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: OpenOrderDisputeCommand): Promise<{ success: boolean; disputeId: string }> {
    const { orderId, userId, reason, description, evidenceUrls } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');

    // Sipariş bu kullanıcıya mı ait?
    if (order.getProps().userId !== userId) {
      throw new BadRequestException('Bu sipariş üzerinde işlem yapma yetkiniz yok.');
    }

    // Zaten bir itiraz var mı?
    const existingDispute = await this.disputeRepository.findByOrderId(orderId);
    if (existingDispute) {
      throw new BadRequestException('Bu sipariş için zaten açık bir ihtilaf bulunuyor.');
    }

    // Sadece belirli durumlarda itiraz açılabilir (Teslim edilmiş veya kargoda sorunlu)
    const allowedStatuses = [OrderStatus.DELIVERED, OrderStatus.SHIPPED];
    if (!allowedStatuses.includes(order.getProps().status)) {
      throw new BadRequestException(`Bu aşamadaki (${order.getProps().status}) siparişler için ihtilaf açılamaz.`);
    }

    // 1. İhtilaf kaydını oluştur
    const dispute = await this.disputeRepository.save({
      orderId,
      userId,
      vendorId: order.getProps().vendorId,
      reason,
      description,
      status: 'OPEN',
      evidenceUrls: evidenceUrls || [],
    });

    // 2. Sipariş durumunu güncelle
    // Order domain metodunu kullan — invariant korunmalı
    try {
      order.dispute();
    } catch (e) {
      throw new BadRequestException('Sipariş bu aşamada ihtilafa açılamaz.');
    }
    await this.orderRepository.save(order);

    // 3. Logla
    await this.auditLog.log({
      actorId: userId,
      action: 'ORDER_DISPUTE_OPENED',
      resourceType: 'Order',
      resourceId: orderId,
      newValue: { disputeId: dispute.id, reason },
    });

    return { success: true, disputeId: dispute.id };
  }
}
