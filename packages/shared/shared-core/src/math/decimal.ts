// packages/shared/shared-core/src/math/decimal.ts
// Decimal128 aritmetik — financial-service için Money API
// ⚠️ Decimal128 üzerinde doğrudan + - * / YASAKTIR. Money sınıfı kullanılır.

import { Decimal } from 'decimal.js';
import { Types } from 'mongoose';

// Decimal128 → Decimal.js geçiş için
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type Currency = 'TRY' | 'USD';

export class Money {
  // Private field'lar — underscore prefix
  private readonly amount: Decimal;
  private readonly ccy: Currency;

  private constructor(amount: Decimal, ccy: Currency) {
    this.amount = amount;
    this.ccy = ccy;
  }

  // Guard'lı constructor — Decimal128, string, number'dan oluşturulabilir
  static from(value: Types.Decimal128 | string | number, currency: Currency = 'TRY'): Money {
    let decimalValue: Decimal;

    if (value instanceof Types.Decimal128) {
      decimalValue = new Decimal(value.toString());
    } else if (typeof value === 'string') {
      decimalValue = new Decimal(value);
    } else if (typeof value === 'number') {
      decimalValue = new Decimal(value.toString());
    } else {
      throw new TypeError(`Money.from: Desteklenmeyen tip ${typeof value}`);
    }

    if (decimalValue.isNaN()) {
      throw new TypeError('Money.from: Geçersiz sayısal değer');
    }

    return new Money(decimalValue, currency);
  }

  // Sıfır yapılandırıcı
  static zero(currency: Currency = 'TRY'): Money {
    return new Money(new Decimal(0), currency);
  }

  // Para birimi eşleşme kontrolü
  private assertCurrency(other: Money): void {
    if (this.ccy !== other.ccy) {
      throw new Error(`Currency mismatch: ${this.ccy} vs ${other.ccy}`);
    }
  }

  // Aritmetik işlemler
  add(other: Money): Money {
    this.assertCurrency(other);
    return new Money(this.amount.plus(other.amount), this.ccy);
  }

  subtract(other: Money): Money {
    this.assertCurrency(other);
    return new Money(this.amount.minus(other.amount), this.ccy);
  }

  multiply(factor: number | Decimal): Money {
    const factorDecimal = typeof factor === 'number' ? new Decimal(factor) : factor;
    return new Money(this.amount.times(factorDecimal), this.ccy);
  }

  divide(divisor: number | Decimal): Money {
    if (divisor === 0) {
      throw new Error('Divide by zero');
    }
    const divisorDecimal = typeof divisor === 'number' ? new Decimal(divisor) : divisor;
    return new Money(this.amount.dividedBy(divisorDecimal), this.ccy);
  }

  // Yüzde hesaplama — örn: %20 = money.percent(20)
  percent(p: number): Money {
    return new Money(this.amount.times(new Decimal(p)).dividedBy(100), this.ccy);
  }

  // Karşılaştırma
  compare(other: Money): -1 | 0 | 1 {
    this.assertCurrency(other);
    const cmp = this.amount.cmp(other.amount);
    return cmp as -1 | 0 | 1;
  }

  isZero(): boolean {
    return this.amount.isZero();
  }

  isNegative(): boolean {
    return this.amount.isNegative();
  }

  isPositive(): boolean {
    return this.amount.isPositive();
  }

  // Büyük veya eşit
  gte(other: Money): boolean {
    this.assertCurrency(other);
    return this.amount.greaterThanOrEqualTo(other.amount);
  }

  // Küçük veya eşit
  lte(other: Money): boolean {
    this.assertCurrency(other);
    return this.amount.lessThanOrEqualTo(other.amount);
  }

  // MongoDB'ye yazmak için Decimal128'e çevir
  toDecimal128(): Types.Decimal128 {
    return Types.Decimal128.fromString(this.amount.toString());
  }

  // UI ve log için fixed point string
  toFixed(decimals: number = 2): string {
    return this.amount.toFixed(decimals);
  }

  // Raw number (dikkat — floating point kaybı olabilir, sadece display için)
  toNumber(): number {
    return this.amount.toNumber();
  }

  get currency(): Currency {
    return this.ccy;
  }

  // Debug için
  toString(): string {
    return `${this.amount.toString()} ${this.ccy}`;
  }

  // Eşitlik kontrolü
  equals(other: Money): boolean {
    return this.ccy === other.ccy && this.amount.equals(other.amount);
  }

  // Mutlak değer
  abs(): Money {
    return new Money(this.amount.abs(), this.ccy);
  }
}

// Kullanım örneği:
//   const amount = Money.from(wallet.balance, 'TRY');
//   const fee = amount.percent(20);
//   const total = amount.add(fee);