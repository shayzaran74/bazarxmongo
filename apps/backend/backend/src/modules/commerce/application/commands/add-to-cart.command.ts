export class AddToCartCommand {
  constructor(
    public readonly userId: string,
    public readonly listingId?: string,
    public readonly productId?: string,
    public readonly quantity: number = 1,
    public readonly campaignId?: string,
  ) {}
}
