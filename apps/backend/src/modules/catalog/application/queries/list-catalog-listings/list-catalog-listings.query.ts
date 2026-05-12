export class ListCatalogListingsQuery {
  constructor(
    public readonly userId: string,
    public readonly userRole: string,
    public readonly filters: {
      search?: string;
      page?: number;
      limit?: number;
      vendorType?: string;
      scope?: string;
    }
  ) {}
}
