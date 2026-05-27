// apps/backend/src/modules/commerce/application/commands/ship-order-item.command.ts

export class ShipOrderItemCommand {
  constructor(
    public readonly orderItemId:    string,
    public readonly userId:         string,
    public readonly trackingNumber: string,
    public readonly carrier:        string,
  ) {}
}
