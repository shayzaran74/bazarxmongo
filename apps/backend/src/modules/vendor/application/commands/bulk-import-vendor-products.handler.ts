// apps/backend/src/modules/vendor/application/commands/bulk-import-vendor-products.handler.ts
// Whitelist tabanlı güvenli import handler.
// Ham Excel/CSV satırları ColumnResolverService üzerinden geçer;
// VENDOR_COLUMN_MAP dışındaki hiçbir alan sisteme ulaşamaz.

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { BulkImportVendorProductsCommand } from './bulk-import-vendor-products.command';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';
import { MongoCatalogProductRepository } from '../../../catalog/infrastructure/persistence/mongo-catalog-product.repository';
import { Slug } from '../../../catalog/domain/value-objects/slug.vo';
import { ImportCategoryResolverService } from '../../../catalog/application/services/import-category-resolver.service';
import { ColumnResolverService, ParsedVendorRow } from '../services/column-resolver.service';
import { FileParserService } from '../services/file-parser.service';

interface ImportResults {
  created: number;
  updated: number;
  failed:  number;
  errors:  string[];
}

@CommandHandler(BulkImportVendorProductsCommand)
export class BulkImportVendorProductsHandler
  implements ICommandHandler<BulkImportVendorProductsCommand>
{
  private readonly logger = new Logger(BulkImportVendorProductsHandler.name);

  constructor(
    private readonly listingRepo:        MongoListingRepository,
    private readonly catalogProductRepo: MongoCatalogProductRepository,
    private readonly categoryResolver:   ImportCategoryResolverService,
    private readonly columnResolver:     ColumnResolverService,
  ) {}

  async execute(command: BulkImportVendorProductsCommand) {
    const { vendorId, rows } = command;
    this.logger.log(
      `[BulkImportVendorProductsHandler] Başladı — vendorId: ${vendorId}, ham satır: ${rows.length}`,
    );

    const results: ImportResults = { created: 0, updated: 0, failed: 0, errors: [] };

    if (!rows.length) {
      return { success: true, message: '0 satır gönderildi', data: results };
    }

    // ── Adım 1: Header mapping — bir kez çağrılır ──────────────────────────────
    // İlk satırın anahtar isimleri ham başlıklar olarak kullanılır.
    const rawHeaders = Object.keys(rows[0]);
    const headerMap = this.columnResolver.resolveHeaders(rawHeaders);

    // ── Adım 2: Her satır için extract + validate + persist ────────────────────
    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // Excel'de 1. satır header, 2. satır ilk veri
      try {
        // Whitelist filtresi — ham row bu noktada ParsedVendorRow'a dönüşür
        const parsed = this.columnResolver.extractRow(rows[i], headerMap);

        // İş kuralı doğrulaması
        const { valid, reason } = this.columnResolver.validateRow(parsed);
        if (!valid) {
          results.failed++;
          results.errors.push(`Satır ${rowNum}: ${reason}`);
          continue;
        }

        await this.processRow(parsed, vendorId, rowNum, results);
      } catch (err: unknown) {
        results.failed++;
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        results.errors.push(`Satır ${rowNum}: ${msg}`);
      }
    }

    this.logger.log(
      `[BulkImportVendorProductsHandler] Tamamlandı — created: ${results.created}, updated: ${results.updated}, failed: ${results.failed}`,
    );

    return {
      success: true,
      message: `${results.created} oluşturuldu, ${results.updated} güncellendi${results.failed > 0 ? `, ${results.failed} hatalı` : ''}`,
      data: results,
    };
  }

  // ── İş mantığı: upsert listing + catalogProduct ──────────────────────────────
  private async processRow(
    row:     ParsedVendorRow,
    vendorId: string,
    rowNum:  number,
    results: ImportResults,
  ): Promise<void> {
    this.logger.debug(`[processRow] Satır ${rowNum} — ürün: ${row.name}`);

    // Mevcut listing'i barkod veya SKU ile ara (güncelleme yolu)
    if (row.barcode || row.sku) {
      const existing = await this.listingRepo.findByBarcodeOrSku(
        vendorId,
        row.barcode,
        row.sku,
      );
      if (existing) {
        await this.listingRepo.update(existing.id, {
          ...(row.description && { description: row.description }),
          ...(row.price >= 0  && { price: row.price }),
          ...(row.stock >= 0  && { stock: row.stock }),
        });
        results.updated++;
        return;
      }
    }

    // Slug oluştur — collision'a karşı randomBytes suffix içerir
    const slug = FileParserService.toSlug(row.name);
    this.logger.debug(`[processRow] Slug: ${slug}`);

    // CatalogProduct bul veya oluştur
    let catalogProduct = await this.catalogProductRepo.findBySlug(Slug.fromRaw(slug));
    if (!catalogProduct) {
      this.logger.debug(`[processRow] CatalogProduct bulunamadı, oluşturuluyor: ${slug}`);
      catalogProduct = await this.catalogProductRepo.create({
        name:        row.name,
        slug,
        description: row.description || row.name,
        brand:       row.brand,
        status:      'PENDING',
      });
    }

    // Kategori güvenlik duvarı: bulunamazsa varsayılan kategoriye düşer
    const categoryId = await this.categoryResolver.resolveCategoryId(row.categoryId);

    // Yeni listing oluştur
    await this.listingRepo.create({
      vendorId,
      catalogProductId: catalogProduct.id,
      title:       row.name,
      description: row.description || '',
      price:       row.price,
      stock:       row.stock,
      status:      row.status,
      barcode:     row.barcode,
      sku:         row.sku,
      slug,
      categoryId,
    });

    results.created++;
  }
}
