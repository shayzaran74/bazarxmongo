// apps/backend/src/modules/commerce/application/commands/mark-order-ready.command.ts

export class MarkOrderReadyCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string, // Vendor sahibi user (RBAC için)
  ) {}
}
