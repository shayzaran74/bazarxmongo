export class GetVendorProductsQuery {
  constructor(
    public readonly userId: string,
    public readonly filters: {
      search?: string;
      categoryId?: string;
      limit?: number;
    }
  ) {}
}
