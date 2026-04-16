// apps/backend/src/modules/loyalty/application/services/level-calculator.service.ts

import { Injectable } from '@nestjs/common';
import { LoyaltyTier } from '../../domain/enums/loyalty.enums';

@Injectable()
export class LevelCalculatorService {
  calculateLevel(lifetimeXp: number): number {
    if (lifetimeXp >= 50000) return 5;
    if (lifetimeXp >= 15000) return 4;
    if (lifetimeXp >= 5000) return 3;
    if (lifetimeXp >= 1000) return 2;
    return 1;
  }

  determineTier(lifetimeXp: number): LoyaltyTier {
    if (lifetimeXp >= 100000) return LoyaltyTier.DIAMOND;
    if (lifetimeXp >= 25000) return LoyaltyTier.PLATINUM;
    if (lifetimeXp >= 5000) return LoyaltyTier.GOLD;
    if (lifetimeXp >= 1000) return LoyaltyTier.SILVER;
    return LoyaltyTier.BRONZE;
  }
}
