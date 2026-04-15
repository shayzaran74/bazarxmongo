import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';

interface TrackingNumberProps {
  value: string;
}

export class TrackingNumber extends ValueObject<TrackingNumberProps> {
  private constructor(props: TrackingNumberProps) {
    super(props);
  }

  public static create(value: string): Result<TrackingNumber> {
    if (!value || value.length < 5) {
      return Err(new Error('Geçersiz takip numarası.'));
    }
    // Örn: SHP-20260415-12345 format kontrolü eklenebilir
    return Ok(new TrackingNumber({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
