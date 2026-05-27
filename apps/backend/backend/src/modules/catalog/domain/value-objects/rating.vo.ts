// apps/backend/src/modules/catalog/domain/value-objects/rating.vo.ts

import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';

interface RatingProps {
  value: number;
}

export class Rating extends ValueObject<RatingProps> {
  private constructor(props: RatingProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  public static create(value: number): Result<Rating> {
    if (value < 0 || value > 5) {
      return Err(new Error('Puan 0 ile 5 arasında olmalıdır.'));
    }

    return Ok(new Rating({ value: parseFloat(value.toFixed(2)) }));
  }
}
