// apps/backend/src/modules/vendor/domain/events/vendor-rejected.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class VendorRejectedEvent extends DomainEvent {
  constructor(
    public readonly vendorId: string,
    public readonly reason: string,
  ) {
    super(vendorId);
  }

  get eventName(): string {
    return 'vendor.rejected';
  }
}
