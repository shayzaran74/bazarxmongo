// apps/backend/src/modules/loyalty/application/services/xp-calculator.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class XpCalculatorService {
  calculateOrderXp(orderAmount: number, isFirstOrder: boolean): number {
    let xp = Math.floor(orderAmount); // 1 TL = 1 XP base
    if (isFirstOrder) {
      xp += 500; // Bonus
    }
    // Her sipariş %2 bonus
    xp += Math.floor(orderAmount * 0.02);
    return xp;
  }

  calculateBarterXp(tradeValue: number): number {
    return Math.floor(tradeValue * 0.03); // %3
  }

  calculateLoginBonus(): number {
    return 10;
  }

  calculateReferralBonus(): number {
    return 200;
  }
}
