import { SubscriptionTier } from '../../../loyalty/domain/enums/loyalty.enums';

export class UpgradeTierCommand {
  constructor(
    public readonly userId:    string,
    public readonly newTier:   SubscriptionTier,
    public readonly xpAmount:  number = 0,  // XP ile ödenmek istenen miktar (1XP=1₺)
  ) {}
}
