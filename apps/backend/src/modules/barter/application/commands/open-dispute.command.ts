// apps/backend/src/modules/barter/application/commands/open-dispute.command.ts

export class OpenDisputeCommand {
  constructor(
    public readonly sessionId: string,
    public readonly actorUserId: string,
    public readonly vendorId: string,
    public readonly reason: string,
  ) {}
}
