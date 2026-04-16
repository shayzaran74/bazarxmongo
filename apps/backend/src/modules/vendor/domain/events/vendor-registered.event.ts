// apps/backend/src/modules/vendor/domain/events/vendor-registered.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class VendorRegisteredEvent extends DomainEvent {
  constructor(
    public readonly vendorId: string,
    public readonly userId: string,
    public readonly companyId: string,
    public readonly storeName: string,
  ) {
    super(vendorId);
  }

  get eventName(): string {
    return 'vendor.registered';
  }
}
