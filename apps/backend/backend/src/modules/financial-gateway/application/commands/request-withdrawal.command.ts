export class RequestWithdrawalCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly iban: string,
    public readonly accountHolder: string,
    public readonly bankName: string
  ) {}
}
