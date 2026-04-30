import { SubscriptionTier } from '../../../loyalty/domain/enums/loyalty.enums';

export class SubscribeUserCommand {
  constructor(
    public readonly userId: string,
    public readonly tier:   SubscriptionTier,
    public readonly annual: boolean = false, // yıllık taahhüt (2 ay ücretsiz)
  ) {}
}
