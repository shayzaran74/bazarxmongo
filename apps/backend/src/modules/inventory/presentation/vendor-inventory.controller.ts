import { Controller, Get, Post, Body, UploadedFile, UseGuards, UseInterceptors, Res, Param, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { Category } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';
import { InventoryLog } from '@barterborsa/shared-persistence/schemas/backend/inventoryLog.schema';
import { randomBytes } from 'crypto';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Vendor Inventory')
@ApiBearerAuth()
@Controller('vendors/inventory')
export class VendorInventoryController {
  private readonly logger = new Logger(VendorInventoryController.name);

  @ApiOperation({ summary: 'Get inventory stats' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();
    if (!vendor) return { success: false, message: 'Vendor not found' };

    const listings = await Listing.find({ vendorId: vendor.id }).select('stock').lean();

    const totalProducts = listings.length;
    const outOfStock = listings.filter(l => Number(l.stock) === 0).length;
    const lowStock = listings.filter(l => Number(l.stock) > 0 && Number(l.stock) <= 5).length;
    const healthyStock = listings.filter(l => Number(l.stock) > 5).length;

    return {
      success: true,
      data: { totalProducts, outOfStock, lowStock, healthyStock }
    };
  }

  @ApiOperation({ summary: 'Export inventory to Excel' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('export')
  async exportExcel(@CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const listings = await Listing.find({ vendorId: vendor.id })
      .populate('catalogProductId')
      .lean();

    const exportData = listings.map((l: any) => ({
      'ID': l.id,
      'Ürün Adı': l.title,
      'SKU': l.sku || '-',
      'Stok': Number(l.stock),
      'Fiyat': Number(l.price),
      'Kategori': (l as any).catalogProductId?.categoryId || '-',
      'Durum': l.status,
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
  async getLogs(@Param('productId') productId: string, @CurrentUser() user: AuthenticatedUser) {
    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();
    if (!vendor) return { success: true, data: [] };

    try {
      const logs = await InventoryLog.find({ listingId: productId, vendorId: vendor.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      return { success: true, data: logs };
    } catch {
      return { success: true, data: [] };
    }
  }

  @ApiOperation({ summary: 'Download product upload template' })
  @Public()
  @Get('template/download')
  async downloadTemplate(@Res() res: Response) {
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
  async importExcel(@UploadedFile() file: any, @CurrentUser() user: AuthenticatedUser) {
    if (!file) return { success: false, error: 'Dosya yüklenmedi' };

    try {
      const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();
      if (!vendor) return { success: false, error: 'Vendor not found' };

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          const rawName = row['Başlık'] || row['Ürün Adı'] || row['Stok Kartı Adı'];
          if (!rawName) continue;

          const barcode = String(row['Barkod'] || row['Stok Kodu'] || '');
          const price = parseFloat(String(row['Satış Fiyatı'] || row['Fiyat'] || '0').replace(',', '.'));
          const stock = parseInt(String(row['Stok Adedi'] || row['Envanter Miktar'] || '0'), 10);
          const categoryName = row['Kategori'] || 'Genel';

          let images: string[] = [];
          Object.values(row).forEach(val => {
            if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('//')) &&
                (val.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) || val.includes('dsmcdn.com'))) {
              images.push(val.trim());
            }
          });

          const slug = this.slugify(`${rawName}-${barcode || randomBytes(4).toString('hex')}`);

          const categorySlug = this.slugify(categoryName);
          let category = await Category.findOne({ slug: categorySlug }).exec();
          if (!category) {
            const catId = 'cat-' + Date.now() + '-' + randomBytes(4).toString('hex');
            category = await Category.create({ id: catId, name: categoryName, slug: categorySlug, isActive: true });
          }

          let catalogProduct = await CatalogProduct.findOne({ slug }).lean();
          if (!catalogProduct) {
            const pid = 'cp-' + Date.now() + '-' + randomBytes(4).toString('hex');
            catalogProduct = (await CatalogProduct.create({
              id: pid,
              name: rawName,
              slug,
              categoryId: category.id,
              status: 'ACTIVE',
              brand: row['Marka'] || 'Genel',
              description: rawName,
            })) as any;
          }

          if (images.length > 0) {
            await ProductMedia.deleteMany({ productId: catalogProduct!.id }).exec();
            for (let idx = 0; idx < images.length; idx++) {
              await ProductMedia.create({
                id: 'pm-' + Date.now() + '-' + idx,
                productId: catalogProduct!.id,
                url: images[idx].trim(),
                type: 'IMAGE',
                sortOrder: idx,
              });
            }
          }

          const existingListing = await Listing.findOne({ vendorId: vendor.id, sku: barcode || undefined }).lean();

          if (existingListing) {
            await Listing.updateOne({ id: existingListing.id }, { $set: { price, stock } }).exec();
          } else {
            const safeSlug = `v${vendor.id.slice(0, 8)}-${slug}`;
            await Listing.create({
              id: 'lst-' + Date.now() + '-' + randomBytes(4).toString('hex'),
              vendorId: vendor.id,
              catalogProductId: catalogProduct!.id,
              title: rawName,
              slug: safeSlug,
              price,
              stock,
              sku: barcode,
              status: 'PENDING',
              listingType: 'SELL',
            });
          }

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

  @ApiOperation({ summary: 'Trendyol JSON formatından ürün içe aktarımı (Vendor)' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('import-trendyol')
  async importTrendyol(
    @Body('products') products: Record<string, unknown>[],
    @Body('defaultStock') defaultStock: number | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!Array.isArray(products) || products.length === 0) {
      throw new BadRequestException('products dizisi boş olamaz');
    }

    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();
    if (!vendor) return { success: false, error: 'Vendor bulunamadı' };

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const raw of products) {
      try {
        const externalId = String(raw['external_id'] ?? '');
        const rawTitle = String(raw['title'] ?? '');
        if (!rawTitle) continue;
        const title = this.cleanTrendyolTitle(rawTitle);

        const price = Number(raw['price'] ?? 0);
        const imageUrls = this.extractImageUrls(raw);
        const rawSubcategory = typeof raw['subcategory'] === 'string' ? raw['subcategory'] : '';
        const explicitBrand = typeof raw['brand'] === 'string' ? raw['brand'] : null;
        const brandRaw = explicitBrand || (rawSubcategory ? rawSubcategory.split('>')[0].trim() : 'Genel');

        let brand = brandRaw.trim();
        if (brand.length > 20 || brand.includes(' ')) {
          brand = brand.split(' ')[0].trim();
        }
        brand = brand.length > 50 ? brand.slice(0, 50) : brand;
        const rawDesc = typeof raw['description'] === 'string' ? raw['description'] : '';
        const { cleanDescription, platformInfo, stock: parsedStock } = this.parseTrendyolDesc(rawDesc);
        const description = cleanDescription || title;
        const stockToUse = parsedStock > 1 ? parsedStock : (Number(defaultStock) > 0 ? Number(defaultStock) : 1);
        const sku = `TY-${externalId}`;

        const slug = this.slugify(`${title}-${externalId}`);
        const categoryParts = rawSubcategory
          ? rawSubcategory.split('>').map(p => p.trim()).filter(p => p && p.length > 2 && !p.includes(title.slice(0, 10)))
          : ['Genel'];

        const activeParts = categoryParts.slice(0, 4);

        let lastCategoryId: string | null = null;
        let lastCategory: any = null;

        for (const partName of activeParts) {
          const partSlug = this.slugify(partName);
          const existingCat = await Category.findOne({ slug: partSlug }).lean();
          if (!existingCat) {
            const catId = 'cat-' + Date.now() + '-' + randomBytes(4).toString('hex');
            lastCategory = await Category.create({
              _id: catId,
              id: catId,
              slug: partSlug,
              isActive: true,
              name: partName,
              parentId: lastCategoryId
            });
          } else {
            lastCategory = existingCat;
          }
          lastCategoryId = lastCategory.id;
        }

        const category = lastCategory;

        const attrs = raw['attributes'] as Record<string, unknown> | null | undefined;
        const specs: any = { ...(attrs ?? {}) };
        if (platformInfo) specs['_platformInfo'] = platformInfo;

        let catalogProduct = await CatalogProduct.findOne({ slug }).lean();
        if (!catalogProduct) {
          const pid = 'cp-' + Date.now() + '-' + randomBytes(4).toString('hex');
          catalogProduct = (await CatalogProduct.create({
            _id: pid,
            id: pid,
            name: title,
            slug,
            categoryId: category.id,
            status: 'ACTIVE',
            isFeatured: true,
            brand,
            description,
            specs,
          })) as any;
        } else {
          await CatalogProduct.updateOne({ id: catalogProduct.id }, { $set: { name: title, description, specs } }).exec();
        }

        if (imageUrls.length > 0) {
          this.logger.log(`[TrendyolImport] ${imageUrls.length} görsel bulundu: ${imageUrls.join(', ')}`);
          await ProductMedia.deleteMany({ productId: catalogProduct!.id }).exec();
          for (let idx = 0; idx < imageUrls.length; idx++) {
            const pmid = 'pm-' + Date.now() + '-' + idx;
            await ProductMedia.create({
              _id: pmid,
              id: pmid,
              productId: catalogProduct!.id,
              url: imageUrls[idx],
              type: 'IMAGE',
              sortOrder: idx,
            });
          }
        } else {
          this.logger.warn(`[TrendyolImport] Hiç görsel bulunamadı for product: ${title}`);
        }

        const existingListing = await Listing.findOne({ vendorId: vendor.id, sku }).lean();

        if (existingListing) {
          await Listing.updateOne({ id: existingListing.id }, { $set: { price, stock: stockToUse } }).exec();
        } else {
          const safeSlug = `v${vendor.id.slice(0, 8)}-${slug}`;
          const lid = 'lst-' + Date.now() + '-' + randomBytes(4).toString('hex');
          await Listing.create({
            _id: lid,
            id: lid,
            vendorId: vendor.id,
            catalogProductId: catalogProduct!.id,
            title,
            slug: safeSlug,
            price,
            stock: stockToUse,
            sku,
            status: 'PENDING',
            listingType: 'SELL',
          });
        }

        successCount++;
      } catch (err: unknown) {
        failedCount++;
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error(`Import failed for ${String(raw['title'] ?? 'Bilinmeyen')}: ${msg}`);
        errors.push(`${String(raw['title'] ?? 'Bilinmeyen')}: ${msg}`);
      }
    }

    return { success: true, results: { success: successCount, failed: failedCount, errors } };
  }

  private cleanTrendyolTitle(raw: string): string {
    const s = (raw ?? '').trim();
    if (s.length <= 100) return s;
    const mid = Math.floor(s.length / 2);
    for (let offset = 0; offset <= 30; offset++) {
      for (const pos of [mid + offset, mid - offset]) {
        if (pos <= 0 || pos >= s.length || s[pos] !== ' ') continue;
        const first = s.slice(0, pos).trim();
        const second = s.slice(pos).trim();
        const probe = second.slice(0, Math.min(20, second.length)).toLowerCase();
        if (probe.length > 5 && first.toLowerCase().includes(probe)) return first;
        const probe2 = first.slice(0, Math.min(20, first.length)).toLowerCase();
        if (probe2.length > 5 && second.toLowerCase().includes(probe2)) return first;
      }
      if (offset === 0) continue;
    }
    const cut = s.slice(0, 100);
    const lastSpace = cut.lastIndexOf(' ');
    const finalTitle = lastSpace > 50 ? cut.slice(0, lastSpace) : cut;

    return finalTitle.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private parseTrendyolDesc(raw: string): { cleanDescription: string; platformInfo: string; stock: number } {
    if (!raw.trim()) return { cleanDescription: '', platformInfo: '', stock: 1 };

    let stock = 1;
    const moreMatch = raw.match(/(\d+)\s*adetten fazla stok/i);
    if (moreMatch) stock = Math.max(parseInt(moreMatch[1], 10), 1);
    const lessMatch = raw.match(/(\d+)\s*adetten az stok/i);
    if (lessMatch && !moreMatch) stock = Math.max(parseInt(lessMatch[1], 10), 1);

    const specsIdx = raw.indexOf('Ürün Özellikleri:');
    const relevantPart = specsIdx >= 0 ? raw.slice(0, specsIdx) : raw;

    const BOILERPLATE = [
      /^Bu ürün\b/i,
      /tarafından gönderilecektir/i,
      /^Kampanya fiyatından/i,
      /^Ürüne ait garanti belgesi/i,
      /^Ürün teslimi sonrası/i,
      /^Bir ürün, birden fazla satıcı/i,
      /^Bu üründen en fazla/i,
      /^Belirlenen bu limiti/i,
      /adetten fazla stok/i,
      /adetten az stok/i,
      /link ve karekod/i,
      /sıralanmaktadır\.?\s*$/i,
    ];

    const platformLines: string[] = [];
    const cleanLines: string[] = [];
    for (const line of relevantPart.split(/\n/).map(l => l.trim()).filter(Boolean)) {
      if (BOILERPLATE.some(p => p.test(line))) {
        platformLines.push(line);
      } else {
        cleanLines.push(line);
      }
    }
    return {
      cleanDescription: cleanLines.join('\n').trim(),
      platformInfo: platformLines.join('\n').trim(),
      stock,
    };
  }

  private slugify(text: string): string {
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
    };
    return text.toString().split('').map(c => trMap[c] || c).join('').toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  private extractImageUrls(raw: Record<string, unknown>): string[] {
    const urls: string[] = [];
    const seen = new Set<string>();

    if (Array.isArray(raw['image_urls'])) {
      for (const url of raw['image_urls']) {
        if (typeof url === 'string' && this.isValidImageUrl(url) && !seen.has(url)) {
          seen.add(url);
          urls.push(url);
        }
      }
    }

    if (!urls.length && typeof raw['image_url'] === 'string' && this.isValidImageUrl(raw['image_url']) && !seen.has(raw['image_url'])) {
      urls.push(raw['image_url']);
    }

    if (!urls.length) {
      for (const val of Object.values(raw)) {
        if (typeof val === 'string' && this.isValidImageUrl(val) && !seen.has(val)) {
          urls.push(val);
          break;
        }
      }
    }

    return urls;
  }

  private isValidImageUrl(url: string): boolean {
    return url.startsWith('http') &&
      (url.includes('dsmcdn.com') ||
       url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) !== null);
  }
}