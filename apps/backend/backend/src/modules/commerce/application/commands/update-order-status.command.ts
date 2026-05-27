// apps/backend/src/modules/commerce/application/commands/update-order-status.command.ts
import { OrderStatus } from '../../domain/enums/order-status.enum';

export class UpdateOrderStatusCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: OrderStatus,
    public readonly adminId: string,
    public readonly reason?: string,
  ) {}
}
