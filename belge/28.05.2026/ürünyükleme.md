# Walkthrough — BazarX Media Proxy & Import Templates Implementation

A comprehensive walkthrough of the newly introduced high-performance media stream proxy and dynamic, single-source-of-truth import template download systems.

---

## Part 1: Backend Media Stream Proxy with ETag and Cache-Control

Implemented a high-performance streaming proxy for public media files in BazarX under `/api/v1/media/*`. It supports 1-year caching and conditional GET requests (`304 Not Modified`) based on ETag normalization.

### Changes Made

#### A. `MediaStreamService` — Split Retrieval Logic
**File:** [media-stream.service.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/media/application/services/media-stream.service.ts)
Added two new lightweight methods to query metadata separately from the actual file contents:
- `getObjectStat(objectKey: string)`: Resolves metadata like size, Content-Type, and ETag.
- `getObjectStream(objectKey: string)`: Resolves only the file stream.

This avoids performing a full file download from MinIO/local storage if the client matches the ETag cache.

#### B. `MediaController` — Caching & Streaming Implementation
**File:** [media.controller.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/media/presentation/media.controller.ts)
Refactored the `stream` endpoint using NestJS `StreamableFile`:
- Added `@Headers('if-none-match')` to extract client ETags.
- Normalized ETag comparison by stripping all quotes (`"`) and the `W/` weak tag prefix:
  ```typescript
  const clean = (val: string) => val.replace(/["\s]/g, '').replace(/^W\//, '');
  if (ifNoneMatch && clean(etag) === clean(ifNoneMatch)) {
    res.status(HttpStatus.NOT_MODIFIED).end();
    return;
  }
  ```
- Configured 1-year aggressive caching headers (`Cache-Control: public, max-age=31536000`), which is completely safe as BazarX uploads generate new random UUID keys for images.
- Returned the stream using NestJS `StreamableFile`.

---

## Part 2: Dynamic Import Templates & Download System

Implemented a centralized Excel and JSON import template generation service and unified backend and frontend download flow.

### Changes Made

#### A. Centralized Service Layer (`ImportTemplateService`)
**File:** [import-template.service.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/vendor/application/services/import-template.service.ts)
Created a new NestJS service utilizing the `xlsx` library to generate templates on the fly:
- **`generateVendorExcel()`**: Generates a multi-sheet Excel file.
  - **Sheet 1 ("Ürünler")**: Empty skeleton containing headers in the exact order requested: `Barkod* | SKU | Ürün Adı* | Açıklama | Fiyat* | Stok* | Marka | Kategori ID | Ana Resim | Ek Resimler | KDV Oranı | Durum`. Required fields are appended with an asterisk `*`.
  - **Sheet 2 ("Talimatlar")**: A detailed guide mapping constraints, KDV values, status codes, and multi-image separators.
  - **Sheet 3 ("Örnek Veri")**: Populated with 3 realistic example rows.
- **`generateAdminExcel()`**: Extends the vendor skeleton with administrative columns: `Brand ID | Öne Çıkan | Flash Sale | Özel Teklif | Vendor ID`.
- **`generateTrendyolJson()`**: Formats 5 fully-populated sample items containing categoryHint segments, correct brand mappings, and image list arrays.

#### B. Whitelist Robustness (`ColumnResolverService`)
**File:** [column-resolver.service.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/vendor/application/services/column-resolver.service.ts)
- Enhanced the header `normalize()` method to strip asterisks (`*`) automatically. This ensures columns decorated with `*` inside the generated templates map directly to `name`, `barcode`, `price`, etc. in `resolveHeaders()` without failures.

#### C. Backend Download Endpoint (`VendorProductController`)
**File:** [vendor-product.controller.ts](file:///Users/macbook/Desktop/bazarx/apps/backend/src/modules/vendor/presentation/vendor-product.controller.ts)
- Created the `GET /vendors/products/templates/:type` route.
- Restricts access via `JwtAuthGuard`.
- Pipes buffers dynamically with correct headers:
  - `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (for Excel) or `application/json` (for JSON).
  - `Content-Disposition`: `attachment; filename="..."` (e.g. `vendor_urun_sablonu.xlsx`).

#### D. Nuxt 3 Frontend Hook (`useImportTemplate.ts`)
**File:** [useImportTemplate.ts](file:///Users/macbook/Desktop/bazarx/apps/frontend/composables/useImportTemplate.ts)
- Created a Nuxt 3 composable that performs a `GET` request using `$fetch` with `responseType: 'blob'`.
- Automatically injects the active authentication token from `useAuthStore()` or the `access_token` cookie.
- Downloads the file cleanly in the browser using the DOM anchor trick.
