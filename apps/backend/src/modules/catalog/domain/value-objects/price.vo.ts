// apps/backend/src/modules/catalog/domain/value-objects/price.vo.ts

import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';

interface PriceProps {
  amount: Prisma.Decimal;
  currency: string;
}

export class Price extends ValueObject<PriceProps> {
  private constructor(props: PriceProps) {
    super(props);
  }

  get amount(): Prisma.Decimal {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  public static create(amount: number | string | Prisma.Decimal, currency: string = 'TRY'): Result<Price> {
    try {
      const decimalAmount = new Prisma.Decimal(amount);
      
      if (decimalAmount.lt(0)) {
        return Err(new Error('Fiyat negatif olamaz.'));
      }

      return Ok(new Price({ amount: decimalAmount, currency }));
    } catch (error) {
      return Err(new Error('Geçersiz fiyat formatı.'));
    }
  }

  public toValue(): number {
    return this.props.amount.toNumber();
  }

  public toString(): string {
    return `${this.props.amount.toFixed(2)} ${this.props.currency}`;
  }
}
