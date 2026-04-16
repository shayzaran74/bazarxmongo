// apps/backend/src/modules/barter/domain/value-objects/trade-value.vo.ts

import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';

interface TradeValueProps {
  amount: Prisma.Decimal;
  currency: string;
}

export class TradeValue extends ValueObject<TradeValueProps> {
  private constructor(props: TradeValueProps) {
    super(props);
  }

  get amount(): Prisma.Decimal {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  public static create(amount: number | string | Prisma.Decimal, currency: string = 'TRY'): Result<TradeValue> {
    try {
      const decimalAmount = new Prisma.Decimal(amount);
      if (decimalAmount.lt(0)) {
        return Err(new Error('Trade value cannot be negative'));
      }
      return Ok(new TradeValue({ amount: decimalAmount, currency }));
    } catch (error) {
      return Err(new Error('Invalid trade value format'));
    }
  }

  public toString(): string {
    return `${this.props.amount.toFixed(2)} ${this.props.currency}`;
  }
}
