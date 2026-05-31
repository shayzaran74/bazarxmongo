// apps/backend/src/modules/bazarxgo/application/commands/advance-order-status.command.ts

export class AdvanceGoOrderStatusCommand {
  constructor(
    public readonly orderId: string,
    public readonly actorId: string,
  ) {}
}
