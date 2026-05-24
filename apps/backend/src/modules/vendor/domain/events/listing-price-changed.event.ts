// apps/backend/src/modules/vendor/domain/events/listing-price-changed.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class ListingPriceChangedEvent extends DomainEvent {
  constructor(
    public readonly listingId: string,
    public readonly oldPrice: number,
    public readonly newPrice: number,
    public readonly minMarketPrice?: number,
  ) {
    super(listingId);
  }

  get eventName(): string {
    return 'listing.price.changed';
  }
}