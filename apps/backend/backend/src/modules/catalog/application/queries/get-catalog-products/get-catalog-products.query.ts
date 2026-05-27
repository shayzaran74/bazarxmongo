export class GetCatalogProductsQuery {
  constructor(
    public readonly filters: {
      search?: string;
      brandId?: string;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      isFeatured?: boolean;
      isSpecialOffer?: boolean;
      isFlashSale?: boolean;
      page?: number;
      limit?: number;
      vendorId?: string;
      vendorType?: string;
      excludeVendorTypes?: string[];
    } = {}
  ) {}
}
