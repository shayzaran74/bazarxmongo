// apps/backend/src/modules/menu/application/commands/register-go-referral.command.ts
export class RegisterGoReferralCommand {
  constructor(
    public readonly referralCode: string,  // referans verenin kodu
    public readonly refereeId:   string,   // üye olan yeni kullanıcı
    public readonly refereeTier: string,   // aldığı üyelik tier'ı
    public readonly paidAmount:  number,   // ödediği aidat (₺)
  ) {}
}
