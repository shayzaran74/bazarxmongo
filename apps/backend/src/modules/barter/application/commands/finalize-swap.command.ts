// apps/backend/src/modules/barter/application/commands/finalize-swap.command.ts

export class FinalizeSwapCommand {
  constructor(
    public readonly sessionId: string,
    public readonly actorUserId: string,
    public readonly vendorId: string,
  ) {}
}
