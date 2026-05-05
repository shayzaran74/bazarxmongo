// apps/backend/src/modules/commerce/application/commands/open-order-dispute.command.ts

export class OpenOrderDisputeCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly description?: string,
    public readonly evidenceUrls?: string[],
  ) {}
}
