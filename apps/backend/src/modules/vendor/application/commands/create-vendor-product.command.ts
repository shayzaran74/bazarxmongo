export class CreateVendorProductCommand {
  constructor(
    public readonly userId: string,
    public readonly body: {
      name: string;
      description?: string;
      brand?: string;
      barcode?: string;
      price: number;
      stock: number;
      isActive?: boolean;
      catalogProductId?: string;
      productImages?: string[];
    }
  ) {}
}
