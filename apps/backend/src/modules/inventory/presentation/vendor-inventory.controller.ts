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
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';
import { InventoryLog } from '@barterborsa/shared-persistence/schemas/backend/inventoryLog.schema';
import { randomBytes } from 'crypto';
import { ImportCategoryResolverService } from '../../catalog/application/services/import-category-resolver.service';
import { TrendyolImportNormalizerService } from '../../catalog/application/services/trendyol-import-normalizer.service';
import { ImportTemplateService } from '../../vendor/application/services/import-template.service';

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

  constructor(
    private readonly categoryResolver: ImportCategoryResolverService,
    private readonly trendyolNormalizer: TrendyolImportNormalizerService,
  ) {}

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

    const exportData = listings.map((l: Record<string, unknown>) => ({
      'ID': l.id,
      'Ürün Adı': l.title,
      'SKU': l.sku || '-',
      'Stok': Number(l.stock),
      'Fiyat': Number(l.price),
      'Kategori': (l.catalogProductId as Record<string, unknown> | undefined)?.categoryId || '-',
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
    const templateService = new ImportTemplateService();
    const buffer = templateService.generateVendorExcel();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=bazarx_urun_yukleme_sablonu.xlsx');
    res.status(200).end(buffer);
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

          const categoryId = await this.categoryResolver.resolveCategoryId(categoryName);

          let catalogProduct = await CatalogProduct.findOne({ slug }).lean();
          if (!catalogProduct) {
            const pid = 'cp-' + Date.now() + '-' + randomBytes(4).toString('hex');
          catalogProduct = (await CatalogProduct.create({
              id: pid,
              name: rawName,
              slug,
              categoryId,
              status: 'ACTIVE',
              brand: row['Marka'] || 'Genel',
              description: rawName,
            })) as unknown as typeof catalogProduct;

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
          } // close if (!catalogProduct)

          let existingListing = null;
          const searchSku = barcode ? String(barcode).trim() : '';
          if (searchSku) {
            existingListing = await Listing.findOne({ vendorId: vendor.id, sku: searchSku }).lean();
          }
          if (!existingListing && catalogProduct) {
            existingListing = await Listing.findOne({ vendorId: vendor.id, catalogProductId: catalogProduct.id }).lean();
          }

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
        } catch (err: unknown) {
          failedCount++;
          errors.push(`${row['Başlık'] || 'Bilinmeyen'}: ${(err instanceof Error ? err.message : String(err))}`);
        }
      }

      return { success: true, results: { success: successCount, failed: failedCount, errors } };
    } catch (error: unknown) {
      return { success: false, error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) };
    }
  }

  @ApiOperation({ summary: 'Trendyol JSON formatından ürün içe aktarımı (Vendor)' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('import-trendyol')
  async importTrendyol(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const products = body.products as Record<string, unknown>[] | undefined;
    const defaultStock = body.defaultStock as number | undefined;
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
        const normalized = await this.trendyolNormalizer.normalize(raw);
        const title = normalized.name;
        const price = normalized.price;
        const imageUrls = normalized.imageUrls;
        const brand = normalized.brand;
        const description = normalized.description || title;
        const stockToUse = normalized.stock > 1 ? normalized.stock : (Number(defaultStock) > 0 ? Number(defaultStock) : 1);
        const sku = normalized.sku;
        const resolvedCategoryId = normalized.categoryId;

        const slug = this.slugify(`${title}-${normalized.externalId || normalized.barcode}`);

        const specs: Record<string, unknown> = { ...normalized.attributes };

        let catalogProduct = await CatalogProduct.findOne({ slug }).lean();
        if (!catalogProduct) {
          const pid = 'cp-' + Date.now() + '-' + randomBytes(4).toString('hex');
          catalogProduct = (await CatalogProduct.create({
            _id: pid,
            id: pid,
            name: title,
            slug,
            categoryId: resolvedCategoryId,
            status: 'ACTIVE',
            isFeatured: true,
            brand,
            description,
            specs,
          })) as unknown as typeof catalogProduct;
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

        let existingListing = null;
        if (sku && String(sku).trim() !== '') {
          existingListing = await Listing.findOne({ vendorId: vendor.id, sku: String(sku).trim() }).lean();
        }
        if (!existingListing) {
          existingListing = await Listing.findOne({ vendorId: vendor.id, catalogProductId: catalogProduct!.id }).lean();
        }

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

  private slugify(text: string): string {
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
    };
    return text.toString().split('').map(c => trMap[c] || c).join('').toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }
}