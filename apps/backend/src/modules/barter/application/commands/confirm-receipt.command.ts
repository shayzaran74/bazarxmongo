// apps/backend/src/modules/barter/application/commands/confirm-receipt.command.ts

export class ConfirmReceiptCommand {
  constructor(
    public readonly sessionId: string,
    public readonly actorUserId: string,
    public readonly vendorId: string,
  ) {}
}
