// apps/backend/src/modules/vendor/domain/events/vendor-suspended.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class VendorSuspendedEvent extends DomainEvent {
  constructor(
    public readonly vendorId: string,
    public readonly reason: string,
  ) {
    super(vendorId);
  }

  get eventName(): string {
    return 'vendor.suspended';
  }
}
