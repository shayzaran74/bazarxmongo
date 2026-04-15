// apps/financial-service/src/modules/commission/domain/services/commission-calculator.service.ts

import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';

@Injectable()
export class CommissionCalculatorService {
  /**
   * Satıcı seviyesine göre komisyon oranını belirler ve tutarı hesaplar.
   * CORE: %10, PLUS: %7.5, PREMIUM: %5, ELITE: %2
   */
  calculate(amount: Decimal, vendorTier: string): { rate: Decimal; commission: Decimal } {
    let rate = new Decimal(10.0); // Default Core

    switch (vendorTier?.toUpperCase()) {
      case 'PLUS': rate = new Decimal(7.5); break;
      case 'PREMIUM': rate = new Decimal(5.0); break;
      case 'ELITE': rate = new Decimal(2.0); break;
    }

    const commission = amount.mul(rate).div(100);
    return { rate, commission: commission.toDecimalPlaces(2) };
  }
}
