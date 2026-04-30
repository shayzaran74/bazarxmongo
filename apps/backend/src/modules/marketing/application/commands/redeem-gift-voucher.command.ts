export class RedeemGiftVoucherCommand {
  constructor(
    public readonly userId:  string,
    public readonly code:    string,
    public readonly orderId: string,
  ) {}
}
