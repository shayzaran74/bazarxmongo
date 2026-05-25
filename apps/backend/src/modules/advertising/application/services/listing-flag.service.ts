// apps/backend/src/modules/advertising/application/services/listing-flag.service.ts
// Listing görünürlük flag'lerini AdCampaign yaşam döngüsüne bağlar.
// FEATURED/FLASH_SALE/SPECIAL_OFFER slot tipleri onaylama ve bitiş sırasında set/clear yapılır.

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AdSlotType } from '../../domain/enums/advertising.enums';

const FLAG_BY_SLOT: Partial<Record<AdSlotType, Record<string, boolean>>> = {
  [AdSlotType.FEATURED]:      { isFeatured: true },
  [AdSlotType.FLASH_SALE]:    { isFlashSale: true },
  [AdSlotType.SPECIAL_OFFER]: { isSpecialOffer: true },
};

@Injectable()
export class ListingFlagService {
  private readonly logger = new Logger(ListingFlagService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async applyAdFlag(listingId: string, slotType: AdSlotType): Promise<void> {
    const flag = FLAG_BY_SLOT[slotType];
    if (!flag) return;
    const db = this.connection.db;
    if (!db) return;
    await db.collection('listings').updateOne({ id: listingId }, { $set: flag });
    this.logger.log(`Listing flag uygulandı`, { listingId, slotType, flag });
  }

  async clearAdFlag(listingId: string, slotType: AdSlotType): Promise<void> {
    const flag = FLAG_BY_SLOT[slotType];
    if (!flag) return;
    const db = this.connection.db;
    if (!db) return;
    const cleared = Object.fromEntries(Object.keys(flag).map(k => [k, false]));
    await db.collection('listings').updateOne({ id: listingId }, { $set: cleared });
    this.logger.log(`Listing flag temizlendi`, { listingId, slotType, cleared });
  }
}
