// apps/backend/src/modules/catalog/domain/value-objects/price.vo.ts

import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';

interface PriceProps {
  amount: number;
  currency: string;
}

export class Price extends ValueObject<PriceProps> {
  private constructor(props: PriceProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  public static create(amount: number | string, currency: string = 'TRY'): Result<Price> {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

      if (isNaN(numAmount) || numAmount < 0) {
        return Err(new Error('Fiyat negatif veya geçersiz olamaz.'));
      }

      return Ok(new Price({ amount: numAmount, currency }));
    } catch (error) {
      return Err(new Error('Geçersiz fiyat formatı.'));
    }
  }

  public toValue(): number {
    return this.props.amount;
  }

  public toString(): string {
    return `${this.props.amount.toFixed(2)} ${this.props.currency}`;
  }
}
