// apps/financial-service/src/modules/wallet/application/queries/get-transactions.query.ts
export class GetTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly accountType?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly accountId?: string,
  ) {}
}
