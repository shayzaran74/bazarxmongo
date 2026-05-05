// apps/backend/src/modules/commerce/application/commands/resolve-order-dispute.command.ts

export enum OrderDisputeResolution {
  REFUND = 'REFUND',
  RELEASE = 'RELEASE',
  REJECT = 'REJECT'
}

export class ResolveOrderDisputeCommand {
  constructor(
    public readonly disputeId: string,
    public readonly adminId: string,
    public readonly resolution: OrderDisputeResolution,
    public readonly adminNote: string,
  ) {}
}
