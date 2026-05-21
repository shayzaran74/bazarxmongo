// apps/backend/src/modules/barter/application/services/collateral-calculator.service.ts

import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';

@Injectable()
export class CollateralCalculatorService {
  private readonly DEFAULT_PERCENTAGE = new Decimal('0.25');

  public calculateCollateral(totalTradeValue: number | string): number {
    // Default 25% of trade value — Decimal.js ile güvenli hesaplama
    const tradeValue = new Decimal(totalTradeValue);
    return tradeValue.times(this.DEFAULT_PERCENTAGE).toNumber();
  }
}
