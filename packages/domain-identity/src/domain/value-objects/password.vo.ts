import { ValueObject, Result, Ok, Err, DomainException } from '@barterborsa/shared-core';

export interface PasswordProps {
  value: string;
  isHashed: boolean;
}

export class Password extends ValueObject<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.isHashed;
  }

  public static create(raw: string): Result<Password, DomainException> {
    if (raw.length < 6) return Err(new DomainException('Şifre en az 6 karakter olmalıdır.'));
    return Ok(new Password({ value: raw, isHashed: false }));
  }

  public static createHashed(hash: string): Password {
    return new Password({ value: hash, isHashed: true });
  }
}
