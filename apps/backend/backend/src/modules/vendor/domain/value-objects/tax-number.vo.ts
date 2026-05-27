// apps/backend/src/modules/vendor/domain/value-objects/tax-number.vo.ts

import { ValueObject } from '@barterborsa/shared-core';
import { Result, Ok, Err } from '@barterborsa/shared-core';
import { DomainException } from '@barterborsa/shared-core';

interface TaxNumberProps {
  value: string;
}

export class TaxNumber extends ValueObject<TaxNumberProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: TaxNumberProps) {
    super(props);
  }

  public static create(value: string): Result<TaxNumber, DomainException> {
    // Türkiye vergi numarası validasyonu (10 hane) veya TC Kimlik no (11 hane)
    const isValid = /^\d{10,11}$/.test(value);
    
    if (!isValid) {
      return Err(new DomainException('Geçersiz vergi/kimlik numarası formatı. 10 veya 11 hane olmalıdır.'));
    }

    return Ok(new TaxNumber({ value }));
  }
}
