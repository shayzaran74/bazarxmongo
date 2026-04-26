import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateAdminProductCommand } from './create-admin-product.command';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(CreateAdminProductCommand)
export class CreateAdminProductHandler implements ICommandHandler<CreateAdminProductCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateAdminProductCommand) {
    const { data, adminId } = command;

    if (!data.name && !data.title) {
      throw new BadRequestException('Ürün adı gereklidir');
    }

    // Katalog Ürününü oluştur
    // Slug oluştur
    const name = data.name || data.title;
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7);

    // Katalog Ürününü oluştur
    const catalogProduct = await this.prisma.catalogProduct.create({
      data: {
        name: name,
        slug: slug,
        brand: data.brandName || 'Genel',
        description: data.description || name,
        gtin: data.gtin || data.barcode,
        categoryId: data.categoryId,
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
        // Brand ilişkisi varsa bağlayalım
        brands: data.brandId ? {
          connect: { id: data.brandId }
        } : undefined
      }
    });

    // Eğer adminin kendisine ait bir satıcı hesabı yoksa BazarX genel vendor'unu bulalım
    let vendor = await this.prisma.vendor.findUnique({
      where: { userId: adminId }
    });

    if (!vendor) {
      vendor = await this.prisma.vendor.findFirst({
        where: { profile: { storeName: 'BazarX Sistem' } }
      });
      
      if (!vendor) {
        // Sistem Şirketi oluştur veya bul
        let company = await this.prisma.company.findFirst({
          where: { name: 'BazarX Sistem' }
        });

        if (!company) {
          company = await this.prisma.company.create({
            data: {
              name: 'BazarX Sistem',
              status: 'APPROVED',
              vatRate: 20
            }
          });
        }

        // Sistem Satıcısı (Vendor) oluştur
        vendor = await this.prisma.vendor.create({
          data: {
            userId: adminId,
            companyId: company.id,
            status: 'APPROVED',
            slug: 'bazarx-sistem-' + Math.random().toString(36).substring(2, 7),
            profile: {
              create: {
                storeName: 'BazarX Sistem',
                description: 'Sistem satıcısı'
              }
            }
          }
        });
      }
    }

    // Fiyat ve stok varsa Listing (İlan) oluştur
    if (data.price !== undefined || data.stock !== undefined) {
      await this.prisma.listing.create({
        data: {
          catalogProductId: catalogProduct.id,
          vendorId: vendor.id,
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
