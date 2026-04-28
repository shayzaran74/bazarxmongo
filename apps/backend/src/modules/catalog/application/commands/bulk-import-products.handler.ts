import {
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { MediaService } from '../../../media/application/services/media.service';
import { ListingStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import {
  BulkImportProductsCommand,
  BulkImportProductRow,
} from './bulk-import-products.command';
import { SystemVendorService } from '../../infrastructure/services/system-vendor.service';

// ─── Sabitler ────────────────────────────────────────────────────────────────
const MAX_ROWS = 1_500;
const BATCH_SIZE = 100;

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

function buildSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')                       // Türkçe karakterleri parçala
    .replace(/[\u0300-\u036f]/g, '')        // aksan işaretlerini at
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's').replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = randomBytes(4).toString('hex'); // 8 hex = 4 milyar kombinasyon
  return `${base}-${suffix}`;
}

function parseBool(val: any): boolean {
  if (val === true || val === 'true' || val === 1) return true;
  return false;
}

function parsePrice(val: any): number {
  const n = parseFloat(String(val ?? 0));
  return isNaN(n) ? 0 : n;
}

function parseStock(val: any): number {
  const n = parseInt(String(val ?? 0), 10);
  return isNaN(n) ? 0 : n;
}

function validateRow(
  row: BulkImportProductRow,
  index: number,
): string | null {
  const name = row.name || row.title;
  if (!name || name.trim() === '') {
    return `Satır ${index + 1}: ürün adı boş olamaz`;
  }
  return null;
}

// ─── BulkImportProductsHandler ────────────────────────────────────────────────

@CommandHandler(BulkImportProductsCommand)
export class BulkImportProductsHandler
  implements ICommandHandler<BulkImportProductsCommand>
{
  private readonly logger = new Logger(BulkImportProductsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemVendorService: SystemVendorService,
    private readonly mediaService: MediaService,
  ) {}

  async execute(command: BulkImportProductsCommand) {
    const { rows, adminId } = command;

    // ── 1. Limit kontrolü ────────────────────────────────────────────────────
    if (!rows || rows.length === 0) {
      throw new BadRequestException('En az 1 satır gereklidir');
    }
    if (rows.length > MAX_ROWS) {
      throw new BadRequestException(
        `Excel dosyası en fazla ${MAX_ROWS} satır içerebilir (gönderilen: ${rows.length})`,
      );
    }

    // ── 2. Satır doğrulama ───────────────────────────────────────────────────
    const validationErrors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const err = validateRow(rows[i], i);
      if (err) validationErrors.push(err);
    }
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Doğrulama hataları',
        errors: validationErrors,
      });
    }

    // ── 3. Vendor ID'yi bir kez al ────────────────────────────────────────────
    let vendorId: string;
    const adminVendor = await this.prisma.vendor.findUnique({
      where: { userId: adminId },
      select: { id: true },
    });
    vendorId = adminVendor?.id ?? this.systemVendorService.getSystemVendorId();

    // ── 4. Batch'ler halinde işle ─────────────────────────────────────────────
    const results = { created: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await this.processBatch(batch, vendorId, i, results);
    }

    this.logger.log(
      `Bulk import tamamlandı: ${results.created} oluşturuldu, ${results.failed} hatalı`,
    );

    return {
      success: true,
      message: `${results.created} ürün başarıyla oluşturuldu${results.failed > 0 ? `, ${results.failed} satır atlandı` : ''}`,
      data: {
        created: results.created,
        failed: results.failed,
        errors: results.errors.slice(0, 20), // İlk 20 hatayı döndür
      },
    };
  }

  private async processBatch(
    batch: BulkImportProductRow[],
    vendorId: string,
    offset: number,
    results: { created: number; failed: number; errors: string[] },
  ): Promise<void> {
    // Slug'ları önceden üret (DB'ye gitmeden)
    const prepared = batch.map((row, idx) => ({
      row,
      name: (row.name || row.title)!.trim(),
      slug: buildSlug((row.name || row.title)!.trim()),
      rowIndex: offset + idx + 1,
    }));

    try {
      await this.prisma.$transaction(async (tx) => {
        // ── 4a. Tüm ürünleri tek seferde oluştur ─────────────────────────────
        // createMany nested relation desteklemediği için önce ürünler,
        // sonra media ve listing'ler ayrı createMany ile eklenir.

        await tx.catalogProduct.createMany({
          data: prepared.map(({ row, name, slug }) => ({
            name,
            slug,
            brand: row.brandName || 'Genel',
            description: row.description || name,
            gtin: row.gtin || row.barcode || null,
            categoryId:
              row.categoryId && row.categoryId !== '' ? row.categoryId : null,
            status: row.status || 'ACTIVE',
            isFeatured: parseBool(row.isFeatured),
            isSpecialOffer: parseBool(row.isSpecialOffer),
            isFlashSale: parseBool(row.isFlashSale),
          })),
          skipDuplicates: true, // slug çakışması olursa o satırı atla
        });

        // ── 4b. Oluşturulan ürünlerin ID'lerini slug ile çek ──────────────────
        const slugs = prepared.map((p) => p.slug);
        const createdProducts = await tx.catalogProduct.findMany({
          where: { slug: { in: slugs } },
          select: { id: true, slug: true },
        });

        const slugToId = new Map<string, string>(
          createdProducts.map((p) => [p.slug, p.id]),
        );
        results.created += createdProducts.length;
        results.failed += prepared.length - createdProducts.length;

        // ── 4c. Media kayıtları (Download & Upload to MinIO) ───────────────────
        for (const { row, slug } of prepared) {
          const productId = slugToId.get(slug);
          if (!productId || !row.productImages?.length) continue;

          for (let idx = 0; idx < row.productImages.length; idx++) {
            const imageUrl = row.productImages[idx];
            if (!imageUrl || !imageUrl.startsWith('http')) continue;

            try {
              // 1. Resmi indir
              const response = await fetch(imageUrl);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const contentType = response.headers.get('content-type') || 'image/jpeg';
              const extension = contentType.split('/')[1] || 'jpg';

              // 2. Mock Multer file objesi oluştur
              const mockFile = {
                buffer,
                mimetype: contentType,
                originalname: `import-${productId}-${idx}.${extension}`,
                size: buffer.length,
              };

              // 3. MediaService ile MinIO'ya yükle
              const uploadResult = await this.mediaService.processAndUpload(mockFile, {
                subPath: 'catalog/products',
              });

              if (uploadResult.success && uploadResult.data) {
                const media = uploadResult.data;
                await tx.productMedia.create({
                  data: {
                    productId,
                    url: media.url,
                    blurhash: media.blurhash,
                    type: 'IMAGE',
                    sortOrder: idx,
                  },
                });
              } else {
                this.logger.warn(`Resim yükleme hatası (${imageUrl}): ${uploadResult.error?.message}`);
              }
            } catch (err: any) {
              this.logger.warn(`Ürün ${productId} için resim indirilemedi: ${imageUrl} — ${err.message}`);
            }
          }
        }

        // ── 4d. Listing kayıtları (fiyat veya stok olan satırlar) ─────────────
        const listingData: {
          catalogProductId: string;
          vendorId: string;
          title: string;
          description?: string;
          price: number;
          stock: number;
          status: ListingStatus;
          sku?: string;
        }[] = [];

        for (const { row, name, slug } of prepared) {
          const productId = slugToId.get(slug);
          if (!productId) continue;
          if (row.price === undefined && row.stock === undefined) continue;

          listingData.push({
            catalogProductId: productId,
            vendorId,
            title: name,
            description: row.description,
            price: parsePrice(row.price),
            stock: parseStock(row.stock),
            status: ListingStatus.ACTIVE,
            sku: row.sku,
          });
        }

        if (listingData.length > 0) {
          await tx.listing.createMany({ data: listingData });
        }

        // ── 4e. Brand bağlantıları ────────────────────────────────────────────
        // Prisma createMany many-to-many desteklemez; brand bağlantısı için
        // ayrı döngü gerekir. Bunlar az olduğundan overhead minimal.
        for (const { row, slug } of prepared) {
          if (!row.brandId) continue;
          const productId = slugToId.get(slug);
          if (!productId) continue;
          await tx.catalogProduct.update({
            where: { id: productId },
            data: { brands: { connect: { id: row.brandId } } },
          });
        }
      });
    } catch (err: any) {
      // Batch-level hata: tüm batch'i başarısız say, devam et
      this.logger.error(
        `Batch ${Math.floor(offset / BATCH_SIZE) + 1} başarısız: ${err.message}`,
      );
      results.failed += batch.length;
      results.created -= batch.length; // transaction rollback oldu
      results.errors.push(
        `Satır ${offset + 1}–${offset + batch.length}: ${err.message}`,
      );
    }
  }
}
