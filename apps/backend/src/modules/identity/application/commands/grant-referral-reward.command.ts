export class GrantReferralRewardCommand {
  constructor(
    public readonly referrerId: string, // referans veren
    public readonly refereeId:  string, // yeni üye
  ) {}
}
