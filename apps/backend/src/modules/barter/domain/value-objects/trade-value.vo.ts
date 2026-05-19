// apps/backend/src/modules/barter/domain/value-objects/trade-value.vo.ts

import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';

interface TradeValueProps {
  amount: number;
  currency: string;
}

export class TradeValue extends ValueObject<TradeValueProps> {
  private constructor(props: TradeValueProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  public static create(amount: number | string, currency: string = 'TRY'): Result<TradeValue> {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

      if (isNaN(numAmount) || numAmount < 0) {
        return Err(new Error('Trade value cannot be negative'));
      }
      return Ok(new TradeValue({ amount: numAmount, currency }));
    } catch (error) {
      return Err(new Error('Invalid trade value format'));
    }
  }

  public toString(): string {
    return `${this.props.amount.toFixed(2)} ${this.props.currency}`;
  }
}