// apps/backend/src/modules/commerce/application/commands/merge-cart.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { MergeCartCommand } from './merge-cart.command';

@CommandHandler(MergeCartCommand)
export class MergeCartHandler implements ICommandHandler<MergeCartCommand> {
  private readonly logger = new Logger(MergeCartHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: MergeCartCommand) {
    const { userId, guestItems } = command;

    if (!guestItems || guestItems.length === 0) {
      return { success: true, merged: 0, message: 'Birleştirilecek ürün yok' };
    }

    // Kullanıcının mevcut sepetini getir veya oluştur
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // Mevcut sepet item'larını al (listingId → quantity map)
    const existing = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      select: { id: true, listingId: true, quantity: true },
    });
    const existingMap = new Map<string, any>(existing.map(i => [i.listingId, i]));

    // Geçerli listing ID'lerini doğrula (silinmiş veya pasif listing'leri filtrele)
    const listingIds = guestItems.map(i => i.listingId);
    const validListings = await this.prisma.listing.findMany({
      where: { id: { in: listingIds }, status: 'ACTIVE' },
      select: { id: true },
    });
    const validIds = new Set(validListings.map(l => l.id));

    let merged = 0;
    let skipped = 0;

    for (const item of guestItems) {
      if (!validIds.has(item.listingId)) {
        skipped++;
        continue; // Aktif olmayan listing'i sessizce atla
      }

      const qty = Math.max(1, Math.min(item.quantity, 99)); // 1-99 arası sınırla
      const current = existingMap.get(item.listingId) as any;

      if (current) {
        // Çakışma: mevcut quantity + misafir quantity (max 99)
        await this.prisma.cartItem.update({
          where: { id: current.id },
          data: { quantity: Math.min(current.quantity + qty, 99) },
        });
      } else {
        // Yeni ürün — sepete ekle
        await this.prisma.cartItem.create({
          data: { cartId: cart.id, listingId: item.listingId, quantity: qty },
        });
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
