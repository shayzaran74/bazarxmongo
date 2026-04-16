// apps/backend/src/modules/catalog/domain/value-objects/gtin.vo.ts

import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';

interface GTINProps {
  value: string;
}

export class GTIN extends ValueObject<GTINProps> {
  private constructor(props: GTINProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(value: string | undefined | null): Result<GTIN | undefined> {
    if (!value) {
      return Ok(undefined);
    }

    // GTIN can be 8, 12, 13, or 14 digits
    const gtinRegex = /^\d{8,14}$/;
    if (!gtinRegex.test(value)) {
      return Err(new Error('Geçersiz GTIN formatı.'));
    }

    return Ok(new GTIN({ value }));
  }
}
