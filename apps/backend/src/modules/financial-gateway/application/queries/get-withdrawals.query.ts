export class GetWithdrawalsQuery {
  constructor(
    public readonly userId?: string,
    public readonly status?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}
}
