export type GiftVoucherType = 'BIRTHDAY' | 'ANNIVERSARY' | 'THREE_MONTH' | 'REFERRAL_BONUS' | 'ADMIN_MANUAL';

export class IssueGiftVoucherCommand {
  constructor(
    public readonly userId:   string,
    public readonly amount:   number,
    public readonly type:     GiftVoucherType,
    public readonly issuedBy: string = 'SYSTEM',
    public readonly validDays: number = 30,
  ) {}
}
