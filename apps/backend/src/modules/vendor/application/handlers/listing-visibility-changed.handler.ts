// apps/backend/src/modules/vendor/application/handlers/listing-visibility-changed.handler.ts

import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { ListingVisibilityChangedEvent } from '../../domain/events/listing-visibility-changed.event';
import { BazarXPublishService } from '../services/bazarx-publish.service';

/**
 * ListingVisibilityChangedHandler — allowOnlineResale=false olduğunda
 * tüm BazarX yayınlarını kaldırır.
 */
@EventsHandler(ListingVisibilityChangedEvent)
export class ListingVisibilityChangedHandler implements IEventHandler<ListingVisibilityChangedEvent> {
  private readonly logger = new Logger(ListingVisibilityChangedHandler.name);

  constructor(private readonly bazarxPublishService: BazarXPublishService) {}

  async handle(event: ListingVisibilityChangedEvent): Promise<void> {
    this.logger.log(`Listing visibility değişti: ${event.listingId}`, {
      oldVisibility: event.oldVisibility,
      newVisibility: event.newVisibility,
    });
    // TODO: allowOnlineResale=false kontrolü ile bulk unpublish
  }
}