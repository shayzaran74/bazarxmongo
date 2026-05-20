export class ListAdminBrandsQuery {
  constructor(
    public readonly filters: {
      search?: string;
      status?: string;
      letter?: string;
      page?: number;
      limit?: number;
    }
  ) {}
}
