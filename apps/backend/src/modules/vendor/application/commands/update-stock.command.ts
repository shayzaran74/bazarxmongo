export class UpdateStockCommand {
  constructor(
    public readonly listingId: string,
    public readonly userId: string,
    public readonly change: number,
    public readonly reason: string
  ) {}
}
