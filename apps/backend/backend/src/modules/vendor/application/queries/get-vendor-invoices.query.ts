export class GetVendorInvoicesQuery {
  constructor(
    public readonly userId: string,
    public readonly filters: {
      page?: number;
      limit?: number;
    }
  ) {}
}
