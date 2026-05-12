// apps/backend/src/modules/vendor/application/commands/bulk-import-vendor-products.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { BulkImportVendorProductsCommand } from './bulk-import-vendor-products.command';
import { FileParserService, ParsedRow } from '../services/file-parser.service';

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

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BulkImportVendorProductsCommand) {
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

    this.logger.log('Vendor bulk import tamamlandı', {
      vendorId,
      created: results.created,
      updated: results.updated,
      failed: results.failed,
    });

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

    const price = this.parsePrice(row['price'] || row['fiyat']);
    const stock = this.parseStock(row['stock'] || row['stok']);
    const barcode = row['barcode'] || row['barkod'] || undefined;
    const sku = row['sku'] || undefined;
    const categoryId = row['categoryid'] || row['category_id'] || null;
    const brand = row['brand'] || row['marka'] || 'Genel';
    const description = row['description'] || row['açıklama'] || '';
    const rowType = row['type'] || row['vendortype'] || row['vendor_type'] || null;

    // Geçerli vendorType değeri kontrolü
    const validVendorTypes = ['COMMERCE', 'RESTAURANT', 'MARKET', 'SERVICE'];
    if (rowType && !validVendorTypes.includes(rowType)) {
      results.failed++;
      results.errors.push(`Satır ${rowNum}: Geçersiz 'type' değeri '${rowType}' — geçerli: ${validVendorTypes.join(', ')}`);
      return;
    }

    // Barkod veya SKU ile mevcut listing'i bul → güncelle
    const lookupKey = barcode || sku;
    if (lookupKey) {
      const existing = await this.prisma.listing.findFirst({
        where: {
          vendorId,
          OR: [
            ...(barcode ? [{ barcode }] : []),
            ...(sku ? [{ sku }] : []),
          ],
        },
      });

      if (existing) {
        await this.prisma.listing.update({
          where: { id: existing.id },
          data: {
            title: name,
            ...(description && { description }),
            ...(price >= 0 && { price }),
            ...(stock >= 0 && { stock }),
          },
        });
        results.updated++;
        return;
      }
    }

    // Yeni ürün — CatalogProduct bul veya oluştur
    let catalogProduct = await this.prisma.catalogProduct.findFirst({
      where: { name },
    });

    if (!catalogProduct) {
      catalogProduct = await this.prisma.catalogProduct.create({
        data: {
          name,
          slug: FileParserService.toSlug(name),
          brand,
          description: description || name,
          categoryId: categoryId || null,
        },
      });
    }

    await this.prisma.listing.create({
      data: {
        vendorId,
        catalogProductId: catalogProduct.id,
        categoryId: categoryId || null,
        title: name,
        description: description || '',
        price,
        stock,
        barcode: barcode || null,
        sku: sku || null,
        status: 'ACTIVE',
        slug: FileParserService.toSlug(name),
      },
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
