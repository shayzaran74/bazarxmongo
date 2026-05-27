// apps/backend/src/modules/commerce/application/commands/bulk-update-order-status.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { BulkUpdateOrderStatusCommand } from './bulk-update-order-status.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

interface BulkResult {
  succeeded: string[];
  failed: Array<{ orderId: string; error: string }>;
}

@CommandHandler(BulkUpdateOrderStatusCommand)
export class BulkUpdateOrderStatusHandler implements ICommandHandler<BulkUpdateOrderStatusCommand> {
  private readonly logger = new Logger(BulkUpdateOrderStatusHandler.name);

  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: BulkUpdateOrderStatusCommand): Promise<BulkResult> {
    const { orderIds, status, adminId } = command;
    const result: BulkResult = { succeeded: [], failed: [] };

    // Sıralı işle — bir hata diğerlerini bloklamasın
    for (const orderId of orderIds) {
      try {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
          result.failed.push({ orderId, error: 'Sipariş bulunamadı' });
          continue;
        }
        const previousStatus = order.status;
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
          action: 'ORDER_STATUS_UPDATED_BULK',
          resourceType: 'Order',
          resourceId: orderId,
          oldValue: { status: previousStatus },
          newValue: { status },
        });

        result.succeeded.push(orderId);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.warn(`Sipariş durumu güncellenemedi: ${orderId} → ${status} (${msg})`);
        result.failed.push({ orderId, error: msg });
      }
    }

    return result;
  }
}
