// apps/backend/src/modules/vendor/domain/entities/vendor-profile.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

// Restoran çalışma saatleri (haftanın günleri için open/close çiftleri)
export interface OpeningHours {
  monday?:    { open: string; close: string } | null;
  tuesday?:   { open: string; close: string } | null;
  wednesday?: { open: string; close: string } | null;
  thursday?:  { open: string; close: string } | null;
  friday?:    { open: string; close: string } | null;
  saturday?:  { open: string; close: string } | null;
  sunday?:    { open: string; close: string } | null;
}

export interface VendorProfileProps {
  vendorId:           string;
  storeName:          string;
  description?:       string;
  logo?:              string;
  banner?:            string;
  supportEmail?:      string;
  isFeatured:         boolean;
  featuredUntil?:     Date;
  city?:              string;
  district?:          string;
  // Restoran-özel alanlar (vendorType=RESTAURANT için doldurulur)
  openingHours?:       OpeningHours;
  cuisineType?:        string;
  deliveryRadius?:     number;
  minOrderAmount?:     number;
  avgPrepTimeMinutes?: number;
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

  // Restoran ayarlarını günceller (RESTAURANT vendorType için)
  public updateRestaurantSettings(settings: {
    openingHours?:       OpeningHours;
    cuisineType?:        string;
    deliveryRadius?:     number;
    minOrderAmount?:     number;
    avgPrepTimeMinutes?: number;
  }): void {
    Object.assign(this.props, settings);
    this._updatedAt = new Date();
  }

  get storeName(): string { return this.props.storeName; }
}
