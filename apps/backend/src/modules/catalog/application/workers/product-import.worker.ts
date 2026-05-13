// apps/backend/src/modules/catalog/application/workers/product-import.worker.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListingStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PRODUCT_IMPORT_QUEUE } from '@barterborsa/shared-queue';
import { SystemVendorService } from '../../infrastructure/services/system-vendor.service';

// ─── Job veri tipi ────────────────────────────────────────────────────────────

export interface ProductImportJobData {
  jobId: string;
  adminId: string;
  rows: any[];
  vendorType?: string;
}

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const BATCH_SIZE = 100;

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

function buildSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's').replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${randomBytes(4).toString('hex')}`;
}

function parseBool(val: any): boolean {
  return val === true || val === 'true' || val === 1;
}

function parsePrice(val: any): number {
  const n = parseFloat(String(val ?? 0));
  return isNaN(n) ? 0 : n;
}

function parseStock(val: any): number {
  const n = parseInt(String(val ?? 0), 10);
  return isNaN(n) ? 0 : n;
}

// ─── Worker ───────────────────────────────────────────────────────────────────

@Processor('product-import', {
  concurrency: 2, // aynı anda maksimum 2 import job çalışır
})
export class ProductImportWorker extends WorkerHost {
  private readonly logger = new Logger(ProductImportWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemVendorService: SystemVendorService,
  ) {
    super();
  }

  async process(job: Job<ProductImportJobData>): Promise<void> {
    const { jobId, adminId, rows } = job.data;

    this.logger.log(`Job başladı: ${jobId} — ${rows.length} satır`);

    // ── 1. Job'ı PROCESSING'e al ──────────────────────────────────────────────
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    // ── 2. Vendor ID'yi bir kez al ────────────────────────────────────────────
    const vendorType = job.data.vendorType || 'COMMERCE';
    
    // Admin vendor'ını bul veya oluştur (vendorType'a göre)
    const adminVendor = await this.prisma.vendor.findUnique({
      where: { userId: adminId },
      select: { id: true, vendorType: true },
    });

    let vendorId: string;
    
    if (adminVendor) {
      vendorId = adminVendor.id;
      // Eğer vendor tipi farklıysa güncelle (Örn: Eskiden COMMERCE idi, şimdi RESTAURANT yüklüyor)
      if (adminVendor.vendorType !== vendorType) {
        await this.prisma.vendor.update({
          where: { id: vendorId },
          data: { vendorType: vendorType as any },
        });
      }
    } else {
      vendorId = this.systemVendorService.getSystemVendorId();
    }

    // ── 3. Batch'ler halinde işle ─────────────────────────────────────────────
    let processedRows = 0;
    let createdRows = 0;
    let failedRows = 0;
    const errors: string[] = [];

    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
      const batch = rows.slice(i, i + BATCH_SIZE);

      const result = await this.processBatch(batch, vendorId, i, vendorType);
      createdRows += result.created;
      failedRows += result.failed;
      errors.push(...result.errors);
      processedRows += batch.length;

      // ── İlerlemeyi DB'ye yaz (her batch sonrası) ──────────────────────────
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { processedRows, createdRows, failedRows },
      });

      // ── BullMQ job progress'ini güncelle ──────────────────────────────────
      await job.updateProgress(Math.round((processedRows / rows.length) * 100));

      this.logger.log(
        `Batch ${batchIndex}/${totalBatches} tamamlandı — ` +
        `${result.created} oluşturuldu, ${result.failed} hatalı`,
      );
    }

    // ── 4. Job'ı tamamla ──────────────────────────────────────────────────────
    const finalStatus = failedRows === rows.length ? 'FAILED' : 'COMPLETED';

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        processedRows,
        createdRows,
        failedRows,
        errors: errors.slice(0, 20), // ilk 20 hatayı sakla
        completedAt: new Date(),
      },
    });

    this.logger.log(
      `Job tamamlandı: ${jobId} — ${createdRows} oluşturuldu, ` +
      `${failedRows} hatalı, durum: ${finalStatus}`,
    );
  }

  // ─── Batch işleyici ────────────────────────────────────────────────────────

  private async processBatch(
    batch: any[],
    vendorId: string,
    offset: number,
    vendorType: string,
  ): Promise<{ created: number; failed: number; errors: string[] }> {
    const prepared = batch.map((row, idx) => ({
      row,
      name: (row.name || row.title || '').trim(),
      slug: buildSlug((row.name || row.title || '').trim()),
      rowIndex: offset + idx + 1,
    })).filter(p => p.name !== ''); // ismi boş satırları atla

    if (prepared.length === 0) {
      return { created: 0, failed: batch.length, errors: [`Satır ${offset + 1}–${offset + batch.length}: isim boş`] };
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // 4a. Ürünleri toplu oluştur
        await tx.catalogProduct.createMany({
          data: prepared.map(({ row, name, slug }) => ({
            name,
            slug,
            brand: row.brandName || 'Genel',
            description: row.description || name,
            gtin: row.gtin || row.barcode || null,
            categoryId: row.categoryId && row.categoryId !== '' ? row.categoryId : null,
            status: row.status || 'PENDING',
            isFeatured: parseBool(row.isFeatured),
            isSpecialOffer: parseBool(row.isSpecialOffer),
            isFlashSale: parseBool(row.isFlashSale),
          })),
          skipDuplicates: true,
        });

        // 4b. Oluşturulan ürünlerin ID'lerini al
        const createdProducts = await tx.catalogProduct.findMany({
          where: { slug: { in: prepared.map(p => p.slug) } },
          select: { id: true, slug: true },
        });
        const slugToId = new Map(createdProducts.map(p => [p.slug, p.id]));

        // 4c. Media — dış URL'leri geçici olarak PENDING flag ile kaydet
        // downloadExternalImages job'ı arka planda bunları MinIO'ya taşıyacak
        const mediaData: any[] = [];
        for (const { row, slug } of prepared) {
          const productId = slugToId.get(slug);
          if (!productId) continue;

          // ─── Akıllı Görsel Tespiti ──────────────────────────────────────────
          let images: string[] = [];
          
          // 1. Öncelikli kolonları kontrol et
          const primaryImageCols = ['image_urls', 'productImages', 'Ana Resim', 'Resim', 'Görsel', 'Medya', 'Image', 'Product Image', 'Medya (3-5 Görsel, virgüle ayırın)'];
          for (const col of primaryImageCols) {
            if (row[col]) {
              const val = String(row[col]);
              if (val.includes(',')) {
                images.push(...val.split(',').map((u: string) => u.trim()).filter(Boolean));
              } else if (Array.isArray(row[col])) {
                images.push(...row[col]);
              } else {
                images.push(val.trim());
              }
              break;
            }
          }

          // 2. Eğer hala görsel yoksa, tüm kolonlarda URL ara (Smart Detection)
          if (images.length === 0) {
            Object.values(row).forEach(val => {
              if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('//'))) {
                const isImageUrl = val.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || 
                                 val.includes('dsmcdn.com') || 
                                 val.includes('cloudinary.com') || 
                                 val.includes('img.bazarx.com');
                if (isImageUrl) {
                  images.push(val.trim());
                }
              }
            });
          }

          if (images.length > 0) {
            images.forEach((url: string, idx: number) => {
              mediaData.push({
                productId,
                url,
                type: 'IMAGE',
                sortOrder: idx,
              });
            });
          }
        }
        if (mediaData.length > 0) {
          await tx.productMedia.createMany({ data: mediaData });
        }


        // 4d. Listing
        const listingData: any[] = [];
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
            availableQuantity: parseStock(row.stock), // Bu alan Admin paneli için kritik
            status: ListingStatus.PENDING,
            sku: row.sku,
            listingType: vendorType === 'RESTAURANT' ? 'GO_FOOD' : 'SELL',
          });
        }
        if (listingData.length > 0) {
          await tx.listing.createMany({ data: listingData });
        }

        // 4e. Brand bağlantıları (many-to-many, createMany desteklemez)
        for (const { row, slug } of prepared) {
          if (!row.brandId) continue;
          const productId = slugToId.get(slug);
          if (!productId) continue;
          await tx.catalogProduct.update({
            where: { id: productId },
            data: { brands: { connect: { id: row.brandId } } },
          });
        }

        return createdProducts.length;
      });

      return { created: prepared.length, failed: 0, errors: [] };
    } catch (err: any) {
      this.logger.error(
        `Batch başarısız (satır ${offset + 1}–${offset + batch.length}): ${err.message}`,
      );
      return {
        created: 0,
        failed: batch.length,
        errors: [`Satır ${offset + 1}–${offset + batch.length}: ${err.message}`],
      };
    }
  }
}
