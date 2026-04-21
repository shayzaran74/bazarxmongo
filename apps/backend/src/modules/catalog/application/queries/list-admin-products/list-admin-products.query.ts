export class ListAdminProductsQuery {
  constructor(
    public readonly filters: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {}
}
