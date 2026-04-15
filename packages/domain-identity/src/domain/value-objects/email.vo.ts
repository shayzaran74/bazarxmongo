import { ValueObject, Result, Ok, Err, DomainException } from '@barterborsa/shared-core';

export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(email: string): Result<Email, DomainException> {
    if (!email || !email.includes('@')) {
      return Err(new DomainException('Geçersiz e-posta formatı.'));
    }
    return Ok(new Email({ value: email.toLowerCase() }));
  }
}
