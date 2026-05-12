// apps/backend/src/modules/delivery/application/commands/dispatch-courier.command.ts

export class DispatchCourierCommand {
  constructor(
    public readonly orderId: string,
    public readonly courierId: string,
    public readonly userId: string,
  ) {}
}