// apps/backend/src/modules/commerce/application/commands/bulk-update-order-status.command.ts
import { OrderStatus } from '../../domain/enums/order-status.enum';

export class BulkUpdateOrderStatusCommand {
  constructor(
    public readonly orderIds: string[],
    public readonly status: OrderStatus,
    public readonly adminId: string,
  ) {}
}
