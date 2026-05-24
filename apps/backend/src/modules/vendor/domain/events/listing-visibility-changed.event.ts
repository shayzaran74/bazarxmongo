// apps/backend/src/modules/vendor/domain/events/listing-visibility-changed.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class ListingVisibilityChangedEvent extends DomainEvent {
  constructor(
    public readonly listingId: string,
    public readonly oldVisibility: string,
    public readonly newVisibility: string,
  ) {
    super(listingId);
  }

  get eventName(): string {
    return 'listing.visibility.changed';
  }
}