// apps/backend/src/modules/commerce/application/commands/cancel-order-admin.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CancelOrderAdminCommand } from './cancel-order-admin.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(CancelOrderAdminCommand)
export class CancelOrderAdminHandler implements ICommandHandler<CancelOrderAdminCommand> {
  private readonly logger = new Logger(CancelOrderAdminHandler.name);

  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: CancelOrderAdminCommand): Promise<{ orderId: string; status: string }> {
    const { orderId, adminId, reason, refund } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const previousStatus = order.status;
    // Domain state machine — COMPLETED/DISPUTED cancellable değil
    order.cancel();
    await this.orderRepository.save(order);

    // İptal sebebi ve zamanını Prisma üzerinden işle (entity'de setter yok)
    await this.prisma.order.update({
      where: { id: orderId },
      data: { cancelReason: reason, cancelledAt: new Date() },
    });

    // İade gerekiyorsa: ödenmiş siparişler için (refund logic ileride financial-gateway'e bağlanacak)
    if (refund) {
      this.logger.log(`Sipariş için iade tetiklendi`, { orderId, adminId });
      // TODO: FinancialGatewayService.refundFunds çağrısı — holdId order'da yok, payment intent üzerinden bulunmalı
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
