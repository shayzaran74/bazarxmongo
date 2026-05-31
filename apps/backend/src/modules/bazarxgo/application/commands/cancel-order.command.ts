// apps/backend/src/modules/bazarxgo/application/commands/cancel-order.command.ts

export class CancelGoOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
  ) {}
}
