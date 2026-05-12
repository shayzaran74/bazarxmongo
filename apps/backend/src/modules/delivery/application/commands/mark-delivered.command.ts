// apps/backend/src/modules/delivery/application/commands/mark-delivered.command.ts

export class MarkDeliveredCommand {
  constructor(
    public readonly dispatchId: string,
    public readonly userId: string,
  ) {}
}