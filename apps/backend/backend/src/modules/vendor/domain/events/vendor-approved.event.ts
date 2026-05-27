// apps/backend/src/modules/vendor/domain/events/vendor-approved.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class VendorApprovedEvent extends DomainEvent {
  constructor(
    public readonly vendorId: string,
    public readonly userId: string,
    public readonly companyId: string,
  ) {
    super(vendorId);
  }

  get eventName(): string {
    return 'vendor.approved';
  }
}
