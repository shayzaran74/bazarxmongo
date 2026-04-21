export class ListAdminOrdersQuery {
  constructor(
    public readonly filters: {
      status?: string;
      vendorId?: string;
      page?: number;
      limit?: number;
    }
  ) {}
}
