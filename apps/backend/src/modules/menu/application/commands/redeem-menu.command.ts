export class RedeemMenuCommand {
  constructor(
    public readonly qrCode:      string,
    public readonly staffUserId: string,  // restoranın tarama yapan personeli
  ) {}
}
