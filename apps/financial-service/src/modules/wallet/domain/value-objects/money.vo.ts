// apps/financial-service/src/modules/wallet/domain/value-objects/money.vo.ts

import { ValueObject, DomainException } from '@barterborsa/shared-core';
import { Decimal } from 'decimal.js';

interface MoneyProps {
  amount: Decimal;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): Decimal {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainException('Farklı para birimleri toplanamaz.');
    }
    return new Money({
      amount: this.amount.plus(other.amount),
      currency: this.currency
    });
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Farklı para birimleri çıkarılamaz.');
    }
    if (this.amount.minus(other.amount).isNegative()) {
      throw new DomainException('Yetersiz bakiye.');
    }
    return new Money({
      amount: this.amount.minus(other.amount),
      currency: this.currency
    });
  }

  static zero(currency: string = 'TRY'): Money {
    return new Money({ amount: new Decimal(0), currency });
  }

  static fromDecimal(amount: Decimal, currency: string = 'TRY'): Money {
    return new Money({ amount, currency });
  }

  static fromNumber(amount: number, currency: string = 'TRY'): Money {
    return new Money({ amount: new Decimal(amount), currency });
  }
}
