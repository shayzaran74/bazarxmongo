export class GetWalletTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly accountType?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}
}
