# BazarX — Ürün Ekleme Modülü Denetim & Mimari Haritası

> Denetim tarihi: 2026-05-28
> Kapsam: Ürün ekleme (oluşturma) akışı — backend `catalog` + `vendor` modülleri, frontend ürün formu zinciri.
> Amaç: Her dosyanın yolu, kullanım mantığı ve dosyalar arası ilişkilerin tek kaynaktan görülmesi.

---

## 1. Genel Mimari Özeti

Ürün ekleme **tek bir modül değil**, üç ayrı oluşturma yolundan oluşur. Hepsi aynı çekirdek veri modelini besler:

```
CatalogProduct  (kanonik ürün — marka, isim, slug, GTIN, kategori, specs)
      │  1
      │
      │  N
   Listing      (satıcının teklifi — fiyat, stok, görünürlük, vendorId)
      │  1
      │  N
 ListingImage   (listing görselleri) / ProductMedia (medya kayıtları)
```

- **CatalogProduct** = "üründen bahsederken kastedilen şey" (katalog kimliği).
- **Listing** = o ürünü satan belirli bir satıcının fiyat/stok teklifidir. Kullanıcının gördüğü "ürün" = CatalogProduct + Listing.
- Bir CatalogProduct birden çok satıcının Listing'ine sahip olabilir (Buybox mantığının temeli).

### Üç oluşturma yolu

| Yol | UI giriş noktası | HTTP | Controller → Command → Handler | Davranış |
|-----|------------------|------|-------------------------------|----------|
| **A. Satıcı (self-service)** | `pages/vendor/product-form.vue` | `POST /api/v1/listings` | `ListingController` → `CreateListingCommand` → `CreateListingHandler` | Domain-temiz: VO'lar (Slug, Price) ile Listing + gerekirse yeni CatalogProduct oluşturur |
| **B. Admin panel** | `pages/admin/product-form.vue` | `POST /api/v1/admin/products` | `ProductAdminController` → `CreateAdminProductCommand` → `CreateAdminProductHandler` | Schema-direkt: CatalogProduct (Mongoose schema) + opsiyonel Listing'i **SystemVendor** altında oluşturur |
| **C. Kanonik katalog** | (admin/dahili) | `POST /api/v1/products` | `CatalogProductController` → `CreateCatalogProductCommand` → `CreateCatalogProductHandler` | En "DDD-saf" yol: GTIN benzersizlik kontrolü + domain entity + `ICatalogProductRepository.save` |
| **+ Toplu içe aktarma** | `pages/vendor/products.vue` (Excel) | `POST /api/v1/vendors/products/bulk/import` | `VendorProductController` → `BulkImportVendorProductsCommand` | Excel/CSV/JSON parse → tier batch limiti → toplu Listing |

> ⚠️ **Kritik ilişki notu:** Satıcı "Ürün Ekle" formu `/vendors/products` (POST) endpoint'ini **kullanmaz**; `/listings`'e gider. `VendorProductController` POST `create` metodu (`CreateVendorProductCommand`) UI'dan tetiklenmez — fiilen yalnızca `bulk/import` ve listeleme/silme için kullanılır. Bkz. §5 Bulgular.

---

## 2. Backend — `catalog` Modülü (DDD Katmanları)

Kök: `apps/backend/src/modules/catalog/`

### 2.1 Modül kökü
| Dosya | Görev |
|-------|-------|
| `catalog.module.ts` | Tüm controller/handler/repository DI bağlama noktası. Mongoose şemalarını (`CatalogProduct`, `Listing`, `ListingImage`, `ProductMedia`, `Category`, `Brand`, `Vendor` …) kaydeder; `ICatalogProductRepository`→`MongoCatalogProductRepository`, `IListingRepository`→`MongoListingRepository` provider eşlemelerini yapar; Buybox BullMQ kuyruğunu kurar; `MediaModule` import eder. |
| `index.ts` | Modülün dış API yüzeyi (barrel export). |

### 2.2 Domain katmanı (`domain/`)
| Dosya | Görev / İlişki |
|-------|----------------|
| `entities/catalog-product.entity.ts` | **Kanonik ürün aggregate'i.** `CatalogProduct.create()` (yeni, status=`ACTIVE`) ve `fromPersistence()`. Slug/GTIN/Rating value object'lerini içerir. C ve A-yol-A'nın domain'i. |
| `entities/listing.entity.ts` | **Satıcı teklifi aggregate'i.** `Listing.create()` — Price VO, görünürlük, ekosistem alanları (`ecosystemId`, `visibleTo`, `allowOnlineResale` …). A yolunun çıktısı. |
| `entities/category.entity.ts`, `brand.entity.ts` | Kategori ağacı ve marka aggregate'leri. |
| `value-objects/slug.vo.ts` | `Slug.fromText()` — URL slug üretimi. |
| `value-objects/gtin.vo.ts` | `GTIN.create()` — barkod doğrulama; C yolunda benzersizlik kontrolü. |
| `value-objects/price.vo.ts` | `Price.create()` — para doğrulaması (float yasak kuralı). |
| `value-objects/rating.vo.ts` | Puan VO (0 başlangıç). |
| `enums/product-condition.enum.ts`, `listing-status.enum.ts`, `listing-visibility.enum.ts` … | Durum/koşul/görünürlük enum'ları. |
| `repositories/catalog-product.repository.interface.ts` | `ICatalogProductRepository` — `save`, `findById`, `findByGTIN`, `create`. |
| `repositories/listing.repository.interface.ts` | `IListingRepository` — `save`, `create` vb. |

### 2.3 Application katmanı (`application/`)
**Ürün ekleme ile doğrudan ilgili komutlar:**
| Dosya | Görev |
|-------|-------|
| `commands/create-catalog-product.command.ts` + `.handler.ts` | **C yolu.** DTO alır → GTIN varsa benzersizlik kontrolü → `CatalogProduct.create` → `repo.save`. ID döner. |
| `commands/create-listing.command.ts` + `.handler.ts` | **A yolu (satıcı UI'sinin asıl backend'i).** `catalogProductId` yoksa yeni CatalogProduct oluşturur; Price VO; Listing.create (ekosistem alanları dahil) → `listingRepo.save`. |
| `commands/create-admin-product.command.ts` + `.handler.ts` | **B yolu.** Schema-direkt CatalogProduct.create (slug çakışmasında 3 deneme + hex suffix); `brandId` varsa Brand'e `$addToSet`; price/stock verildiyse SystemVendor altında Listing açar. |
| `commands/update-admin-product.*`, `delete-admin-product.*`, `bulk-*-admin-products.*` | Admin CRUD ve toplu işlemler. |
| `commands/queue-import-products.*` + `workers/product-import.worker.ts` | Toplu import'u kuyruğa atar; worker arka planda işler. |
| `commands/bulk-import-products.*` | Senkron toplu import handler'ı. |
| `dtos/create-catalog-product.dto.ts` | C yolunun girdi sözleşmesi (`name`, `brand`, `description` zorunlu; `gtin`, `categoryId`, `specs`, `attributes` opsiyonel). class-validator ile doğrulanır. |
| `dtos/create-listing.dto.ts` | A yolunun girdi sözleşmesi. |
| `services/system-vendor.service.ts` | `getSystemVendorId()` — admin ürünlerinin bağlanacağı sistem satıcısı. B yolu kullanır. |
| `services/trendyol-import-normalizer.service.ts` | Trendyol verisini iç şemaya normalize eder (import-trendyol). |
| `services/import-category-resolver.service.ts`, `image-import.service.ts` | Import sırasında kategori eşleme ve görsel çekme. |
| `services/buybox-calculator.service.ts` + `handlers/buybox-recalculate.handler.ts` | Listing eklendiğinde Buybox kazananını hesaplar (BullMQ). |
| `queries/list-admin-products/*`, `get-product-stats.*`, `get-catalog-products/*` … | Listeleme/istatistik query'leri. |

### 2.4 Infrastructure katmanı (`infrastructure/`)
| Dosya | Görev |
|-------|-------|
| `persistence/mongo-catalog-product.repository.ts` | `ICatalogProductRepository`'nin Mongoose implementasyonu. |
| `persistence/mongo-listing.repository.ts` | `IListingRepository` implementasyonu. |
| `persistence/mappers/catalog-product.mapper.ts` | Domain entity ↔ Mongoose doc dönüşümü (Decimal/VO çevirimi). |
| `persistence/mappers/listing.mapper.ts` | Listing domain ↔ doc. |
| `infrastructure/services/system-vendor.service.ts` | (provider; sistem satıcı kimliği). |

### 2.5 Presentation katmanı (`presentation/`)
| Dosya | Endpoint(ler) | Not |
|-------|---------------|-----|
| `listing.controller.ts` | `POST /listings` (oluştur), `GET /listings`, `GET /listings/marketplace`, `GET /listings/categories` | **Satıcı UI'sinin ürün ekleme hedefi.** |
| `catalog-product.controller.ts` | `POST /products` (ADMIN, C yolu), `GET /products`, `GET /products/slug/:slug`, `GET /products/homepage-bulk` | Public listeleme + kanonik oluşturma. |
| `product-admin.controller.ts` | `POST /admin/products` (B yolu), `GET/PUT/DELETE /admin/products`, `bulk-import`, `import-trendyol`, `import-jobs` | Tüm admin ürün yönetimi (RolesGuard: ADMIN/SUPER_ADMIN). |
| `category.controller.ts`, `category-admin.controller.ts`, `brand*.controller.ts`, `product-type-admin.controller.ts` | Form bağımlılıkları (kategori ağacı, marka, ürün tipi). |

---

## 3. Backend — `vendor` Modülü (Ürün İlgili)

Kök: `apps/backend/src/modules/vendor/`

| Dosya | Endpoint / Görev |
|-------|------------------|
| `presentation/vendor-product.controller.ts` | `@Controller('vendors/products')`. `POST /` (create — UI kullanmıyor), `GET /` (satıcının ürünleri), `PUT/DELETE /:id`, **`POST /bulk/import`** (Excel/CSV/JSON, Multer `file` alanı, tier `excelBatchLimit` zorlaması), `GET /templates/:type` (şablon indir). |
| `application/commands/create-vendor-product.command.ts` + `.handler.ts` | Satıcı için CatalogProduct (status=`PENDING`) + Listing + ListingImage oluşturur. **UI'dan tetiklenmez** (form `/listings` kullanır). |
| `application/commands/bulk-import-vendor-products.*` | `bulk/import`'un asıl handler'ı. |
| `application/commands/update-vendor-product.*`, `delete-vendor-product.*` | Satıcı ürün güncelle/sil. |
| `application/queries/list-vendor-products.*`, `get-vendor-products.*` | Satıcının ürün listesi. |
| `application/services/file-parser.service.ts` | Excel/CSV/JSON parse (bulk import). |
| `application/services/import-template.service.ts` | İndirilebilir şablon (xlsx/json) üretir. |

---

## 4. Frontend — Ürün Formu Zinciri (Nuxt 3)

Kök: `apps/frontend/`

### 4.1 Sayfalar (giriş noktaları)
| Dosya | Rol | Submit hedefi |
|-------|-----|---------------|
| `pages/vendor/product-form.vue` | Satıcı "Ürün Ekle/Düzenle". `ProductForm.vue`'yu sarar, `handleSave` ile submit eder. Price Floor (`minMarketPrice`) client kontrolü. | `POST/PUT /api/v1/listings` |
| `pages/vendor/products.vue` | Satıcı ürün listesi + toplu Excel yükleme girişi. | `/vendors/products` + `bulk/import` |
| `pages/admin/product-form.vue` | Admin ürün ekle/düzenle (kendi inline form düzeni; alt bileşenler `components/admin/products/*`). | `/api/admin/products` (AdminProductService) |

### 4.2 Form çekirdeği
| Dosya | Görev |
|-------|-------|
| `composables/useProductForm.ts` | **Form ViewModel.** `reactive form` (tüm alanlar), `sections` (Kimlik/Temel/Özellik/İçerik/Medya/Envanter/Lojistik/Ekosistem/Pazarlama), kategori hiyerarşisi (`fetchCategories`, 3 kademeli seçim), görsel yükleme (`handleFileUpload` → `POST /api/v1/upload?subPath=products`, FormData alanı `file`), `validateForm`. **Submit içermez** — submit'i sayfa yapar. İmza: `useProductForm({ productId, initialData })`. |
| `components/forms/ProductForm.vue` | **Orchestrator.** `useProductForm`'u çağırır, `vendorType`'a göre bölümleri (RESTAURANT ek bölümü) düzenler, alt bileşenlere `v-model` dağıtır, `defineExpose({ form, saveProduct })` ile sayfaya açar. |
| `types/product-form.ts` | `ProductFormState`, `CategoryAttribute`, `FormSection`, `MarketingFlag` arayüzleri. |
| `types/product.ts` | Genel `Product` tipi (listeleme/detay). |

### 4.3 Form alt bileşenleri (`components/product/form/`)
`ProductForm.vue` tarafından `v-model` ile beslenen bölümler:
`ProductFormNavigation` (sol menü), `ProductFormIdentity` (barkod/model), `ProductFormBasics` (ad/marka/kategori), `ProductFormAttributes` (+`…Restaurant`), `ProductFormContent` (açıklama/teknik özellik), `ProductFormMedia` (görsel), `ProductFormInventory` (+`…Restaurant`) (fiyat/stok), `ProductFormLogistics` (kargo/ağırlık), `ProductFormEcosystem` (Master Plan §4.2/§4.3 ekosistem alanları), `ProductFormMarketing` (rozet/SEO/bayraklar).

### 4.4 Admin'e özel bileşenler (`components/admin/products/` & `admin/product/`)
`ProductMediaManager`, `ProductPricingInventory`, `ProductOrganization`, `ProductSEO`, `ProductShipping` (admin sayfa inline kullanır); `AdminProductForm`, `AdminProductTable`, `AdminProductFilter`, `AdminBulkUpdateModal`, `Pending*` (onay bekleyenler).

### 4.5 API servisleri
| Dosya | Görev |
|-------|-------|
| `services/api/ProductService.ts` | Public ürün okuma: `getProducts` (`/api/products`), `getProductBySlug`, yorumlar, teslimat tahmini. |
| `services/api/AdminProductService.ts` | Admin CRUD: `createProduct`/`updateProduct`/`deleteProduct` (`/api/admin/products`), `approveProduct`, `bulkUpdate/Delete/Import`, `importTrendyol`. |

---

## 5. Uçtan Uca İlişki Akışı

**Satıcı ürün ekleme (A yolu — fiili UI akışı):**
```
pages/vendor/product-form.vue (handleSave)
  → ProductForm.vue (form state, saveProduct→validateForm)
    → useProductForm.ts (reactive form + görsel upload)
  → POST /api/v1/listings  (payload = form)
    → ListingController.create
      → CreateListingCommand → CreateListingHandler
        → (catalogProductId yoksa) CatalogProduct.create + ICatalogProductRepository.save
        → Listing.create (Price VO, ekosistem alanları) + IListingRepository.save
          → MongoListingRepository → listing.mapper → Mongo
```

**Admin ürün ekleme (B yolu):**
```
pages/admin/product-form.vue → AdminProductService.createProduct
  → POST /api/v1/admin/products
    → ProductAdminController.createProduct → CreateAdminProductCommand → CreateAdminProductHandler
      → CatalogProduct (schema) create + (price/stock ise) Listing @ SystemVendor
```

**Görsel yükleme (her iki form):** `useProductForm.handleFileUpload` → `POST /api/v1/upload?subPath=products` (FormData `file`) → URL → `form.productImages[]`.

---

## 6. Denetim Bulguları

### ✅ B1 — Admin form sayfası composable API'siyle uyumsuz (DÜZELTİLDİ — 2026-05-28)
**Önceki durum:** `pages/admin/product-form.vue` şunu yapıyordu:
```js
const { form, saving, fetchCategories, fetchProduct, saveProduct, ... } = useProductForm(route.query.id)
```
`composables/useProductForm.ts` (tek tanım) **`saving`, `fetchCategories`, `fetchProduct`, `saveProduct` döndürmüyor** ve parametre olarak `string` değil `{ productId, initialData }` bekliyordu. Sonuç: `onMounted`'te `TypeError (not a function)`, `saveProduct` `undefined`, `saving` daima `false`, `isEditing` daima `false`.

**Uygulanan çözüm** (`pages/admin/product-form.vue` `<script setup>`):
- `useProductForm({ productId: route.query.id })` doğru imzasına geçildi; yalnızca composable'ın gerçekten döndürdüğü değerler destructure edildi.
- `saving` yerel `ref(false)` yapıldı; `saveProduct` `AdminProductService.createProduct` (yeni) / `updateProduct` (düzenleme) ile bağlandı.
- Kategori cascade `watch(selectedMain/Sub1/Sub2 → handleXChange)` ile çalışır hale getirildi (alt kategori + `form.categoryId` artık dolar).
- Çöken `fetchCategories()`/`fetchProduct()` çağrıları kaldırıldı — kategoriler composable'ın kendi `onMounted`'ında yükleniyor.
- **Whitelist payload:** Global `ValidationPipe` `forbidNonWhitelisted: true` olduğundan tüm `form` gönderilmiyor; yalnızca `CreateAdminProductDto` alanları (`buildPayload()`) gönderiliyor. Doğrulama: ESLint 0 hata.

**Bilinen sınır:** Admin tarafında tekil ürün GET endpoint'i yok ve sayfaya `?id=` ile yönlendiren yer yok (yalnızca `inventory.vue` id'siz "ürün ekle" linki) — sayfa pratikte create-only. Submit düzenlemeyi destekler, ancak GET-by-id olmadığı için düzenleme ön-doldurması yapılmaz. Düzenleme gerçekten istenirse backend'e `GET /admin/products/:id` eklenmeli.

### ✅ B2 — İki vendor ürün-oluşturma yolu, biri ölü (DÜZELTİLDİ — 2026-05-28)
**Önceki durum:** `VendorProductController.POST /vendors/products` (`CreateVendorProductCommand`) mevcuttu ama satıcı "Ürün Ekle" formu `/api/v1/listings`'e gidiyordu; create-vendor-product handler'ı UI'dan hiç çağrılmıyordu.
**Uygulanan çözüm** (Codex'e devredildi, grep ile kullanılmadığı doğrulandı):
- Silindi: `create-vendor-product.command.ts`, `create-vendor-product.handler.ts`
- `vendor-product.controller.ts`: ölü `@Post() create` metodu + `CreateVendorProductDto` + import kaldırıldı
- `vendor.module.ts`: `CreateVendorProductHandler` provider'ı kaldırıldı
- **Korunan endpoint'ler:** `POST /vendors/products/bulk/import`, `GET /`, `PUT /:id`, `DELETE /:id`, `GET /templates/:type`
- Doğrulama: `tsc --noEmit` → 0 hata.

### ✅ B3 — `console.error` kullanımı (DÜZELTİLDİ — 2026-05-28)
- `pages/admin/product-form.vue`: B1 düzeltmesinde temizlendi (`$toast` kullanıyor).
- `pages/vendor/product-form.vue`: iki `console.error` kaldırıldı (kaydet hatası zaten `$toast.error` gösteriyor; fetch hatası sessiz fallback'e bırakıldı).
- **Ek:** Aynı dosyadaki 3 adet `no-explicit-any` (satır 119/124/133 — `formData as any`, `ApiResponse<any>`, `catch (err: any)`) tipli ifadelerle değiştirildi (`{ productImages?: string[] }`, `ApiResponse<unknown>`, `err: unknown` + dar cast). ESLint → 0 error.

### ✅ G1 — Yeni ürün durum tutarlılığı / onay akışı (DÜZELTİLDİ — 2026-05-28)
Karar: satıcının `/listings` üzerinden eklediği ürünler artık admin onayına kadar yayında görünmez.
**Uygulanan çözüm (A yolu — `CreateListingHandler`):**
- `listing-status.enum.ts`: `PENDING` değeri eklendi (persistence'ta zaten kullanılıyordu, enum'da eksikti).
- `listing.entity.ts` → `Listing.create` varsayılan statüsü `ACTIVE` → **`PENDING`**. Domain `Listing.create`'i yalnızca A yolu çağırdığı için diğer yollar (admin/bulk/inventory — hepsi Mongoose model `Listing.create`) etkilenmez.
- `catalog-product.entity.ts` → `CatalogProduct.create`'e opsiyonel `status` eklendi (varsayılan `ACTIVE`, C yolu değişmez); `create-listing.handler` yeni katalog ürününü `PENDING` oluşturur. Böylece ürün hem `/listings/marketplace` (listing status ACTIVE filtreler) hem `/products` browse (catalog status ACTIVE filtreler) dışında kalır.
- **Onay akışı (mevcut altyapıya bağlandı):** Admin "pending products" kuyruğu (`useAdminPendingProducts` → `GET /admin/products?status=PENDING`, `list-admin-products.handler` `listings.status` üzerinden filtreler) ürünü gösterir → admin `PUT /admin/products/:id {status:'ACTIVE'}` (`UpdateAdminProductHandler`) hem CatalogProduct hem Listing statüsünü `ACTIVE`'e çeker → ürün yayına girer.
- Doğrulama: `tsc --noEmit` → 0 hata; mapper `toPersistence` status'u persist ediyor; public sorgular (`list-catalog-listings`, `get-catalog-products`) `ACTIVE` filtreliyor.

### 🟢 G2 — Görsel alan adı tutarlı (AKSİYON GEREKMEZ)
Upload FormData anahtarı `file` (hem form composable hem vendor bulk import) — `surplus-rules.md` "field name `file`" kuralına uygun. ✅

### ✅ Ek not — İç içe backend kopyası (SİLİNDİ — 2026-05-28)
`apps/backend/backend/` altındaki ayrı izlenen backend kopyası (~1003 git dosyası) kaldırıldı. Ana build'e (`tsconfig.json` → `src/**/*`) dahil değildi ve hiçbir yerden referans verilmiyordu; ana backend `.env` dosyaları (`apps/backend/.env*`) etkilenmedi.

---

## 7. Hızlı Referans — Endpoint ↔ Dosya

| Endpoint | Controller dosyası | Handler |
|----------|--------------------|---------|
| `POST /api/v1/listings` | `catalog/presentation/listing.controller.ts` | `create-listing.handler.ts` |
| `POST /api/v1/products` | `catalog/presentation/catalog-product.controller.ts` | `create-catalog-product.handler.ts` |
| `POST /api/v1/admin/products` | `catalog/presentation/product-admin.controller.ts` | `create-admin-product.handler.ts` |
| ~~`POST /api/v1/vendors/products`~~ | — | **B2 ile kaldırıldı (ölü endpoint)** |
| `POST /api/v1/vendors/products/bulk/import` | `vendor/presentation/vendor-product.controller.ts` | `bulk-import-vendor-products.handler.ts` |
| `POST /api/v1/upload?subPath=products` | (media/upload modülü) | — |

---
*Bu belge denetlenen kaynak dosyaların doğrudan okunmasına dayanır; bulgular kod üzerinde grep/okuma ile doğrulanmıştır.*
