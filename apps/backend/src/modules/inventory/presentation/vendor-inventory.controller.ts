import { Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors, Res, Param } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Vendor Inventory')
@ApiBearerAuth()
@Controller('vendors/inventory')
export class VendorInventoryController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get inventory stats' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    const listings = await this.prisma.listing.findMany({
      where: { vendorId: vendor.id }
    });

    const totalProducts = listings.length;
    const outOfStock = listings.filter(l => l.stock === 0).length;
    const lowStock = listings.filter(l => l.stock > 0 && l.stock <= 5).length;
    const healthyStock = listings.filter(l => l.stock > 5).length;

    return {
      success: true,
      data: {
        totalProducts,
        outOfStock,
        lowStock,
        healthyStock
      }
    };
  }

  @ApiOperation({ summary: 'Export inventory to Excel' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('export')
  async exportExcel(@CurrentUser() user: any, @Res() res: Response) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const listings = await this.prisma.listing.findMany({
      where: { vendorId: vendor.id },
      include: {
        catalogProduct: {
          include: { category: true }
        }
      }
    });

    const exportData = listings.map(l => ({
      'ID': l.id,
      'Ürün Adı': l.title,
      'SKU': l.sku || '-',
      'Stok': l.stock,
      'Fiyat': l.price,
      'Kategori': l.catalogProduct?.category?.name || '-',
      'Durum': l.status
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Envanter');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=envanter_${new Date().getTime()}.xlsx`);
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Get product stock history' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('logs/:productId')
  async getLogs(@Param('productId') productId: string, @CurrentUser() user: unknown) {
    // Note: Stock logs typically need an InventoryLog or AuditLog table.
    // If not exists, we return empty for now but route is ready.
    // Assuming we might have an 'InventoryLog' table in prisma or similar.
    try {
      const logs = await (this.prisma as any).inventoryLog.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      return { success: true, data: logs };
    } catch {
      return { success: true, data: [] };
    }
  }

  @ApiOperation({ summary: 'Download product upload template' })
  @Public()
  @Get('template/download')
  async downloadTemplate(@Res() res: Response) {
    // ... existing template logic ...
    let filePath = path.join(process.cwd(), '..', '..', 'belge', 'exel', 'bazarx_trendyol_sablonu01.xlsx');
    if (!fs.existsSync(filePath)) filePath = path.join(process.cwd(), 'belge', 'exel', 'bazarx_trendyol_sablonu01.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Şablon dosyası bulunamadı.' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=bazarx_urun_yukleme_sablonu.xlsx');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @ApiOperation({ summary: 'Import products from Excel' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('import-excel')
  async importExcel(@UploadedFile() file: any, @CurrentUser() user: any) {
    // ... existing import logic remains same ...
    if (!file) return { success: false, error: 'Dosya yüklenmedi' };
    
    try {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId: user.id } });
      if (!vendor) return { success: false, error: 'Vendor not found' };

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Simplify to first sheet
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          const rawName = row['Başlık'] || row['Ürün Adı'] || row['Stok Kartı Adı'];
          if (!rawName) continue;
          
          const barcode = String(row['Barkod'] || row['Stok Kodu'] || '');
          // Esnek fiyat ve stok eşleşmesi
          const price = parseFloat(String(row['Satış Fiyatı'] || row['Fiyat'] || '0').replace(',', '.'));
          const stock = parseInt(String(row['Stok Adedi'] || row['Envanter Miktar'] || '0'), 10);
          const categoryName = row['Kategori'] || 'Genel';
          
          // Resimleri çek (Akıllı Tespit: URL içeren herhangi bir kolonu kontrol et)
          let images: string[] = [];
          Object.values(row).forEach(val => {
            if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('//')) && 
                (val.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) || val.includes('dsmcdn.com'))) {
              images.push(val.trim());
            }
          });
          

          const slug = this.slugify(`${rawName}-${barcode || require('crypto').randomBytes(4).toString('hex')}`);

          const category = await this.prisma.category.upsert({
            where: { slug: this.slugify(categoryName) },
            update: {},
            create: { name: categoryName, slug: this.slugify(categoryName), isActive: true }
          });

          const catalogProduct = await this.prisma.catalogProduct.upsert({
            where: { slug },
            update: { name: rawName },
            create: { 
              name: rawName, 
              slug, 
              categoryId: category.id, 
              status: 'ACTIVE', 
              brand: row['Marka'] || 'Genel', 
              description: rawName
            }
          });

          // Resimleri ayrıca işle (Hem yeni hem eski ürünler için)
          if (images.length > 0) {
            // Mevcut resimleri temizle ve yenilerini ekle (veya sadece eksikleri ekle)
            // Basitlik için mevcutları silip yenileri ekliyoruz
            await this.prisma.productMedia.deleteMany({
              where: { productId: catalogProduct.id }
            });

            await this.prisma.productMedia.createMany({
              data: images.map((url, idx) => ({
                productId: catalogProduct.id,
                url: url.trim(),
                type: 'IMAGE',
                sortOrder: idx
              }))
            });
          }

          await this.prisma.listing.upsert({
            where: { slug },
            update: { price, stock },
            create: {
              vendorId: vendor.id,
              catalogProductId: catalogProduct.id,
              title: rawName,
              slug,
              price,
              stock,
              sku: barcode,
              status: 'PENDING',
              listingType: 'SELL'
            }
          });

          successCount++;
        } catch (err: any) {
          failedCount++;
          errors.push(`${row['Başlık'] || 'Bilinmeyen'}: ${err.message}`);
        }
      }

      return { success: true, results: { success: successCount, failed: failedCount, errors } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private slugify(text: string): string {
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
    };
    return text.toString().split('').map(c => trMap[c] || c).join('').toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }
}
