// apps/backend/src/modules/vendor/domain/value-objects/iban.vo.ts

import { ValueObject } from '@barterborsa/shared-core';
import { Result, Ok, Err } from '@barterborsa/shared-core';
import { DomainException } from '@barterborsa/shared-core';

interface IBANProps {
  value: string;
}

export class IBAN extends ValueObject<IBANProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: IBANProps) {
    super(props);
  }

  public static create(value: string): Result<IBAN, DomainException> {
    const cleanValue = value.replace(/\s+/g, '').toUpperCase();
    
    // Türkiye IBAN formatı: TR + 2 kontrol basamağı + 5 banka kodu + 1 rezerv + 16 hesap no = 26 karakter
    const trIbanRegex = /^TR\d{24}$/;
    
    if (!trIbanRegex.test(cleanValue)) {
      return Err(new DomainException('Geçersiz Türkiye IBAN formatı.'));
    }

    return Ok(new IBAN({ value: cleanValue }));
  }
}
