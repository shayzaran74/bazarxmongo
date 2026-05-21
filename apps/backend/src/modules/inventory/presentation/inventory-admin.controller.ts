import { Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import * as XLSX from 'xlsx';
import { Transfer } from '@barterborsa/shared-persistence/schemas/backend/transfer.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';
import { Category } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { randomBytes } from 'crypto';

@ApiTags('Inventory Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/inventory')
export class InventoryAdminController {
  @ApiOperation({ summary: 'List all inventory transfers for admin' })
  @Get('transfers')
  async getTransfers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const pageNum  = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip     = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Transfer.find()
        .populate('vendor')
        .populate('items')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transfer.countDocuments(),
    ]);

    return { success: true, data: { items, total, page: pageNum, limit: limitNum } };
  }

  @ApiOperation({ summary: 'Import transfers/products from Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('transfers/import-excel')
  async importExcel(@UploadedFile() file: any) {
    if (!file) return { success: false, error: 'Dosya yüklenmedi' };

    try {
      const workbook  = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames.find(n => n.includes('Ürün')) || workbook.SheetNames[0];
      const sheet     = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      let successCount = 0;
      let failedCount  = 0;
      const errors: string[] = [];

      let defaultVendor = await Vendor.findOne({ userId: { $exists: true } }).select('id').lean();
      if (!defaultVendor) {
        return { success: false, error: 'Sistemde ürünleri sahiplenecek hiçbir satıcı (Vendor) bulunamadı.' };
      }

      const allCategories = await Category.find().select('id name slug').lean();
      const categoryCache = new Map<string, string>();
      for (const cat of allCategories) {
        if (cat.slug) categoryCache.set(cat.slug, cat.id);
        categoryCache.set(this.slugify(cat.name ?? ''), cat.id);
      }

      for (const row of rows) {
        try {
          const rawName = row['Başlık'] || row['Ürün Adı'];
          if (!rawName) continue;

          const barcode       = String(row['Barkod'] || '').trim();
          const sku           = String(row['SKU'] || '').trim();
          const brandName     = (row['Marka'] || 'Genel').trim();
          const categoryName  = (row['Kategori'] || 'Genel').trim();
          const description   = row['Açıklama'] || '';
          const mediaUrls    = row['Medya (3-5 Görsel, virgüle ayırın)'] || '';
          const priceStr     = row['Fiyat'];
          const stockStr     = row['Envanter Miktar'];

          const safeSlug = this.slugify(
            `${rawName}-${barcode || randomBytes(4).toString('hex')}`
          );

          // 1. Marka
          let brand = await Brand.findOne({ name: brandName }).lean();
          if (!brand) {
            const brandId = 'brand-' + Date.now() + '-' + randomBytes(4).toString('hex');
            brand = await Brand.create({ id: brandId, name: brandName, slug: this.slugify(brandName), status: 'APPROVED' });
          }

          // 2. Kategori
          const categorySlug = this.slugify(categoryName);
          let categoryId = categoryCache.get(categorySlug);

          if (!categoryId) {
            const catId = 'cat-' + Date.now() + '-' + randomBytes(4).toString('hex');
            await Category.create({ id: catId, name: categoryName, slug: categorySlug, isActive: true });
            categoryId = catId;
            categoryCache.set(categorySlug, categoryId);
            categoryCache.set(this.slugify(categoryName), categoryId);
          }

          // 3. Catalog Product
          let product = await CatalogProduct.findOne({ slug: safeSlug }).lean();
          if (!product) {
            const pid = 'cp-' + Date.now() + '-' + randomBytes(4).toString('hex');
            product = (await CatalogProduct.create({
              id: pid,
              name: rawName,
              slug: safeSlug,
              description,
              brand: brandName,
              gtin: barcode || undefined,
              categoryId,
              status: 'ACTIVE',
            })) as any;
          }

          // 4. Medya
          if (mediaUrls) {
            const urls = String(mediaUrls).split(',').map((u: string) => u.trim()).filter(Boolean);
            for (let idx = 0; idx < urls.length; idx++) {
              const url = urls[idx];
              const mediaExists = await ProductMedia.findOne({ productId: product!.id, url }).lean();
              if (!mediaExists) {
                await ProductMedia.create({
                  id: 'pm-' + Date.now() + '-' + idx,
                  productId: product!.id,
                  url,
                  type: 'IMAGE',
                  sortOrder: idx,
                });
              }
            }
          }

          // 5. Listing
          if (priceStr !== undefined && priceStr !== null && priceStr !== '') {
            const price = parseFloat(String(priceStr).replace(',', '.'));
            const stock = parseInt(String(stockStr ?? 10), 10) || 10;

            if (!isNaN(price)) {
              let listing = await Listing.findOne({ slug: safeSlug }).lean();
              if (listing) {
                await Listing.updateOne({ id: listing.id }, { $set: { price, stock, title: rawName, description, sku: sku || undefined } }).exec();
              } else {
                await Listing.create({
                  id: 'lst-' + Date.now() + '-' + randomBytes(4).toString('hex'),
                  vendorId: defaultVendor.id,
                  catalogProductId: product!.id,
                  title: rawName,
                  slug: safeSlug,
                  description,
                  price,
                  stock,
                  sku: sku || undefined,
                  status: 'ACTIVE',
                });
              }
            }
          }

          successCount++;
        } catch (err: unknown) {
          failedCount++;
          console.error('[ExcelImport Error]:', err);
          errors.push(`${row['Başlık'] || 'Bilinmeyen'}: ${(err instanceof Error ? err.message : String(err))}`);
        }
      }

      return { success: true, results: { success: successCount, failed: failedCount, errors } };
    } catch (error: unknown) {
      console.error('[ExcelImport] Genel Hata:', error);
      return { success: false, error: 'Excel verisi işlenirken bir hata oluştu: ' + (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) };
    }
  }

  private slugify(text: string): string {
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
    };
    return text
      .split('').map(c => trMap[c] || c).join('')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}