// apps/backend/src/modules/vendor/domain/entities/vendor-profile.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface VendorProfileProps {
  vendorId: string;
  storeName: string;
  description?: string;
  logo?: string;
  banner?: string;
  supportEmail?: string;
  isFeatured: boolean;
  featuredUntil?: Date;
  city?: string; // PilotCity enum can be used if preferred
  district?: string;
}

export class VendorProfile extends AggregateRoot<VendorProfileProps> {
  protected constructor(props: VendorProfileProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: VendorProfileProps, id: string): VendorProfile {
    return new VendorProfile(props, id);
  }

  public static create(props: Omit<VendorProfileProps, 'isFeatured'>): VendorProfile {
    return new VendorProfile({
      ...props,
      isFeatured: false,
    });
  }

  public update(props: Partial<VendorProfileProps>): void {
    Object.assign(this.props, props);
    this._updatedAt = new Date();
  }

  get storeName(): string { return this.props.storeName; }
}
