export class DeleteVendorProductCommand {
  constructor(
    public readonly userId: string,
    public readonly listingId: string,
  ) {}
}
