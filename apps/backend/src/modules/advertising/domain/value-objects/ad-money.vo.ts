// apps/backend/src/modules/advertising/domain/value-objects/ad-money.vo.ts

import { ValueObject, Result, Ok, Err, DomainException } from '@barterborsa/shared-core';

interface MoneyProps {
  amount: number;
}

export class AdBudget extends ValueObject<MoneyProps> {
  get amount(): number { return this.props.amount; }
  private constructor(props: MoneyProps) { super(props); }
  public static create(amount: number): Result<AdBudget, DomainException> {
    if (amount < 0) return Err(new DomainException('Budget cannot be negative'));
    return Ok(new AdBudget({ amount }));
  }
}

export class BidAmount extends ValueObject<MoneyProps> {
  get amount(): number { return this.props.amount; }
  private constructor(props: MoneyProps) { super(props); }
  public static create(amount: number): Result<BidAmount, DomainException> {
    if (amount <= 0) return Err(new DomainException('Bid must be positive'));
    return Ok(new BidAmount({ amount }));
  }
}
