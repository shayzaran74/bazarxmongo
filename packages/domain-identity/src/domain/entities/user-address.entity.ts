import { Entity } from '@barterborsa/shared-core';

export interface UserAddressProps {
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode?: string;
  isDefault: boolean;
}

export class UserAddress extends Entity<UserAddressProps> {
  private constructor(props: UserAddressProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<UserAddressProps, 'isDefault'> & { isDefault?: boolean }, id?: string): UserAddress {
    return new UserAddress({
      ...props as UserAddressProps,
      isDefault: props.isDefault ?? false,
    }, id);
  }

  public update(props: Partial<UserAddressProps>): void {
    Object.assign(this.props, props);
    this._updatedAt = new Date();
  }

  public setAsDefault(): void {
    this.props.isDefault = true;
    this._updatedAt = new Date();
  }

  public removeDefault(): void {
    this.props.isDefault = false;
    this._updatedAt = new Date();
  }

  public getFullAddress(): string {
    return `${this.props.addressLine1} ${this.props.addressLine2 || ''} ${this.props.district}/${this.props.city}`.trim();
  }

  get userId(): string { return this.props.userId; }
  get title(): string { return this.props.title; }
  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get phone(): string { return this.props.phone; }
  get addressLine1(): string { return this.props.addressLine1; }
  get addressLine2(): string | undefined { return this.props.addressLine2; }
  get city(): string { return this.props.city; }
  get district(): string { return this.props.district; }
  get neighborhood(): string | undefined { return this.props.neighborhood; }
  get postalCode(): string | undefined { return this.props.postalCode; }
  get isDefault(): boolean { return this.props.isDefault; }
}
