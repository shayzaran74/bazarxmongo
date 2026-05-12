// apps/backend/src/modules/commerce/application/commands/mark-order-preparing.command.ts

export class MarkOrderPreparingCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string, // Vendor sahibi user (RBAC için)
  ) {}
}
