// apps/financial-service/src/modules/commission/domain/services/commission-calculator.service.ts
// Master Plan v4.3 §3.2 — TicariTakas komisyon yapısı

import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';

// Standart komisyon oranları (%)
const STANDARD_RATES: Record<string, number> = {
  CORE:  12.0,
  PRIME: 10.0,
  ELITE:  8.0,
  APEX:   6.0,
};

// Grup içi oran — aynı BrandEcosystem içi işlem (%)
const GROUP_RATES: Record<string, number> = {
  CORE:  9.0,
  PRIME: 8.0,
  ELITE: 7.0,
  APEX:  6.0,
};

// XP indirimi sonrası oran — standart × %50 (%)
const XP_DISCOUNTED_RATES: Record<string, number> = {
  CORE:  6.0,
  PRIME: 5.0,
  ELITE: 4.0,
  APEX:  3.0,
};

export interface CommissionResult {
  rate:       Decimal;
  commission: Decimal;
  rateType:   'STANDARD' | 'GROUP' | 'XP_DISCOUNTED';
  cashAmount: Decimal;
  xpAmount:   Decimal;
}

@Injectable()
export class CommissionCalculatorService {
  /**
   * Master Plan v4.3 §3.2 — Tier bazlı komisyon hesabı.
   * Kural: XP indirimi VE grup içi oran aynı işlemde birlikte uygulanamaz.
   *
   * @param amount            İşlem tutarı
   * @param vendorTier        CORE | PRIME | ELITE | APEX
   * @param isGroupTransaction Aynı ekosistem içi mi?
   * @param xpToApply         Kullanılmak istenen XP miktarı (1 XP = 1₺ komisyon indirimi)
   */
  calculate(
    amount:             Decimal,
    vendorTier:         string,
    isGroupTransaction: boolean = false,
    xpToApply:          Decimal = new Decimal(0),
  ): CommissionResult {
    const tier = vendorTier?.toUpperCase() ?? 'CORE';

    const standardRate = new Decimal(STANDARD_RATES[tier] ?? 12.0);
    const groupRate    = new Decimal(GROUP_RATES[tier]    ?? 9.0);
    const xpRate       = new Decimal(XP_DISCOUNTED_RATES[tier] ?? 6.0);

    const standardCommission = amount.mul(standardRate).div(100).toDecimalPlaces(2);

    // Grup içi oran seçilirse XP indirimi uygulanmaz
    if (isGroupTransaction) {
      const commission = amount.mul(groupRate).div(100).toDecimalPlaces(2);
      return {
        rate:       groupRate,
        commission,
        rateType:   'GROUP',
        cashAmount: commission,
        xpAmount:   new Decimal(0),
      };
    }

    // XP uygulanıyor mu? (komisyonun max %50'si → XP_DISCOUNTED_RATE ile örtüşür)
    const maxXpDiscount = standardCommission.sub(amount.mul(xpRate).div(100).toDecimalPlaces(2));
    const effectiveXp   = Decimal.min(xpToApply, maxXpDiscount);

    if (effectiveXp.gt(0)) {
      const cashCommission = standardCommission.sub(effectiveXp).toDecimalPlaces(2);
      return {
        rate:       standardRate,
        commission: standardCommission,
        rateType:   'XP_DISCOUNTED',
        cashAmount: cashCommission,
        xpAmount:   effectiveXp,
      };
    }

    // Standart oran
    return {
      rate:       standardRate,
      commission: standardCommission,
      rateType:   'STANDARD',
      cashAmount: standardCommission,
      xpAmount:   new Decimal(0),
    };
  }

  // Geriye dönük uyum (eski çağrılar için)
  calculateSimple(amount: Decimal, vendorTier: string): { rate: Decimal; commission: Decimal } {
    const result = this.calculate(amount, vendorTier);
    return { rate: result.rate, commission: result.commission };
  }
}
