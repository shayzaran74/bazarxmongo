// apps/backend/src/modules/bazarxgo/application/services/go-commission.service.ts
// BazarX Go komisyon/hakediş hesabı (bazarxgoplan.md §5).
// Kupon platform finanse edildiğinden restoran hakediş tabanı YALIN subtotal'dır.

import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IGoRestaurant } from '@barterborsa/shared-persistence';

export interface GoPayoutBreakdown {
  goCommission: Decimal;             // subtotal × oran
  restaurantPayoutAmount: Decimal;   // subtotal − goCommission (restorana ödenecek)
}

@Injectable()
export class GoCommissionService {
  private readonly defaultRate: number;

  constructor() {
    const env = Number(process.env.GO_COMMISSION_RATE);
    // B2B tier'dan bağımsız global GO oranı (varsayılan %15)
    this.defaultRate = Number.isFinite(env) && env > 0 ? env : 0.15;
  }

  /** Restoran bazlı oran (yoksa global) ile hakediş hesaplar. */
  compute(subtotal: Decimal, restaurant: Pick<IGoRestaurant, 'goCommissionRate'>): GoPayoutBreakdown {
    const rateNum =
      restaurant.goCommissionRate != null && restaurant.goCommissionRate > 0
        ? restaurant.goCommissionRate
        : this.defaultRate;
    const rate = new Decimal(rateNum);
    const goCommission = subtotal.times(rate).toDecimalPlaces(2);
    const restaurantPayoutAmount = subtotal.sub(goCommission).toDecimalPlaces(2);
    return { goCommission, restaurantPayoutAmount };
  }
}
