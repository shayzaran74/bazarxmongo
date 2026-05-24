// apps/backend/src/modules/barter/application/services/collateral-calculator.service.ts

import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';

@Injectable()
export class CollateralCalculatorService {
  // Master Plan v4.3 §6 — Güvenli Takas: %20 teminat
  private readonly DEFAULT_PERCENTAGE = new Decimal('0.20');

  public calculateCollateral(totalTradeValue: number | string): number {
    // %20 teminat oranı — Decimal.js ile güvenli hesaplama
    const tradeValue = new Decimal(totalTradeValue);
    return tradeValue.times(this.DEFAULT_PERCENTAGE).toNumber();
  }
}
