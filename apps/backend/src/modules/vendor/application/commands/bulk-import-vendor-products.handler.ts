// apps/backend/src/modules/vendor/application/commands/bulk-import-vendor-products.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { BulkImportVendorProductsCommand } from './bulk-import-vendor-products.command';
import { FileParserService, ParsedRow } from '../services/file-parser.service';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';
import { MongoCatalogProductRepository } from '../../../catalog/infrastructure/persistence/mongo-catalog-product.repository';
import { Slug } from '../../../catalog/domain/value-objects/slug.vo';

interface ImportResults {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

@CommandHandler(BulkImportVendorProductsCommand)
export class BulkImportVendorProductsHandler
  implements ICommandHandler<BulkImportVendorProductsCommand>
{
  private readonly logger = new Logger(BulkImportVendorProductsHandler.name);

  constructor(
    private readonly listingRepo: MongoListingRepository,
    private readonly catalogProductRepo: MongoCatalogProductRepository,
  ) {}

  async execute(command: BulkImportVendorProductsCommand) {
    this.logger.log(`[BulkImportVendorProductsHandler] Başladı — vendorId: ${command.vendorId}, satır: ${command.rows.length}`);

    const { vendorId, rows } = command;
    const results: ImportResults = { created: 0, updated: 0, failed: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      try {
        await this.processRow(rows[i], vendorId, i + 2, results);
      } catch (err: unknown) {
        results.failed++;
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        results.errors.push(`Satır ${i + 2}: ${msg}`);
      }
    }

    this.logger.log(`[BulkImportVendorProductsHandler] Tamamlandı — created: ${results.created}, updated: ${results.updated}, failed: ${results.failed}`);

    return {
      success: true,
      message: `${results.created} oluşturuldu, ${results.updated} güncellendi${results.failed > 0 ? `, ${results.failed} hatalı` : ''}`,
      data: results,
    };
  }

  private async processRow(
    row: ParsedRow,
    vendorId: string,
    rowNum: number,
    results: ImportResults,
  ): Promise<void> {
    const name = (row['name'] || row['ürün adı'] || row['product_name'] || row['title'])?.trim();
    if (!name) {
      results.failed++;
      results.errors.push(`Satır ${rowNum}: Ürün adı zorunlu`);
      return;
    }

    this.logger.debug(`[processRow] Satır ${rowNum} — ürün: ${name}`);

    const price = this.parsePrice(row['price'] || row['fiyat']);
    const stock = this.parseStock(row['stock'] || row['stok']);
    const barcode = row['barcode'] || row['barkod'] || undefined;
    const sku = row['sku'] || undefined;
    const categoryId = row['categoryid'] || row['category_id'] || undefined;
    const brand = row['brand'] || row['marka'] || 'Genel';
    const description = row['description'] || row['açıklama'] || '';
    const rowType = row['type'] || row['vendortype'] || row['vendor_type'] || null;

    const validVendorTypes = ['COMMERCE', 'RESTAURANT', 'MARKET', 'SERVICE'];
    if (rowType && !validVendorTypes.includes(rowType)) {
      results.failed++;
      results.errors.push(`Satır ${rowNum}: Geçersiz 'type' değeri '${rowType}' — geçerli: ${validVendorTypes.join(', ')}`);
      return;
    }

    const lookupKey = barcode || sku;
    if (lookupKey) {
      const existing = await this.listingRepo.findByBarcodeOrSku(vendorId, barcode, sku);
      if (existing) {
        await this.listingRepo.update(existing.id, {
          ...(description && { description }),
          ...(price >= 0 && { price }),
          ...(stock >= 0 && { stock }),
        });
        results.updated++;
        return;
      }
    }

    const slug = FileParserService.toSlug(name);

    // Slug oluşturuldu, catalogProduct ara
    this.logger.debug(`[processRow] Slug oluşturuldu: ${slug}`);

    let catalogProduct = await this.catalogProductRepo.findBySlug(Slug.fromRaw(slug));
    if (!catalogProduct) {
      this.logger.debug(`[processRow] CatalogProduct yok, oluşturuluyor: ${slug}`);
      catalogProduct = await this.catalogProductRepo.create({
        name,
        slug,
        description: description || name,
        brand,
        status: 'PENDING',
      });
    }

    await this.listingRepo.create({
      vendorId,
      catalogProductId: catalogProduct.id,
      title: name,
      description: description || '',
      price,
      stock,
      status: 'ACTIVE',
      barcode,
      sku,
      slug,
      categoryId,
    });
    results.created++;
  }

  private parsePrice(val: string | undefined): number {
    if (!val) return 0;
    const n = parseFloat(val.replace(',', '.'));
    return isNaN(n) || n < 0 ? 0 : n;
  }

  private parseStock(val: string | undefined): number {
    if (!val) return 0;
    const n = parseInt(val, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }
}
