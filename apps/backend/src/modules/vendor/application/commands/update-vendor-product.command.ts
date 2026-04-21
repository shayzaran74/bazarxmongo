export class UpdateVendorProductCommand {
  constructor(
    public readonly userId: string,
    public readonly listingId: string,
    public readonly body: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      isActive?: boolean;
      productImages?: string[];
    }
  ) {}
}
