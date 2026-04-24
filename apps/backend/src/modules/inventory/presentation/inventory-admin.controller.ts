import { Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import * as XLSX from 'xlsx';

@ApiTags('Inventory Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class InventoryAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all inventory transfers for admin' })
  @Get('transfers')
  async getTransfers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      this.prisma.transfer.findMany({
        include: {
          vendor: { include: { company: true } },
          items: { include: { listing: true } }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.transfer.count()
    ]);

    return {
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum
      }
    };
  }

  @ApiOperation({ summary: 'Import transfers/products from Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('transfers/import-excel')
  async importExcel(@UploadedFile() file: any) {
    if (!file) {
      return { success: false, error: 'Dosya yüklenmedi' };
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames.find(n => n.includes('Ürün')) || workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // İlk admin satıcısını (vendor) varsayılan olarak seçiyoruz (Admin yüklemeleri için)
      let defaultVendor = await this.prisma.vendor.findFirst({
        where: { tier: 'CORE' } 
      });

      if (!defaultVendor) {
        defaultVendor = await this.prisma.vendor.findFirst();
        console.log('[ExcelImport] CORE tier satıcı bulunamadı, mevcut ilk satıcı seçildi:', defaultVendor?.id);
      }

      if (!defaultVendor) {
        return { 
          success: false, 
          error: 'Sistemde ürünleri sahiplenecek hiçbir satıcı (Vendor) bulunamadı. Lütfen önce bir satıcı oluşturun.' 
        };
      }

      for (const row of rows) {
        try {
          const rawName = row['Başlık'] || row['Ürün Adı'];
          if (!rawName) continue;

          const barcode = String(row['Barkod'] || '');
          const sku = String(row['SKU'] || '');
          const brandName = row['Marka'] || 'Genel';
          const categoryName = row['Kategori'] || 'Genel';
          const description = row['Açıklama'] || '';
          const mediaUrls = row['Medya (3-5 Görsel, virgüle ayırın)'] || '';
          const priceStr = row['Fiyat'];
          const stockStr = row['Envanter Miktar'];
          
          const safeSlug = this.slugify(`${rawName}-${barcode || Math.random().toString(36).substring(7)}`);

          // 1. Marka 
          const brand = await this.prisma.brand.upsert({
            where: { name: brandName },
            update: { updatedAt: new Date() },
            create: { name: brandName, slug: this.slugify(brandName), status: 'APPROVED' }
          });

          // 2. Kategori 
          let category = await this.prisma.category.findUnique({ where: { slug: this.slugify(categoryName) } });
          if (!category) {
            category = await this.prisma.category.create({
              data: { name: categoryName, slug: this.slugify(categoryName), isActive: true }
            });
          }

          // 3. Catalog Product
          const product = await this.prisma.catalogProduct.upsert({
            where: { slug: safeSlug },
            update: {
              name: rawName,
              description,
              brand: brandName,
              gtin: barcode || undefined,
              categoryId: category.id,
              status: 'ACTIVE',
              updatedAt: new Date(),
              // Markayı ürüne bağlıyoruz
              brands: { connect: [{ id: brand.id }] }
            },
            create: {
              name: rawName,
              slug: safeSlug,
              description,
              brand: brandName,
              gtin: barcode || undefined,
              categoryId: category.id,
              status: 'ACTIVE',
              brands: { connect: [{ id: brand.id }] }
            }
          });

          // 4. Medya 
          if (mediaUrls) {
            const urls = String(mediaUrls).split(',').map((u: string) => u.trim()).filter(Boolean);
            for (const [index, url] of urls.entries()) {
              const mediaExists = await this.prisma.productMedia.findFirst({
                where: { productId: product.id, url }
              });
              if (!mediaExists) {
                await this.prisma.productMedia.create({
                  data: { productId: product.id, url, type: 'IMAGE', sortOrder: index }
                });
              }
            }
          }

          // 5. Listing (Fiyat ve Stok burada tutuluyor)
          if (defaultVendor && priceStr) {
            const price = parseFloat(String(priceStr).replace(',', '.'));
            const stock = parseInt(String(stockStr), 10) || 10;
            
            if (!isNaN(price)) {
              await this.prisma.listing.upsert({
                where: { slug: safeSlug },
                update: {
                  price,
                  stock,
                  title: rawName,
                  description,
                  sku: sku || undefined
                },
                create: {
                  vendorId: defaultVendor.id,
                  catalogProductId: product.id,
                  title: rawName,
                  slug: safeSlug,
                  description,
                  price,
                  stock,
                  sku: sku || undefined,
                  status: 'ACTIVE'
                }
              });
            }
          }

          successCount++;
        } catch (err: any) {
          failedCount++;
          console.error('[ExcelImport Error details]:', err);
          errors.push(`${row['Başlık'] || 'Bilinmeyen'}: ${err.message}`);
        }
      }

      return {
        success: true,
        results: {
          success: successCount,
          failed: failedCount,
          errors
        }
      };
    } catch (error: any) {
      console.error('[ExcelImport] Genel Hata:', error);
      return {
        success: false,
        error: 'Excel verisi işlenirken bir hata oluştu: ' + error.message
      };
    }
  }

  private slugify(text: string): string {
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
    };
    return text
      .split('')
      .map(c => trMap[c] || c)
      .join('')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
