import { Controller, Get, Query, UseGuards, Delete, Param, Post, Body, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Product Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Bulk delete products' })
  @Post('bulk-delete')
  async bulkDelete(@Body('ids') ids: string[]) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return { success: false, error: 'Silinecek ürün ID listesi boş veya geçersiz' };
      }

      let successCount = 0;
      const failedIds: string[] = [];

      for (const id of ids) {
        try {
          await this.prisma.$transaction(async (tx) => {
            // İlanları siliyoruz (eğer sipariş vs ile bağlı değilse)
            await tx.listing.deleteMany({ where: { catalogProductId: id } });
            // Ana ürünü siliyoruz (media ve favoriler onDelete:Cascade ile gider)
            await tx.catalogProduct.delete({ where: { id } });
          });
          successCount++;
        } catch (e: any) {
          failedIds.push(id);
        }
      }

      const message = failedIds.length > 0 
        ? `${successCount} ürün silindi. ${failedIds.length} ürün (sipariş geçmişi olduğu için) silinemedi. Lütfen bu ürünleri pasife alın.`
        : `${successCount} ürün başarıyla silindi.`;

      return {
        success: true, 
        message,
        details: { successCount, failedCount: failedIds.length }
      };
    } catch (error: any) {
      return { success: false, error: 'Toplu silme sırasında hata oluştu: ' + error.message };
    }
  }

  @ApiOperation({ summary: 'List all products for admin' })
  @Get()
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('q') search?: string
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    
    const [rawItems, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
        // Frontend'in ürün resimlerini ve fiyatı (listing üzerinden) görebilmesi için relation'ları ekliyoruz
        include: { category: true, media: { orderBy: { sortOrder: 'asc' } }, listings: true, brands: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.catalogProduct.count({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : {}
      })
    ]);

    const items = rawItems.map(item => {
      const listing = item.listings && item.listings.length > 0 ? item.listings[0] : null;
      return {
        ...item,
        Brand: item.brands && item.brands.length > 0 ? item.brands[0] : null,
        image: item.media && item.media.length > 0 ? item.media[0].url : null,
        images: item.media ? item.media.map(m => m.url) : [],
        price: listing ? listing.price : 0,
        stock: listing ? listing.stock : 0,
        sku: listing ? listing.sku : ''
      };
    });

    return {
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        limit: Number(limit)
      }
    };
  }

  @ApiOperation({ summary: 'Delete a product' })
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.listing.deleteMany({ where: { catalogProductId: id } });
        await tx.catalogProduct.delete({ where: { id } });
      });
      return {
        success: true,
        message: 'Ürün başarıyla silindi'
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Ürün silinirken bir hata oluştu. Ürün sipariş geçmişine sahip olabilir, lütfen silmek yerine pasife alınız.'
      };
    }
  }

  @ApiOperation({ summary: 'Update a product' })
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    try {
      // 1. Ana ürün objesini (CatalogProduct) güncelle
      await this.prisma.catalogProduct.update({
        where: { id },
        data: {
          name: data.name || data.title,
          description: data.description,
          gtin: data.gtin || data.barcode,
          categoryId: data.categoryId,
          status: data.status,
          updatedAt: new Date()
        }
      });

      // 2. Fiyat ve Stok varsa bağlı ilanları (Listing) güncelleyelim.
      if (data.price !== undefined || data.stock !== undefined || data.title || data.name) {
        const updateData: any = {};
        if (data.price !== undefined) updateData.price = parseFloat(data.price);
        if (data.stock !== undefined) updateData.stock = parseInt(data.stock, 10);
        if (data.title || data.name) updateData.title = data.title || data.name;
        if (data.description !== undefined) updateData.description = data.description;

        await this.prisma.listing.updateMany({
          where: { catalogProductId: id },
          data: updateData
        });
      }

      return { success: true, message: 'Ürün başarıyla güncellendi' };
    } catch (error: any) {
      return { success: false, error: 'Güncelleme sırasında hata: ' + error.message };
    }
  }
}
