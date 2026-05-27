export class GetWalletBalanceQuery {
  constructor(
    public readonly userId: string,
    public readonly accountType: string = 'MAIN'
  ) {}
}
