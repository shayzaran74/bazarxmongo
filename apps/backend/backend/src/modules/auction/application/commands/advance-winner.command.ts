// apps/backend/src/modules/auction/application/commands/advance-winner.command.ts
export class AdvanceWinnerCommand {
  constructor(
    public readonly auctionId: string,
    public readonly adminId: string,
  ) {}
}
