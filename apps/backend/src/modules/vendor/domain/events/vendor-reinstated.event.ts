import { DomainEvent } from '@barterborsa/shared-core';

export class VendorReinstatedEvent extends DomainEvent {
  constructor(
    public readonly vendorId: string,
  ) {
    super(vendorId);
  }

  get eventName(): string {
    return 'vendor.reinstated';
  }
}
