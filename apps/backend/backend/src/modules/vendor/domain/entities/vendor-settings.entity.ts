// apps/backend/src/modules/vendor/domain/entities/vendor-settings.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

// Komisyon ayarlamaları (kategori-bazlı override'lar)
export type CommissionAdjustments = Record<string, number>;

export interface VendorSettingsProps {
  vendorId:               string;
  listingLimit:           number;
  commissionRate:         number;
  deliveryTimeDays:       number;
  minOrderAmount:         number;
  returnPolicy?:          string;
  shippingPolicy?:        string;
  preferredCurrency:      string;
  vatIncluded:            boolean;
  vacationMode:           boolean;
  vacationEndAt?:         Date;
  autoFulfill:            boolean;
  commissionAdjustments?: CommissionAdjustments;
  // Restoran canlı sipariş kontrolü
  holidayMode:            boolean;
  acceptingOrders:        boolean;
}

export class VendorSettings extends AggregateRoot<VendorSettingsProps> {
  protected constructor(props: VendorSettingsProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: VendorSettingsProps, id: string): VendorSettings {
    return new VendorSettings(props, id);
  }

  public static create(vendorId: string): VendorSettings {
    return new VendorSettings({
      vendorId,
      listingLimit:      100,
      commissionRate:    10.0,
      deliveryTimeDays:  3,
      minOrderAmount:    0,
      preferredCurrency: 'TRY',
      vatIncluded:       true,
      vacationMode:      false,
      autoFulfill:       false,
      holidayMode:       false,
      acceptingOrders:   true,
    });
  }

  public enableVacationMode(endDate?: Date): void {
    this.props.vacationMode = true;
    this.props.vacationEndAt = endDate;
    this._updatedAt = new Date();
  }

  public disableVacationMode(): void {
    this.props.vacationMode = false;
    this.props.vacationEndAt = undefined;
    this._updatedAt = new Date();
  }

  // Restoran: tatil modu (sipariş alımı geçici durdurulur)
  public setHolidayMode(enabled: boolean): void {
    this.props.holidayMode = enabled;
    if (enabled) {
      this.props.acceptingOrders = false;
    }
    this._updatedAt = new Date();
  }

  // Restoran: canlı sipariş alma toggle (mutfak yoğunluğunda kapatılır)
  public setAcceptingOrders(enabled: boolean): void {
    this.props.acceptingOrders = enabled;
    this._updatedAt = new Date();
  }

  public update(props: Partial<VendorSettingsProps>): void {
    Object.assign(this.props, props);
    this._updatedAt = new Date();
  }
}
