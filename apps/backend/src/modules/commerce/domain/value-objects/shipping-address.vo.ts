// apps/backend/src/modules/commerce/domain/value-objects/shipping-address.vo.ts

import { ValueObject } from '@barterborsa/shared-core';

export interface ShippingAddressProps {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode: string;
}

export class ShippingAddress extends ValueObject<ShippingAddressProps> {
  private constructor(props: ShippingAddressProps) {
    super(props);
  }

  public static create(props: ShippingAddressProps): ShippingAddress {
    // Add validations if needed
    return new ShippingAddress(props);
  }

  public getFullAddress(): string {
    const lines = [
      `${this.props.firstName} ${this.props.lastName}`,
      this.props.addressLine1,
      this.props.addressLine2,
      `${this.props.neighborhood || ''} ${this.props.district}/${this.props.city}`,
      this.props.postalCode,
      `Phone: ${this.props.phone}`
    ].filter(Boolean);
    return lines.join(', ');
  }

  public toJson(): any {
    return { ...this.props };
  }

  public static fromJson(json: any): ShippingAddress {
    return new ShippingAddress(json);
  }
}
