import { ValueObject } from '@barterborsa/shared-core';

export interface ShippingAddressProps {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode?: string;
}

export class ShippingAddress extends ValueObject<ShippingAddressProps> {
  private constructor(props: ShippingAddressProps) {
    super(props);
  }

  public static create(props: ShippingAddressProps): ShippingAddress {
    return new ShippingAddress(props);
  }

  get fullName(): string { return this.props.fullName; }
  get phone(): string { return this.props.phone; }
  get addressLine1(): string { return this.props.addressLine1; }
  get addressLine2(): string | undefined { return this.props.addressLine2; }
  get city(): string { return this.props.city; }
  get district(): string { return this.props.district; }
  get neighborhood(): string | undefined { return this.props.neighborhood; }
  get postalCode(): string | undefined { return this.props.postalCode; }
}
