export class GetCatalogProductsQuery {
  constructor(
    public readonly filters: {
      search?: string;
      categoryId?: string;
      isFeatured?: boolean;
      isSpecialOffer?: boolean;
      isFlashSale?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ) {}
}
