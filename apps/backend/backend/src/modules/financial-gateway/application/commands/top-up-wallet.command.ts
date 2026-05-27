export class TopUpWalletCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly paymentMethod: string
  ) {}
}
