// apps/backend/src/modules/catalog/application/workers/product-import.worker.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Job } from 'bullmq';
import { ICatalogProduct, IListing, IProductMedia, IImportJob, IVendor } from '@barterborsa/shared-persistence';
import { PRODUCT_IMPORT_QUEUE } from '@barterborsa/shared-queue';
import { SystemVendorService } from '../../infrastructure/services/system-vendor.service';
import { ImportCategoryResolverService } from '../services/import-category-resolver.service';
import { randomBytes } from 'crypto';

export interface ProductImportJobData {
  jobId: string;
  adminId: string;
  rows: Record<string, unknown>[];
  vendorType?: string;
}

const BATCH_SIZE = 100;

function buildSlug(name: string): string {
  const base = name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[ğ]/g,'g').replace(/[ü]/g,'u').replace(/[ş]/g,'s')
    .replace(/[ı]/g,'i').replace(/[ö]/g,'o').replace(/[ç]/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  return `${base}-${randomBytes(4).toString('hex')}`;
}
const parseBool = (v: unknown): boolean => v === true || v === 'true' || v === 1;
const parsePrice = (v: unknown): number => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const parseStock = (v: unknown): number => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };

@Processor('product-import', { concurrency: 2 })
export class ProductImportWorker extends WorkerHost {
  private readonly logger = new Logger(ProductImportWorker.name);

  constructor(
    @InjectModel('ImportJob')      private readonly importJobModel:   Model<IImportJob>,
    @InjectModel('CatalogProduct') private readonly productModel:     Model<ICatalogProduct>,
    @InjectModel('Listing')        private readonly listingModel:     Model<IListing>,
    @InjectModel('ProductMedia')   private readonly mediaModel:       Model<IProductMedia>,
    @InjectModel('Vendor')         private readonly vendorModel:      Model<IVendor>,
    @InjectConnection()            private readonly connection:        Connection,
    private readonly systemVendorService: SystemVendorService,
    private readonly categoryResolver: ImportCategoryResolverService,
  ) { super(); }

  async process(job: Job<ProductImportJobData>): Promise<void> {
    const { jobId, adminId, rows } = job.data;
    this.logger.log(`Job başladı: ${jobId} — ${rows.length} satır`);

    await this.importJobModel.updateOne({ id: jobId }, { $set: { status: 'PROCESSING', startedAt: new Date() } });

    const vendorType = job.data.vendorType || 'COMMERCE';
    const adminVendor = await this.vendorModel.findOne({ userId: adminId }, { id: 1, vendorType: 1 }).lean();
    let vendorId: string;

    if (adminVendor) {
      vendorId = adminVendor.id;
      if ((adminVendor as Record<string, unknown>).vendorType !== vendorType) {
        await this.vendorModel.updateOne({ id: vendorId }, { $set: { vendorType } });
      }
    } else {
      vendorId = this.systemVendorService.getSystemVendorId();
    }

    let processedRows = 0, createdRows = 0, failedRows = 0;
    const errors: string[] = [];
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
      const batch = rows.slice(i, i + BATCH_SIZE);
      const result = await this.processBatch(batch, vendorId, i, vendorType);
      createdRows += result.created;
      failedRows  += result.failed;
      errors.push(...result.errors);
      processedRows += batch.length;

      await this.importJobModel.updateOne({ id: jobId }, { $set: { processedRows, createdRows, failedRows } });
      await job.updateProgress(Math.round((processedRows / rows.length) * 100));
      this.logger.log(`Batch ${batchIndex}/${totalBatches} — ${result.created} ok, ${result.failed} hata`);
    }

    const finalStatus = failedRows === rows.length ? 'FAILED' : 'COMPLETED';
    await this.importJobModel.updateOne(
      { id: jobId },
      { $set: { status: finalStatus, processedRows, createdRows, failedRows, errors: errors.slice(0, 20), completedAt: new Date() } },
    );
    this.logger.log(`Job tamamlandı: ${jobId} — ${createdRows} ok, ${failedRows} hata, ${finalStatus}`);
  }

  private async processBatch(
    batch: Record<string, unknown>[],
    vendorId: string,
    offset: number,
    vendorType: string,
  ): Promise<{ created: number; failed: number; errors: string[] }> {
    const prepared = batch.map((row, idx) => ({
      row, rowIndex: offset + idx + 1,
      name: String(row.name || row.title || '').trim(),
      slug: buildSlug(String(row.name || row.title || '').trim()),
    })).filter(p => p.name !== '');

    if (!prepared.length) {
      return { created: 0, failed: batch.length, errors: [`Satır ${offset + 1}–${offset + batch.length}: isim boş`] };
    }

    try {
      // Kategori güvenlik duvarı: tüm satırların categoryId'sini önceden toplu çözümle (transaction dışında)
      const resolvedCategoryIds = new Map<string, string>();
      for (const { row, slug } of prepared) {
        const rawCatId = row.categoryId ? String(row.categoryId) : undefined;
        resolvedCategoryIds.set(slug, await this.categoryResolver.resolveCategoryId(rawCatId));
      }

      const session = await this.connection.startSession();
      try {
        await session.withTransaction(async () => {
          const productDocs = prepared.map(({ row, name, slug }) => {
            const pid = new Types.ObjectId().toString();
            return { _id: pid, id: pid, name, slug, brand: String(row.brandName || 'Genel'), description: String(row.description || name), categoryId: resolvedCategoryIds.get(slug) ?? null, status: row.status || 'PENDING', isFeatured: parseBool(row.isFeatured), isSpecialOffer: parseBool(row.isSpecialOffer), isFlashSale: parseBool(row.isFlashSale) };
          });
          await this.productModel.insertMany(productDocs, { session });

          const slugToId = new Map(productDocs.map(p => [p.slug, p.id]));

          const mediaDocs: Record<string, unknown>[] = [];
          for (const { row, slug } of prepared) {
            const productId = slugToId.get(slug);
            if (!productId) continue;
            const images: string[] = [];
            for (const col of ['image_urls','productImages','Ana Resim','Resim','Image']) {
              if (row[col]) {
                const val = String(row[col]);
                if (val.includes(',')) images.push(...val.split(',').map(u => u.trim()).filter(Boolean));
                else images.push(val.trim());
                break;
              }
            }
            images.forEach((url, idx) => {
              const mid = new Types.ObjectId().toString();
              mediaDocs.push({ _id: mid, id: mid, productId, url, type: 'IMAGE', sortOrder: idx });
            });
          }
          if (mediaDocs.length) await this.mediaModel.insertMany(mediaDocs, { session });

          const listingDocs: Record<string, unknown>[] = [];
          for (const { row, name, slug } of prepared) {
            const productId = slugToId.get(slug);
            if (!productId || (row.price === undefined && row.stock === undefined)) continue;
            const lid = new Types.ObjectId().toString();
            listingDocs.push({ _id: lid, id: lid, catalogProductId: productId, vendorId, title: name, description: row.description, price: Types.Decimal128.fromString(String(parsePrice(row.price))), stock: parseStock(row.stock), availableQuantity: parseStock(row.stock), status: 'PENDING', sku: row.sku, listingType: vendorType === 'RESTAURANT' ? 'GO_FOOD' : 'SELL' });
          }
          if (listingDocs.length) await this.listingModel.insertMany(listingDocs, { session });
        });
      } finally {
        await session.endSession();
      }
      return { created: prepared.length, failed: 0, errors: [] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error(`Batch başarısız (${offset + 1}–${offset + batch.length}): ${msg}`);
      return { created: 0, failed: batch.length, errors: [`Satır ${offset + 1}–${offset + batch.length}: ${msg}`] };
    }
  }
}
