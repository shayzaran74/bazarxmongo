// apps/backend/src/modules/catalog/application/commands/update-admin-product.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UpdateAdminProductCommand } from './update-admin-product.command';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';

@CommandHandler(UpdateAdminProductCommand)
export class UpdateAdminProductHandler implements ICommandHandler<UpdateAdminProductCommand> {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(command: UpdateAdminProductCommand) {
    const { productId, data } = command;

    const existing = await CatalogProduct.findOne({ id: productId }).exec();
    if (!existing) throw new NotFoundException('Ürün bulunamadı');

    const productUpdate: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name || data.title)
      productUpdate.name = data.name || data.title;

    if (data.description !== undefined)
      productUpdate.description = data.description;

    if (data.gtin !== undefined || data.barcode !== undefined)
      productUpdate.gtin = data.gtin || data.barcode;

    if (data.brand !== undefined || data.brandName !== undefined)
      productUpdate.brand = data.brand || data.brandName;

    if (data.name || data.title) {
      const nm = data.name || data.title;
      productUpdate.name = nm;
      productUpdate.slug = nm!.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    }

    if (data.categoryId !== undefined) {
      productUpdate.categoryId = (data.categoryId && data.categoryId !== '') ? data.categoryId : null;
    }

    if (data.status !== undefined) productUpdate.status = data.status;
    if (data.isFeatured !== undefined) productUpdate.isFeatured = data.isFeatured;
    if (data.isSpecialOffer !== undefined) productUpdate.isSpecialOffer = data.isSpecialOffer;
    if (data.isFlashSale !== undefined) productUpdate.isFlashSale = data.isFlashSale;

    await CatalogProduct.updateOne({ id: productId }, { $set: productUpdate }).exec();

    if (data.productImages && Array.isArray(data.productImages)) {
      await ProductMedia.deleteMany({ productId }).exec();
      if (data.productImages.length > 0) {
        const mediaDocs = data.productImages.map((url: string, index: number) => ({
          id: 'media-' + crypto.randomUUID(),
          productId,
          url,
          type: 'IMAGE',
          sortOrder: index,
        }));
        await ProductMedia.insertMany(mediaDocs);
      }
    }

    const listingUpdate: Record<string, unknown> = {};
    if (data.price !== undefined) listingUpdate.price = parseFloat(String(data.price));
    if (data.stock !== undefined) {
      listingUpdate.stock = parseInt(String(data.stock), 10);
      listingUpdate.availableQuantity = parseInt(String(data.stock), 10);
    }
    if (data.sku !== undefined) listingUpdate.sku = data.sku;
    if (data.name || data.title) listingUpdate.title = data.name || data.title;
    if (data.description !== undefined) listingUpdate.description = data.description;
    if (data.status !== undefined) listingUpdate.status = data.status;
    if (data.isFeatured !== undefined) listingUpdate.isFeatured = data.isFeatured;
    if (data.isSpecialOffer !== undefined) listingUpdate.isSpecialOffer = data.isSpecialOffer;
    if (data.isFlashSale !== undefined) listingUpdate.isFlashSale = data.isFlashSale;

    if (Object.keys(listingUpdate).length > 0) {
      await Listing.updateMany({ catalogProductId: productId }, { $set: listingUpdate }).exec();
    }

    try {
      const manager = this.cacheManager as unknown as Record<string, (...args: unknown[]) => unknown>;
      if (typeof manager.reset === 'function') {
        await (manager.reset() as Promise<void>);
      } else if (typeof manager.clear === 'function') {
        await (manager.clear() as Promise<void>);
      }
      await manager.del('category-tree');
    } catch (e) {
      // Cache manager hataları kritik değil
    }

    return { success: true, message: 'Ürün başarıyla güncellendi' };
  }
}
