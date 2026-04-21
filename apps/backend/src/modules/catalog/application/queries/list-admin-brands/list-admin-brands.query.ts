export class ListAdminBrandsQuery {
  constructor(
    public readonly filters: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {}
}
