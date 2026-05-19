// apps/backend/src/modules/commerce/application/commands/add-to-cart.handler.ts
// AddToCartHandler — Mongoose migration (ADR-005 Faz 2b)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { MongoCartRepository } from '../../infrastructure/persistence/mongo-cart.repository';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';
import { AddToCartCommand } from './add-to-cart.command';

@CommandHandler(AddToCartCommand)
export class AddToCartHandler implements ICommandHandler<AddToCartCommand> {
  constructor(
    private readonly cartRepo:    MongoCartRepository,
    private readonly listingRepo:   MongoListingRepository,
  ) {}

  async execute(command: AddToCartCommand) {
    const { userId, productId, quantity } = command;
    let { listingId } = command;

    // productId varsa listing bul
    if (!listingId && productId) {
      const listings = await this.listingRepo.findByCatalogProductId(productId);
      const listing = listings.find(l => l.getProps().status === 'ACTIVE');
      if (!listing) {
        throw new BadRequestException('İlan bulunamadı');
      }
      listingId = listing.id;
    }

    if (!listingId) {
      throw new BadRequestException('Geçersiz ürün bilgisi');
    }

    // Stok ve durum doğrulama
    const listing = await this.listingRepo.findById(listingId);
    if (!listing || listing.getProps().status !== 'ACTIVE') {
      throw new BadRequestException('İlan aktif değil veya bulunamadı');
    }

    const listingProps = listing.getProps();
    const currentCartQty = 0; // Mongo: sepetitem.quantity batch'de alınacak
    const totalRequested = currentCartQty + quantity;

    if (listingProps.stock < totalRequested) {
      throw new BadRequestException(
        `"${listingProps.title}" için yeterli stok bulunmamaktadır (mevcut: ${listingProps.stock})`,
      );
    }

    // Mevcut sepeti getir veya oluştur
    let cart = await this.cartRepo.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepo.findOrCreate(userId);
    }

    // Mevcut item varsa quantity artır, yoksa ekle
    const items = cart.getProps().items;
    const existingItem = items.find(i => i.getProps().listingId === listingId);
    if (existingItem) {
      await this.cartRepo.updateItemQuantity(existingItem.id, totalRequested);
    } else {
      await this.cartRepo.addItem(cart.id, listingId, quantity);
    }

    return { success: true, message: 'Ürün sepete eklendi' };
  }
}
