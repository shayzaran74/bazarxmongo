import { ValueObject } from '@barterborsa/shared-core';
import { CarrierCode } from '../enums/carrier-code.enum';

interface CarrierInfoProps {
  carrierCode: CarrierCode;
  carrierName: string;
  trackingNumber: string;
  trackingUrl?: string;
}

export class CarrierInfo extends ValueObject<CarrierInfoProps> {
  private constructor(props: CarrierInfoProps) {
    super(props);
  }

  public static create(props: CarrierInfoProps): CarrierInfo {
    return new CarrierInfo(props);
  }

  get carrierCode(): CarrierCode { return this.props.carrierCode; }
  get carrierName(): string { return this.props.carrierName; }
  get trackingNumber(): string { return this.props.trackingNumber; }
  get trackingUrl(): string | undefined { return this.props.trackingUrl; }
}
