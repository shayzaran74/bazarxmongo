// apps/backend/src/modules/commerce/application/commands/resolve-order-dispute.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ResolveOrderDisputeCommand, OrderDisputeResolution } from './resolve-order-dispute.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(ResolveOrderDisputeCommand)
export class ResolveOrderDisputeHandler implements ICommandHandler<ResolveOrderDisputeCommand> {
  private readonly logger = new Logger(ResolveOrderDisputeHandler.name);

  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @Inject('IDisputeRepository') private readonly disputeRepository: IDisputeRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ResolveOrderDisputeCommand): Promise<{ success: boolean }> {
    const { disputeId, adminId, resolution, adminNote } = command;

    const dispute = await this.disputeRepository.findById(disputeId);
    if (!dispute) throw new NotFoundException('İhtilaf kaydı bulunamadı.');

    if (dispute.status !== 'OPEN' && dispute.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Bu ihtilaf zaten sonuçlandırılmış.');
    }

    const order = await this.orderRepository.findById(dispute.orderId);
    if (!order) throw new NotFoundException('İhtilaflı sipariş bulunamadı.');

    const holdId = order.getProps().escrowHoldId;
    const idempotencyKey = `resolve-dispute-${disputeId}`;

    // 1. Finansal Aksiyon Al
    if (resolution === OrderDisputeResolution.REFUND) {
      if (!holdId) throw new BadRequestException('Siparişin ödeme referansı (holdId) bulunamadı.');
      await this.financialGateway.refundFunds(holdId, idempotencyKey);
      (order as any).props.status = OrderStatus.REFUNDED;
    } 
    else if (resolution === OrderDisputeResolution.RELEASE) {
      if (!holdId) throw new BadRequestException('Siparişin ödeme referansı (holdId) bulunamadı.');
      await this.financialGateway.releaseFunds(holdId, idempotencyKey);
      (order as any).props.status = OrderStatus.COMPLETED;
    }
    else if (resolution === OrderDisputeResolution.REJECT) {
      // Sadece itirazı reddet, siparişi eski durumuna (DELIVERED) döndür
      (order as any).props.status = OrderStatus.DELIVERED;
    }

    // 2. İhtilaf Durumunu Güncelle
    await this.disputeRepository.save({
      id: disputeId,
      status: 'RESOLVED',
      adminNote,
      resolutionType: resolution,
      resolvedAt: new Date(),
    });

    // 3. Sipariş Durumunu Güncelle
    await this.orderRepository.save(order);

    // 4. Logla
    await this.auditLog.log({
      actorId: adminId,
      action: 'ORDER_DISPUTE_RESOLVED',
      resourceType: 'Dispute',
      resourceId: disputeId,
      newValue: { resolution, adminNote },
    });

    return { success: true };
  }
}
