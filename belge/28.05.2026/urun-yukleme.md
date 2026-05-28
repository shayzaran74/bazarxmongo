# Ürün Yükleme Sistemi — Mimari ve Dosya Bazlı Denetim Raporu

> **Hazırlayan:** Claude Code Auditor
> **Tarih:** 2026-05-26
> **Proje:** BazarX (BarterBorsa)
> **Modül:** Ürün İçe Aktarma / Bulk Import (Excel & JSON)

---

## 1. Mimari Özet

### 1.1 İki Temel Yol: Admin vs Vendor

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ÜRÜN İÇE AKTARMA MİMARİSİ                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │     ADMIN YOLU              │    │     VENDOR YOLU             │        │
│  │  (CatalogModule)            │    │  (VendorModule)            │        │
│  │                             │    │                             │        │
│  │  İki alt yöntem:            │    │  Tek yöntem:               │        │
│  │                             │    │                             │        │
│  │  1. SYNC (direct)           │    │  FileInterceptor →         │        │
│  │     BulkImportProductsHandler│    │  FileParserService →       │        │
│  │     → CatalogProduct + Listing│   │  BulkImportVendorProducts   │        │
│  │     → Max 1.500 satır        │    │  Handler                    │        │
│  │                             │    │  → CatalogProduct + Listing │        │
│  │  2. ASYNC (queue)            │    │  → Upsert (barcode/sku)    │        │
│  │     QueueImportProductsHandler│   │  → Max batch 100            │        │
│  │     → BullMQ product-import  │    │                             │        │
│  │     → ProductImportWorker    │    │  Tier-based excelBatchLimit │        │
│  │     → Max 50.000 satır        │    │                             │        │
│  └─────────────────────────────┘    └─────────────────────────────┘        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     ORTAK ALTYAPI (Her İki Yolda)                     │   │
│  │                                                                       │   │
│  │  FileParserService          MediaService                             │   │
│  │  ├── parseCSV()             ├── processAndUpload()                  │   │
│  │  ├── parseJSON()            ├── (image download & storage)          │   │
│  │  ├── parseExcel()                                                   │   │
│  │  └── toSlug() (static)                                              │   │
│  │                                                                       │   │
│  │  ImportJob (MongoDB)                                                │   │
│  │  ├── status: PENDING → PROCESSING → COMPLETED / FAILED             │   │
│  │  └── progress: processedRows, createdRows, failedRows, errors        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Desteklenen Dosya Formatları ve Kolonlar

### 2.1 FileParserService — Desteklenen Formatlar

**Dosya:** `apps/backend/src/modules/vendor/application/services/file-parser.service.ts`

| Format | Metod | Kütüphane | Açıklama |
|--------|-------|-----------|----------|
| **CSV** | `parseCSV()` | Custom RFC 4180 | UTF-8 BOM temizleme, quoted comma handling, satır bazlı parse |
| **JSON** | `parseJSON()` | Native `JSON.parse()` | Dizi veya tek obje kabul eder, key'leri lowercase normalleştirir |
| **Excel** | `parseExcel()` | `xlsx` (require) | Sheet_to_json, defval: '' — boş hücreler için varsayılan |

**Kolon Normalizasyonu:** Tüm kolon isimleri `toLowerCase().trim()` ile normalize edilir.
**Slug Üretimi:** `FileParserService.toSlug()` — Türkçe karakter replacement + `randomBytes(4)` suffix.

### 2.2 Admin Bulk Import Kolonları

**Dosya:** `apps/backend/src/modules/catalog/application/commands/bulk-import-products.command.ts`

| Kolon | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| `name` / `title` | string | ✅ | Ürün adı |
| `description` | string | Hayır | Açıklama |
| `price` | number | Hayır | Fiyat |
| `stock` | number | Hayır | Stok |
| `sku` | string | Hayır | Stok kodu |
| `gtin` / `barcode` | string | Hayır | Barkod |
| `categoryId` | string | Hayır | Kategori ID |
| `brandId` | string | Hayır | Marka ID |
| `brandName` | string | Hayır | Marka adı |
| `status` | enum | Hayır | ACTIVE / INACTIVE / PENDING / OUT_OF_STOCK |
| `isFeatured` | boolean | Hayır | Öne çıkan |
| `isSpecialOffer` | boolean | Hayır | Özel teklif |
| `isFlashSale` | boolean | Hayır | Flash sale |
| `productImages` | string[] | Hayır | URL dizisi |

### 2.3 Vendor Bulk Import Kolonları (Türkçe Destekli)

**Dosya:** `apps/backend/src/modules/vendor/application/commands/bulk-import-vendor-products.handler.ts`

| Kolon (TR) | Kolon (EN) | Açıklama |
|------------|------------|----------|
| `ürün adı` | `name`, `product_name`, `title` | Ürün adı (ilk bulunan kullanılır) |
| `fiyat` | `price` | Fiyat (virgül desimal olarak) |
| `stok` | `stock` | Stok miktarı |
| `barkod` | `barcode` | Barkod (upsert key) |
| `sku` | `sku` | SKU (upsert key) |
| `marka` | `brand` | Marka |
| `açıklama` | `description` | Açıklama |
| `categoryid` / `category_id` | `categoryid` | Kategori ID |
| `type` / `vendortype` | `vendor_type` | Tip: COMMERCE / RESTAURANT / MARKET / SERVICE |

---

## 3. Mimari Akış Diyagramları

### 3.1 Admin — Sync Yolu (Direct)

```
Admin POST /admin/products/bulk-import
              │
              ▼
┌──────────────────────────────────────────┐
│ BulkImportProductsCommand                │
│ { rows: BulkImportProductRow[], adminId }│
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ BulkImportProductsHandler                │
│ 1. Max 1.500 satır kontrolü              │
│ 2. validateRow() — her satır            │
│ 3. findOne Vendor (adminId → vendorId)  │
│ 4. processBatch() — batch 100           │
│    ├── fetch image URLs                 │
│    ├── CatalogProduct.create()          │
│    ├── MediaService.processAndUpload()  │
│    └── Listing.create()                 │
└──────────────────────────────────────────┘
```

### 3.2 Admin — Async Yolu (Queue)

```
Admin POST /admin/products/bulk-import (queue=true)
              │
              ▼
┌──────────────────────────────────────────┐
│ QueueImportProductsCommand              │
│ { rows, adminId, vendorType? }          │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ QueueImportProductsHandler               │
│ 1. Max 50.000 satır kontrolü             │
│ 2. ImportJob.create({ status: PENDING }) │
│ 3. BullMQ.add('product-import', jobData)│
└──────────────────────────────────────────┘
                   │
                   ▼
         ┌────────────────┐
         │ BullMQ Queue   │
         │ product-import │
         └────────┬───────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ ProductImportWorker (@Processor)         │
│ concurrency: 2                           │
│ 1. ImportJob status → PROCESSING          │
│ 2. MongoDB transaction per batch (100)   │
│    ├── CatalogProduct.insertMany()       │
│    ├── ProductMedia.insertMany()          │
│    └── Listing.insertMany()              │
│ 3. ImportJob status → COMPLETED/FAILED   │
│ 4. Progress update (updateProgress)      │
└──────────────────────────────────────────┘
```

### 3.3 Vendor Yolu

```
Vendor POST /vendors/products/bulk/import (file upload)
              │
              ▼
┌──────────────────────────────────────────┐
│ vendor-product.controller.ts             │
│ FileInterceptor → parseExcel/CSV/JSON    │
│ tier-based excelBatchLimit kontrolü     │
│ BulkImportVendorProductsCommand         │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ BulkImportVendorProductsHandler          │
│ 1. Her satır için processRow()          │
│ 2. Upsert by barcode OR sku             │
│    ├── listingRepo.findByBarcodeOrSku()  │
│    ├── listingRepo.update() → update    │
│    └── catalogProductRepo.create() +     │
│        listingRepo.create() → create     │
│ 3. Turkish column name mapping          │
└──────────────────────────────────────────┘
```

---

## 4. Tam Dosya Listesi ve Görev Dağılımı

### 4.1 Ortak Altyapı

| Dosya Yolu | Tip | Açıklama |
|------------|-----|----------|
| `vendor/application/services/file-parser.service.ts` | Service | CSV/JSON/Excel parser — `xlsx` kütüphanesi, RFC 4180 CSV, `toSlug()` |
| `shared-persistence/schemas/backend/importJob.schema.ts` | Schema | ImportJob MongoDB model — status, progress, errors, timing |

### 4.2 Admin Yolu (CatalogModule)

| Dosya Yolu | Tip | Açıklama |
|------------|-----|----------|
| `catalog/presentation/product-admin.controller.ts` | Controller | `POST /admin/products/bulk-import`, `POST /admin/products/import-trendyol`, job status endpoints |
| `catalog/application/commands/bulk-import-products.command.ts` | Command DTO | `BulkImportProductsCommand` — `BulkImportProductRow` interface |
| `catalog/application/commands/bulk-import-products.handler.ts` | Handler | Sync import — batch 100, image download, `CatalogProduct` + `Listing` + `ProductMedia` |
| `catalog/application/commands/queue-import-products.command.ts` | Command DTO | `QueueImportProductsCommand` — async queueing DTO |
| `catalog/application/commands/queue-import-products.handler.ts` | Handler | ImportJob oluşturur + BullMQ queue ekler, max 50.000 satır |
| `catalog/application/workers/product-import.worker.ts` | Worker | `@Processor('product-import')` — concurrency 2, MongoDB transaction, batch 100 |
| `catalog/application/commands/bulk-update-admin-products.command.ts` | Command DTO | Bulk update DTO |
| `catalog/application/commands/bulk-update-admin-products.handler.ts` | Handler | Bulk update — status, isFeatured, isFlashSale, isSpecialOffer |
| `catalog/application/commands/bulk-delete-admin-products.command.ts` | Command DTO | Bulk delete DTO |
| `catalog/application/commands/bulk-delete-admin-products.handler.ts` | Handler | Bulk delete — CatalogProduct + Listing siler |
| `catalog/application/queries/get-import-job-status.query.ts` | Query DTO | ImportJob status sorgusu |
| `catalog/application/queries/get-import-job-status.handler.ts` | Handler | ImportJob çeker, progress hesaplar |
| `catalog/application/queries/list-import-jobs.query.ts` | Query DTO | Paginated job list |
| `catalog/application/queries/list-import-jobs.handler.ts` | Handler | ImportJob find sorted by createdAt desc |
| `catalog/infrastructure/services/system-vendor.service.ts` | Service | Sistem vendor ID'si — admin yoksa kullanılır |

### 4.3 Vendor Yolu (VendorModule)

| Dosya Yolu | Tip | Açıklama |
|------------|-----|----------|
| `vendor/presentation/vendor-product.controller.ts` | Controller | `POST /vendors/products/bulk/import` — FileInterceptor + tier limit |
| `vendor/application/commands/bulk-import-vendor-products.command.ts` | Command DTO | `BulkImportVendorProductsCommand` — `vendorId`, `rows: ParsedRow[]` |
| `vendor/application/commands/bulk-import-vendor-products.handler.ts` | Handler | Upsert by barcode/sku, Turkish column mapping, `CatalogProduct` + `Listing` |
| `catalog/infrastructure/persistence/mongo-listing.repository.ts` | Repository | `findByBarcodeOrSku()` — upsert lookup |
| `catalog/infrastructure/persistence/mongo-catalog-product.repository.ts` | Repository | `findBySlug()`, `create()` |

### 4.4 Inventory Modülü Ek Import

| Dosya Yolu | Tip | Açıklama |
|------------|-----|----------|
| `inventory/presentation/inventory-admin.controller.ts` | Controller | `POST /admin/inventory/transfers/import-excel` — doğrudan XLSX |
| `inventory/presentation/vendor-inventory.controller.ts` | Controller | `POST /vendors/inventory/import-excel` (XLSX), `POST /vendors/inventory/import-trendyol` (JSON), `GET /vendors/inventory/template/download` |

---

## 5. Veri Modeli ve İlişkiler

### 5.1 Entity İlişkileri

```
CatalogProduct (1) ────── (N) Listing
      │
      └──────────────── (N) ProductMedia

Listing (N) ────────────── (1) Vendor (via vendorId)
```

### 5.2 ImportJob Entity

**Tam Yol:** `packages/shared/shared-persistence/src/schemas/backend/importJob.schema.ts`

```typescript
interface IImportJob {
  id: string                    // 'import-' + UUID
  adminId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  totalRows: number
  processedRows: number        // anlık ilerleme
  createdRows: number
  failedRows: number
  errors?: Schema.Types.Mixed   // string[] — ilk 20 hata
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

**Index'ler:** `{ adminId: 1 }`, `{ status: 1 }`

---

## 6. Kritik Kontroller ve Denetim Noktaları

### 6.1 Boyut Limitleri

| Yol | Max Satır | Batch Size | Aşım Davranışı |
|-----|-----------|------------|----------------|
| Admin Sync | 1.500 | 100 | BadRequestException |
| Admin Async | 50.000 | 100 | BadRequestException |
| Vendor (tier-based) | config'den | 100 | BadRequestException |

### 6.2 Validasyon Kuralları

| Kontrol | Nerede | Sonuç |
|---------|--------|-------|
| Ürün adı boş mu? | Her iki yolda da | Satır atlanır / hata |
| Fiyat negatif mi? | `BulkImportProductsHandler` | BadRequestException |
| Stok negatif mi? | `BulkImportProductsHandler` | BadRequestException |
| Geçersiz status değeri? | `validateRow()` | BadRequestException |
| Geçersiz resim URL'i? | `validateRow()` | BadRequestException |
| Vendor type geçerli mi? | `BulkImportVendorProductsHandler` | Satır atlanır / hata |

### 6.3 Güvenlik Kontrolleri

| Kontrol | Nerede | Durum |
|---------|--------|-------|
| Admin endpoint auth | `product-admin.controller.ts` | JwtAuthGuard + AdminOnly |
| Vendor tier batch limit | `vendor-product.controller.ts` | ✅ Implementasyon mevcut |
| Dosya tipi kontrolü | FileInterceptor | ✅ Uzantı kontrolü |
| Max satır limiti | Her iki yolda da | ✅ Implementasyon mevcut |

### 6.4 Hata Yönetimi

| Durum | Davranış |
|-------|----------|
| Resim indirme başarısız | `logger.warn()` — ürün oluşturulmaya devam eder |
| Batch tamamı hatalı | Tüm batch `failedRows`'a eklenir, sonraki batch'ler devam eder |
| Upsert'te update edilemedi | `catch` → `results.failed++` |
| Transaction başarısız | Batch atlanır, `errors` array'ine eklenir |

---

## 7. Teknik Mükerrerlik (Tech Debt)

### 7.1 Mükerrer Kod Parçaları

| Sorun | Açıklama |
|-------|----------|
| **Slug üretimi 3 kere yazılmış** | `bulk-import-products.handler.ts: buildSlug()`, `product-import.worker.ts: buildSlug()`, `file-parser.service.ts: toSlug()` — aynı mantık 3 yerde tekrar ediliyor |
| **Price/Stock parsing 3 kere yazılmış** | Her handler'da `parsePrice()`, `parseStock()`, `parseBool()` local fonksiyonlar tekrar ediliyor |
| **Image URL kolon isimleri 2 yerde** | `bulk-import-products.handler.ts` → `row.productImages`, `product-import.worker.ts` → `['image_urls','productImages','Ana Resim','Resim','Image']` — tutarsız |

### 7.2 Bilinen Eksiklikler

| Sorun | Öncelik | Açıklama |
|-------|---------|----------|
| `IImportJob` için strict typing yok | Orta | Schema'da `// TODO: strict typing — codegen` yazıyor |
| Trendyol import ayrı path | Düşük | `inventory-admin.controller.ts` ve `product-admin.controller.ts` ayrı Trendyol parse logic'e sahip |
| Rollback mekanizması yok | Yüksek | Batch hatalı olsa bile önceki batch'ler commit edilir — kısmi import riski |
| Retry mekanizması yok | Orta | BullMQ job başarısız olursa retry yok (concurrency 2 ama maxRetries 0) |

---

## 8. Durum Geçişleri (ImportJob)

```
┌──────────┐     queue.add()      ┌───────────┐
│ (start)  │ ──────────────────→ │  PENDING   │
└──────────┘                     └──────┬─────┘
                                       │
                          worker.process() starts
                                       ▼
                              ┌───────────────┐
                              │  PROCESSING   │
                              └───────┬───────┘
                                      │
                     all batches done │ job.updateProgress(100)
                                      ▼
                         ┌────────────────────┐
                         │ COMPLETED / FAILED │
                         └────────────────────┘
```

---

## 9. Endpoint Özet Tablosu

| Endpoint | Method | Modül | Açıklama |
|----------|--------|-------|----------|
| `/admin/products/bulk-import` | POST | Catalog | Admin sync bulk import |
| `/admin/products/import-trendyol` | POST | Catalog | Admin Trendyol JSON import |
| `/admin/products/import-jobs/:jobId` | GET | Catalog | Job status |
| `/admin/products/import-jobs` | GET | Catalog | Job list |
| `/admin/products/bulk-update` | POST | Catalog | Bulk update |
| `/admin/products/bulk-delete` | POST | Catalog | Bulk delete |
| `/vendors/products/bulk/import` | POST | Vendor | Vendor file import (Excel/CSV/JSON) |
| `/admin/inventory/transfers/import-excel` | POST | Inventory | Direct XLSX import |
| `/vendors/inventory/import-excel` | POST | Inventory | Vendor Excel import |
| `/vendors/inventory/import-trendyol` | POST | Inventory | Vendor Trendyol JSON |
| `/vendors/inventory/template/download` | GET | Inventory | Template file download |

---

## 10. Teknoloji Stack

| Bileşen | Teknoloji |
|---------|-----------|
| **Dosya Parsing** | `xlsx` (Excel), custom RFC 4180 (CSV), native JSON |
| **Queue** | BullMQ (`@nestjs/bullmq`) — `product-import` queue |
| **Database** | MongoDB (Mongoose) — `CatalogProduct`, `Listing`, `ProductMedia`, `ImportJob` |
| **Image Upload** | `MediaService` — MinIO/S3 backend |
| **Auth** | JWT + AdminOnly guard |

---

*Bu doküman BazarX ürün yükleme sisteminin eksiksiz denetim raporudur. Herhangi bir değişiklik yapılmadan önce bu kontrol listesi referans alınmalıdır.*