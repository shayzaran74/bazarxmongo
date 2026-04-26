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
    const catalogProduct = await this.prisma.catalogProduct.create({
      data: {
        name: data.name || data.title,
        description: data.description,
        gtin: data.gtin || data.barcode,
        categoryId: data.categoryId,
        status: data.status || 'ACTIVE',
        isFeatured: data.isFeatured || false,
        isSpecialOffer: data.isSpecialOffer || false,
        isFlashSale: data.isFlashSale || false,
        media: data.productImages ? {
          create: data.productImages.map((url: string, index: number) => ({
            url,
            mediaType: 'IMAGE',
            sortOrder: index,
            isMain: index === 0
          }))
        } : undefined
      }
    });

    // Eğer adminin kendisine ait bir satıcı hesabı yoksa BazarX genel vendor'unu bulalım
    // Veya sadece satıcı yoksa Listing oluşturmayabiliriz.
    let vendor = await this.prisma.vendor.findUnique({
      where: { userId: adminId }
    });

    if (!vendor) {
      // Admin için bir dummy vendor oluştur veya sistem vendorunu bul
      vendor = await this.prisma.vendor.findFirst({
        where: { profile: { storeName: 'BazarX Sistem' } }
      });
      
      if (!vendor) {
        // Fallback: İlk admin olmayan aktif vendoru da seçebilir ama en iyisi admin için sistem vendor oluşturmaktır
        vendor = await this.prisma.vendor.create({
          data: {
            userId: adminId,
            status: 'ACTIVE',
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
