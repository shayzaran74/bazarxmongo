// apps/backend/src/modules/vendor/application/handlers/ecosystem-member-removed.handler.ts

import { EventsHandler, IEventHandler, EventBus } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { EcosystemMemberRemovedEvent } from '../../domain/events/ecosystem-member-removed.event';
import { BazarXPublishService } from '../services/bazarx-publish.service';

/**
 * EcosystemMemberRemovedHandler — Üye çıkarıldığında BazarX yayınlarını kaldırır.
 * Bir bayi ekosistemin üyesi çıkarıldığında, o bayinin yayınladığı tüm listing'lerin
 * BazarX yayını otomatik olarak kaldırılır.
 */
@EventsHandler(EcosystemMemberRemovedEvent)
export class EcosystemMemberRemovedHandler implements IEventHandler<EcosystemMemberRemovedEvent> {
  private readonly logger = new Logger(EcosystemMemberRemovedHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly bazarxPublishService: BazarXPublishService,
  ) {}

  async handle(event: EcosystemMemberRemovedEvent): Promise<void> {
    this.logger.log(`Üye çıkarıldı — BazarX yayınları kaldırılıyor: vendor=${event.memberVendorId}, ecosystem=${event.ecosystemId}`);

    try {
      // Bayiye ait tüm yayınlanmış listing'leri bul ve yayını kaldır
      const publishedListings = await this.bazarxPublishService.getDealerPublishedListings(
        event.memberVendorId,
        event.ecosystemId,
      );

      for (const listing of publishedListings) {
        try {
          await this.bazarxPublishService.unpublishFromBazarX(
            event.memberVendorId,
            event.ecosystemId,
            listing.id,
          );
        } catch (err) {
          this.logger.warn(`Listing yayını kaldırılamadı: ${listing.id}`, { error: err });
        }
      }

      this.logger.log(`BazarX yayınları kaldırıldı: ${publishedListings.length} listing`);
    } catch (err) {
      this.logger.error(`EcosystemMemberRemovedHandler hatası`, { error: err, event });
    }
  }
}