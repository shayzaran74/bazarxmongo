export class UpdateAdminProductCommand {
  constructor(
    public readonly productId: string,
    public readonly data: {
      name?: string;
      title?: string;
      description?: string;
      gtin?: string;
      barcode?: string;
      brand?: string;
      brandName?: string;
      sku?: string;
      categoryId?: string;
      status?: string;
      price?: number | string;
      stock?: number | string;
      isFeatured?: boolean;
      isSpecialOffer?: boolean;
      isFlashSale?: boolean;
      productImages?: string[];
      image?: string;
    }
  ) {}
}
