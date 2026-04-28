import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateAdminProductCommand } from './create-admin-product.command';
import { BadRequestException } from '@nestjs/common';
import { SystemVendorService } from '../../infrastructure/services/system-vendor.service';
import { randomBytes } from 'crypto';

@CommandHandler(CreateAdminProductCommand)
export class CreateAdminProductHandler implements ICommandHandler<CreateAdminProductCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemVendorService: SystemVendorService
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

    let catalogProduct;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const suffix = randomBytes(4).toString('hex');
        const slug = `${baseSlug}-${suffix}`;

        catalogProduct = await this.prisma.catalogProduct.create({
          data: {
            name: name,
            slug: slug,
            brand: data.brandName || 'Genel',
            description: data.description || name,
            gtin: data.gtin || data.barcode,
            categoryId: (data.categoryId && data.categoryId !== '') ? data.categoryId : null,
            status: data.status || 'ACTIVE',
            isFeatured: data.isFeatured || false,
            isSpecialOffer: data.isSpecialOffer || false,
            isFlashSale: data.isFlashSale || false,
            media: data.productImages ? {
              create: data.productImages.map((url: string, index: number) => ({
                url,
                type: 'IMAGE',
                sortOrder: index
              }))
            } : undefined,
            brands: data.brandId ? {
              connect: { id: data.brandId }
            } : undefined
          }
        });
        break; // Success
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
          attempts++;
          if (attempts === maxAttempts) throw error;
        } else {
          throw error;
        }
      }
    }

    const vendorId = this.systemVendorService.getSystemVendorId();

    // 2. Fiyat ve stok varsa Listing (İlan) oluştur
    if (data.price !== undefined || data.stock !== undefined) {
      await this.prisma.listing.create({
        data: {
          catalogProductId: catalogProduct?.id || '',
          vendorId: vendorId || '',
          title: data.name || data.title,
          description: data.description,
          price: data.price !== undefined ? parseFloat(String(data.price)) : 0,
          stock: data.stock !== undefined ? parseInt(String(data.stock), 10) : 0,
          status: 'ACTIVE',
          sku: data.sku,
        }
      });
    }

    return { success: true, message: 'Ürün başarıyla oluşturuldu', data: catalogProduct };
  }
}
