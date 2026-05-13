export class ListAdminProductsQuery {
  constructor(
    public readonly filters: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
      vendorId?: string;
      vendorOnly?: boolean;
      categoryId?: string;
    }
  ) {}
}
