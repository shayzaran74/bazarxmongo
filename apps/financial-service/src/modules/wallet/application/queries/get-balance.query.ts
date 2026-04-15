// apps/financial-service/src/modules/wallet/application/queries/get-balance.query.ts
export class GetBalanceQuery {
  constructor(
    public readonly userId: string,
    public readonly accountType: string,
  ) {}
}
