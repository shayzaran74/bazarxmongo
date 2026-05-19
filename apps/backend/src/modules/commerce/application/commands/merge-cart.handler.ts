// apps/backend/src/modules/commerce/application/commands/merge-cart.handler.ts
// MergeCartHandler — Mongoose migration (ADR-005 Faz 2b)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MongoCartRepository } from '../../infrastructure/persistence/mongo-cart.repository';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';
import { MergeCartCommand } from './merge-cart.command';

@CommandHandler(MergeCartCommand)
export class MergeCartHandler implements ICommandHandler<MergeCartCommand> {
  private readonly logger = new Logger(MergeCartHandler.name);

  constructor(
    private readonly cartRepo:    MongoCartRepository,
    private readonly listingRepo:  MongoListingRepository,
  ) {}

  async execute(command: MergeCartCommand) {
    const { userId, guestItems } = command;

    if (!guestItems || guestItems.length === 0) {
      return { success: true, merged: 0, message: 'Birleştirilecek ürün yok' };
    }

    // Kullanıcının mevcut sepetini getir veya oluştur
    let cart = await this.cartRepo.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepo.findOrCreate(userId);
    }

    // Mevcut sepet item'larını al (listingId → quantity map)
    const existingItems = cart.getProps().items;
    const existingMap = new Map<string, { id: string; quantity: number }>();
    for (const item of existingItems) {
      const props = item.getProps();
      existingMap.set(props.listingId, { id: item.id, quantity: props.quantity });
    }

    // Geçerli listing ID'lerini doğrula (silinmiş veya pasif listing'leri filtrele)
    const listingIds = guestItems.map(i => i.listingId);
    const validListings = await this.listingRepo.findByIds(listingIds);
    const validIds = new Set(validListings.map(l => l.id));

    let merged = 0;
    let skipped = 0;

    for (const item of guestItems) {
      if (!validIds.has(item.listingId)) {
        skipped++;
        continue;
      }

      const qty = Math.max(1, Math.min(item.quantity, 99));
      const current = existingMap.get(item.listingId);

      if (current) {
        await this.cartRepo.updateItemQuantity(current.id, Math.min(current.quantity + qty, 99));
      } else {
        await this.cartRepo.addItem(cart.id, item.listingId, qty);
      }

      merged++;
    }

    this.logger.log(
      `Cart merge: user=${userId}, merged=${merged}, skipped=${skipped}`,
    );

    return {
      success: true,
      merged,
      skipped,
      message: `${merged} ürün sepete aktarıldı${skipped > 0 ? `, ${skipped} ürün artık mevcut değil` : ''}`,
    };
  }
}
