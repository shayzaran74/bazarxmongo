export class GetVendorOrdersQuery {
  constructor(
    public readonly userId: string,
    public readonly filters: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {}
}
