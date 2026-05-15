// apps/backend/src/modules/commerce/application/commands/cancel-order-admin.command.ts
export class CancelOrderAdminCommand {
  constructor(
    public readonly orderId: string,
    public readonly adminId: string,
    public readonly reason: string,
    public readonly refund: boolean = false,
  ) {}
}
