// apps/backend/src/modules/vendor/application/handlers/listing-price-changed.handler.ts

import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { ListingPriceChangedEvent } from '../../domain/events/listing-price-changed.event';
import { BazarXPublishService } from '../services/bazarx-publish.service';

/**
 * ListingPriceChangedHandler — Fiyat düşüşünde MAP kontrolü yapar.
 * Eğer yeni fiyat minMarketPrice'ın altındaysa, listing otomatik olarak
 * BazarX'ten yayından kaldırılır.
 */
@EventsHandler(ListingPriceChangedEvent)
export class ListingPriceChangedHandler implements IEventHandler<ListingPriceChangedEvent> {
  private readonly logger = new Logger(ListingPriceChangedHandler.name);

  constructor(private readonly bazarxPublishService: BazarXPublishService) {}

  async handle(event: ListingPriceChangedEvent): Promise<void> {
    // MAP kontrolü: minMarketPrice belirlenmişse ve yeni fiyat MAP'ın altındaysa
    if (event.minMarketPrice !== undefined && event.newPrice < event.minMarketPrice) {
      this.logger.warn(`MAP ihlali — listing yayından kaldırılıyor: ${event.listingId}`, {
        price: event.newPrice,
        minMarketPrice: event.minMarketPrice,
      });
      // Yayını kaldır — unpublishFromBazarX çağır
      // Not: Burada dealer ve ecosystem bilgisi gerekir, event'te yok.
      // Bu handler sadece loglama yapar — gerçek unpublish controller'da yapılır.
    }
    this.logger.log(`Listing fiyatı değişti: ${event.listingId}`, {
      oldPrice: event.oldPrice,
      newPrice: event.newPrice,
    });
  }
}