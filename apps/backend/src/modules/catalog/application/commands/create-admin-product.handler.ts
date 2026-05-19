// apps/backend/src/modules/catalog/application/commands/create-admin-product.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateAdminProductCommand } from './create-admin-product.command';
import { BadRequestException } from '@nestjs/common';
import { SystemVendorService } from '../../infrastructure/services/system-vendor.service';
import { MediaService } from '../../../media/application/services/media.service';
import { randomBytes } from 'crypto';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';

@CommandHandler(CreateAdminProductCommand)
export class CreateAdminProductHandler implements ICommandHandler<CreateAdminProductCommand> {
  constructor(
    private readonly systemVendorService: SystemVendorService,
    private readonly mediaService: MediaService,
  ) {}

  async execute(command: CreateAdminProductCommand) {
    const { data } = command;

    if (!data.name && !data.title) {
      throw new BadRequestException('Ürün adı gereklidir');
    }

    const name = data.name || data.title;
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let catalogProduct: any;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const suffix = randomBytes(4).toString('hex');
        const slug = `${baseSlug}-${suffix}`;

        catalogProduct = await CatalogProduct.create({
          name,
          slug,
          brand: data.brandName || 'Genel',
          description: data.description || name,
          gtin: data.gtin || data.barcode,
          categoryId: (data.categoryId && data.categoryId !== '') ? data.categoryId : null,
          status: data.status || 'ACTIVE',
          isFeatured: data.isFeatured || false,
          isSpecialOffer: data.isSpecialOffer || false,
          isFlashSale: data.isFlashSale || false,
        });

        if (data.brandId) {
          await Brand.updateOne({ id: data.brandId }, { $addToSet: { catalogProductId: catalogProduct.id } }).exec();
        }

        break;
      } catch (error: any) {
        if (error.code === 11000 && error.message?.includes('slug')) {
          attempts++;
          if (attempts === maxAttempts) throw error;
        } else {
          throw error;
        }
      }
    }

    const vendorId = this.systemVendorService.getSystemVendorId();

    if (data.price !== undefined || data.stock !== undefined) {
      const id = 'listing-' + Date.now() + '-' + Math.random().toString(36).substring(7);
      await Listing.create({
        id,
        catalogProductId: catalogProduct.id,
        vendorId: vendorId,
        title: data.name || data.title,
        description: data.description,
        price: data.price !== undefined ? parseFloat(String(data.price)) : 0,
        stock: data.stock !== undefined ? parseInt(String(data.stock), 10) : 0,
        status: 'ACTIVE',
        sku: data.sku,
      });
    }

    return { success: true, message: 'Ürün başarıyla oluşturuldu', data: catalogProduct };
  }
}
