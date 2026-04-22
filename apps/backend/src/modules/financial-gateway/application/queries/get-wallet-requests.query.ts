export class GetWalletRequestsQuery {
  constructor(
    public readonly userId?: string,
    public readonly status?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}
