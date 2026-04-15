import { ValueObject, Result, Ok, Err, DomainException } from '@barterborsa/shared-core';

export interface PhoneNumberProps {
  value: string;
}

export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(phone: string): Result<PhoneNumber, DomainException> {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return Err(new DomainException('Geçersiz telefon numarası.'));
    }
    return Ok(new PhoneNumber({ value: cleaned }));
  }
}
