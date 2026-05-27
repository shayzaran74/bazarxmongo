// apps/backend/src/modules/barter/application/commands/submit-shipping.command.ts

export class SubmitShippingCommand {
  constructor(
    public readonly sessionId: string,
    public readonly actorUserId: string,
    public readonly vendorId: string,
    public readonly trackingCode: string,
    public readonly carrier: string,
  ) {}
}
