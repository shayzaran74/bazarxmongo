export class ListVendorProductsQuery {
  constructor(
    public readonly userId: string,
    public readonly filters: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {}
}
