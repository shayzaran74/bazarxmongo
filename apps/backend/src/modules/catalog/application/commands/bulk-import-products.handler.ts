// apps/backend/src/modules/catalog/application/commands/bulk-import-products.handler.ts

import { Logger, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MediaService } from '../../../media/application/services/media.service';
import { randomBytes } from 'crypto';
import {
  BulkImportProductsCommand,
  BulkImportProductRow,
} from './bulk-import-products.command';
import { SystemVendorService } from '../../infrastructure/services/system-vendor.service';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';

// ─── Sabitler ────────────────────────────────────────────────────────────────
const MAX_ROWS = 1_500;
const BATCH_SIZE = 100;

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

function buildSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's').replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = randomBytes(4).toString('hex');
  return `${base}-${suffix}`;
}

function parseBool(val: unknown): boolean {
  return val === true || val === 'true' || val === 1;
}

function parsePrice(val: unknown): number {
  const n = parseFloat(String(val ?? 0));
  return isNaN(n) || n < 0 ? 0 : n;
}

function parseStock(val: unknown): number {
  const n = parseInt(String(val ?? 0), 10);
  return isNaN(n) || n < 0 ? 0 : n;
}

const VALID_STATUSES = new Set<string>(['ACTIVE', 'INACTIVE', 'PENDING', 'OUT_OF_STOCK']);

function validateRow(row: BulkImportProductRow, index: number): string | null {
  const name = row.name || row.title;
  if (!name || name.trim() === '') {
    return `Satır ${index + 1}: ürün adı boş olamaz`;
  }
  if (row.price !== undefined && parsePrice(row.price) < 0) {
    return `Satır ${index + 1}: fiyat negatif olamaz`;
  }
  if (row.stock !== undefined && parseStock(row.stock) < 0) {
    return `Satır ${index + 1}: stok negatif olamaz`;
  }
  if (row.status && !VALID_STATUSES.has(row.status)) {
    return `Satır ${index + 1}: geçersiz durum değeri "${row.status}"`;
  }
  if (row.productImages?.length) {
    for (const url of row.productImages) {
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        return `Satır ${index + 1}: geçersiz resim URL'si "${url}"`;
      }
    }
  }
  return null;
}

// ─── BulkImportProductsHandler ────────────────────────────────────────────────

@CommandHandler(BulkImportProductsCommand)
export class BulkImportProductsHandler implements ICommandHandler<BulkImportProductsCommand> {
  private readonly logger = new Logger(BulkImportProductsHandler.name);

  constructor(
    private readonly systemVendorService: SystemVendorService,
    private readonly mediaService: MediaService,
  ) {}

  async execute(command: BulkImportProductsCommand) {
    const { rows, adminId } = command;

    if (!rows || rows.length === 0) {
      throw new BadRequestException('En az 1 satır gereklidir');
    }
    if (rows.length > MAX_ROWS) {
      throw new BadRequestException(
        `Excel dosyası en fazla ${MAX_ROWS} satır içerebilir (gönderilen: ${rows.length})`,
      );
    }

    const validationErrors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const err = validateRow(rows[i], i);
      if (err) validationErrors.push(err);
    }
    if (validationErrors.length > 0) {
      throw new BadRequestException({ message: 'Doğrulama hataları', errors: validationErrors });
    }

    const adminVendor = await Vendor.findOne({ userId: adminId }).select('id').exec();
    const vendorId = adminVendor?.id ?? this.systemVendorService.getSystemVendorId();

    const results = { created: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await this.processBatch(batch, vendorId, i, results);
    }

    this.logger.log(`Bulk import tamamlandı: ${results.created} oluşturuldu, ${results.failed} hatalı`);

    return {
      success: true,
      message: `${results.created} ürün başarıyla oluşturuldu${results.failed > 0 ? `, ${results.failed} satır atlandı` : ''}`,
      data: {
        created: results.created,
        failed: results.failed,
        errors: results.errors.slice(0, 20),
      },
    };
  }

  private async processBatch(
    batch: BulkImportProductRow[],
    vendorId: string,
    offset: number,
    results: { created: number; failed: number; errors: string[] },
  ): Promise<void> {
    const prepared = batch.map((row, idx) => ({
      row,
      name: (row.name || row.title)!.trim(),
      slug: buildSlug((row.name || row.title)!.trim()),
      rowIndex: offset + idx + 1,
    }));

    const imageMap = new Map<string, { url: string; mimetype: string; buffer: Buffer; sortOrder: number }[]>();

    for (const { row, slug } of prepared) {
      if (!row.productImages?.length) continue;
      const downloaded: { url: string; mimetype: string; buffer: Buffer; sortOrder: number }[] = [];

      for (let idx = 0; idx < row.productImages.length; idx++) {
        const imageUrl = row.productImages[idx];
        if (!imageUrl?.startsWith('http')) continue;

        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          downloaded.push({
            url: imageUrl,
            mimetype: response.headers.get('content-type') || 'image/jpeg',
            buffer: Buffer.from(arrayBuffer),
            sortOrder: idx,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
          this.logger.warn(`Resim indirilemedi: ${imageUrl} — ${msg}`);
        }
      }

      if (downloaded.length > 0) imageMap.set(slug, downloaded);
    }

    try {
      for (const { row, name, slug } of prepared) {
        try {
          const id = 'cp-' + crypto.randomUUID();
          const product = new CatalogProduct({
            id,
            name,
            slug,
            brand: row.brandName || 'Genel',
            description: row.description || name,
            gtin: row.gtin || row.barcode || null,
            categoryId: row.categoryId && row.categoryId !== '' ? row.categoryId : null,
            status: VALID_STATUSES.has(row.status ?? '') ? row.status : 'ACTIVE',
            isFeatured: parseBool(row.isFeatured),
            isSpecialOffer: parseBool(row.isSpecialOffer),
            isFlashSale: parseBool(row.isFlashSale),
          });
          await product.save();

          const images = imageMap.get(slug);
          if (images?.length) {
            for (const img of images) {
              try {
                const mockFile = {
                  buffer: img.buffer,
                  mimetype: img.mimetype,
                  originalname: `import-${product.id}-${img.sortOrder}.${img.mimetype.split('/')[1] || 'jpg'}`,
                  size: img.buffer.length,
                };
                const uploadResult = await this.mediaService.processAndUpload(mockFile, {
                  subPath: 'catalog/products',
                });
                if (uploadResult.success && uploadResult.data) {
                  const mediaId = 'media-' + crypto.randomUUID();
                  await ProductMedia.create({
                    id: mediaId,
                    productId: product.id,
                    url: uploadResult.data.url,
                    blurhash: uploadResult.data.blurhash || undefined,
                    type: 'IMAGE',
                    sortOrder: img.sortOrder,
                  });
                }
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
                this.logger.warn(`Resim yükleme başarısız: ${img.url} — ${msg}`);
              }
            }
          }

          if (row.price !== undefined || row.stock !== undefined) {
            const listingId = 'listing-' + crypto.randomUUID();
            await Listing.create({
              id: listingId,
              catalogProductId: product.id,
              vendorId,
              title: name,
              description: row.description,
              price: parsePrice(row.price),
              stock: parseStock(row.stock),
              status: 'ACTIVE',
              sku: row.sku,
            });
          }

          results.created++;
        } catch (err: unknown) {
          results.failed++;
          const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
          this.logger.warn(`Ürün oluşturulamadı: ${name} — ${msg}`);
          results.errors.push(`Satır ${offset + prepared.indexOf({ row, name, slug, rowIndex: offset + prepared.indexOf({ row, name, slug, rowIndex: 0 }) + 1 }) + 1}: ${msg}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error(`Batch ${Math.floor(offset / BATCH_SIZE) + 1} başarısız: ${msg}`);
      results.failed += batch.length;
      results.errors.push(`Satır ${offset + 1}–${offset + batch.length}: ${msg}`);
    }
  }
}