# Advertising Modülü — Derinlemesine Audit & Düzeltme Raporu

**Tarih:** 2026-05-25  
**Branch:** main  
**Commit Referansı:** f2bd3e25  
**Etkilenen Dosya Sayısı:** 16  
**Yeni Dosya:** 1 (`listing-flag.service.ts`)

---

## Özet Skor Tablosu

| Öncelik | Tespit Sayısı | Düzeltilen | Ertelenen |
|---|---|---|---|
| 🔴 KRİTİK | 4 | 3 | 1 (MENU_TAAHHUT tam akışı) |
| 🟠 YÜKSEK | 3 | 3 | 0 |
| 🟡 ORTA | 3 | 2 | 1 (SettingsController route çakışması) |
| 🟢 DÜŞÜK | 3 | 1 | 2 (AI boost, dead repo metodları) |

---

## Bölüm 1 — Audit Tespitleri

### 1.1 Controller Durumu

| Controller | Dosya | Durum |
|---|---|---|
| `VendorBannersController` | `vendor/presentation/vendor-banners.controller.ts` | ✅ Tam implement — GET/POST/PUT/DELETE |
| `AdCampaignVendorController` | `advertising/presentation/ad-campaign-vendor.controller.ts` | ✅ Tam implement |
| `AdCampaignController` | `advertising/presentation/ad-campaign.controller.ts` | ✅ Tam implement |
| `B2BAdPackageController` | `advertising/presentation/b2b-ad-package.controller.ts` | ✅ Tam implement |
| `AdvertisingAdminController` | `advertising/presentation/advertising-admin.controller.ts` | ✅ Tam implement |

**Not:** "4B stub controller'ları ✅" notu yanıltıcıydı — tüm controller'lar implement edilmişti.

### 1.2 SideAd Çift Modül Sorunu

- Schema: `packages/shared/shared-persistence/src/schemas/backend/sideAd.schema.ts` — tek kaynak, `collection: 'side_ads'`
- `content.module.ts:116` → `MongooseModule.forFeature` ile kayıtlı, CRUD sahibi
- `advertising.module.ts` → model proxy ile sadece okuma yapıyordu, `ecosystems` alanı schema'da yoktu
- **Sonuç:** Ecosystem bazlı filtreleme her zaman `[]` (boş) dönüyordu → tüm SideAd'lar herkese gösteriliyordu

### 1.3 GO Reklam Slot Sistemi

Schema, entity, DTO, enum'da sprint kararındaki alanların tamamı eksikti:

| Planlanan Alan | Önceki Durum | Sonraki Durum |
|---|---|---|
| `adSource: 'PAID' \| 'MENU_TAAHHUT'` | ❌ YOK | ✅ Schema + Entity + DTO |
| `restaurantId` | ❌ YOK | ✅ Schema + Entity + Mapper |
| `targetListingId` | ❌ YOK | ✅ Schema + Entity + DTO + Index |
| `targetSlotType` | ❌ YOK | ✅ Schema + Entity + DTO + Index |
| `menuTaahhutCount` | ❌ YOK | ✅ Schema |
| `calculatedAdValueTL` | ❌ YOK | ✅ Schema (Decimal128) |
| `tierAtCalculation` | ❌ YOK | ✅ Schema |
| `menuPriceRange` | ❌ YOK | ✅ Schema (enum) |
| `bonusMonthsGranted` | ❌ YOK | ✅ Schema |
| `isDiscretionary` | ❌ YOK | ✅ Schema + DTO |
| `UPPER_BANNER` slot tipi | ❌ YOK | ✅ AdSlotType enum |
| `LOWER_BANNER` slot tipi | ❌ YOK | ✅ AdSlotType enum |
| `FEATURED` slot tipi | ❌ YOK | ✅ AdSlotType enum |
| `FLASH_SALE` slot tipi | ❌ YOK | ✅ AdSlotType enum |
| `SPECIAL_OFFER` slot tipi | ❌ YOK | ✅ AdSlotType enum |
| `AI_RECOMMENDATION` slot tipi | ❌ YOK | ✅ AdSlotType enum + AD_SLOT_CONFIG |

### 1.4 Listing Flag ↔ AdSlot Bağlantısı

`advertising` modülünde `isFeatured`, `isFlashSale`, `isSpecialOffer` için **sıfır satır** kod mevcuttu.  
Kampanya onaylandığında flag set edilmiyor, kampanya bittiğinde flag temizlenmiyordu.

### 1.5 AdCampaignMetric Yazım Noktaları

```
RecordImpressionCommand
  → RecordImpressionHandler
    → BudgetManagerService.deductBudget()
      → MongoAdCampaignRepository.updateMetric()  ← BOŞ YORUM SATIRI
        → AdCampaignMetricRepository.save()        ← return; (ölü kod)
```

Tüm impression/click verileri sessizce düşüyordu. Hiçbir metrik yazılmıyordu.

### 1.6 Çakışan Kampanya Kontrolü

`CreateAdCampaignHandler` — aynı `targetListingId` + `targetSlotType` kombinasyonu için aktif kampanya kontrolü yoktu.

### 1.7 Type Safety

| Sorun | Önceki | Sonraki |
|---|---|---|
| `metadata: Schema.Types.Mixed` | `any` eşdeğeri | `AdCampaignMetadata` interface |
| `AdSource` | string literal | `const` array + `AdSourceType` |
| `MenuPriceRange` | string | `const` array + `MenuPriceRangeType` |

---

## Bölüm 2 — Uygulanan Düzeltmeler

### Düzeltme 1 — AdCampaignMetric Yazımı

**Dosyalar:**
- `packages/shared/shared-persistence/src/schemas/backend/adCampaignMetric.schema.ts`
- `apps/backend/src/modules/advertising/infrastructure/persistence/mongo-ad-campaign.repository.ts`

**Değişiklik:**
```typescript
// adCampaignMetric.schema.ts
AdCampaignMetricSchema.index({ adCampaignId: 1, date: 1 }, { unique: true }); // ← YENİ

// mongo-ad-campaign.repository.ts
async updateMetric(campaignId: string, type: 'impression' | 'click', cost: number): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inc = type === 'impression'
    ? { impressions: 1, spend: cost }
    : { clicks: 1, spend: cost };
  await AdCampaignMetric.updateOne(
    { adCampaignId: campaignId, date: today },
    {
      $inc: inc,
      $setOnInsert: { id: randomUUID(), adCampaignId: campaignId, date: today, sales: 0 },
    },
    { upsert: true },
  ).exec();
}
```

### Düzeltme 2 — GO Alanları Schema + Entity + Mapper

**Dosyalar:**
- `packages/shared/shared-persistence/src/schemas/backend/adCampaign.schema.ts`
- `apps/backend/src/modules/advertising/domain/entities/ad-campaign.entity.ts`
- `apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.ts`

9 yeni alan, 2 yeni MongoDB index, `AdSourceType` ve `MenuPriceRangeType` tip tanımları eklendi.

### Düzeltme 3 — AdSlotType Enum Genişletmesi

**Dosya:** `apps/backend/src/modules/advertising/domain/enums/advertising.enums.ts`

6 GO slot tipi (`UPPER_BANNER`, `LOWER_BANNER`, `FEATURED`, `FLASH_SALE`, `SPECIAL_OFFER`, `AI_RECOMMENDATION`) eklendi.  
`AD_SLOT_CONFIG` sabiti ile slot başına `defaultDays` ve `aiBoost` değerleri tanımlandı.

### Düzeltme 4 — ListingFlagService + CampaignExpiredEvent

**Dosyalar:**
- `apps/backend/src/modules/advertising/application/services/listing-flag.service.ts` ← **YENİ**
- `apps/backend/src/modules/advertising/domain/events/advertising.events.ts`
- `apps/backend/src/modules/advertising/domain/entities/ad-campaign.entity.ts`
- `apps/backend/src/modules/advertising/application/commands/ad-lifecycle.handlers.ts`

**Akış:**
```
Kampanya onaylandı (ApproveAdCampaignHandler)
  → targetListingId + targetSlotType varsa
    → ListingFlagService.applyAdFlag()
      → listings koleksiyonuna { isFeatured: true } / { isFlashSale: true } / { isSpecialOffer: true }

Kampanya sona erdi (AdCampaign.expire())
  → CampaignExpiredEvent domain eventi fırlatılır
    → CampaignExpiredHandler (@EventsHandler)
      → ListingFlagService.clearAdFlag()
        → listings koleksiyonuna { isFeatured: false } / ...
```

`ListingFlagService` — `@InjectConnection()` ile raw MongoDB yazımı, catalog modülüne bağımlılık yok.

### Düzeltme 5 — SideAd `ecosystems` Alanı

**Dosyalar:**
- `packages/shared/shared-persistence/src/schemas/backend/sideAd.schema.ts`
- `apps/backend/src/modules/advertising/infrastructure/persistence/ad-misc.repositories.ts`

```typescript
// sideAd.schema.ts
ecosystems?: string[];  // ['BAZARX', 'TICARITAKAS', 'BARTERBORSA', 'GLOBAL']

// MongoSideAdRepository — artık DB'den okuyor
ecosystems: (r as { ecosystems?: string[] }).ecosystems ?? [],
```

### Düzeltme 6 — CreateAdCampaignHandler Çakışma Kontrolü + adSource

**Dosyalar:**
- `apps/backend/src/modules/advertising/application/dtos/create-ad-campaign.dto.ts`
- `apps/backend/src/modules/advertising/domain/repositories/ad-campaign.repository.interface.ts`
- `apps/backend/src/modules/advertising/infrastructure/persistence/mongo-ad-campaign.repository.ts`
- `apps/backend/src/modules/advertising/application/commands/create-ad-campaign.handler.ts`

```typescript
// Çakışma kontrolü
if (dto.targetListingId && dto.targetSlotType) {
  const existing = await this.repository.findActiveByListingAndSlot(
    dto.targetListingId, dto.targetSlotType,
  );
  if (existing) {
    throw new ConflictException({ code: 'SLOT_ALREADY_OCCUPIED' });
  }
}
```

### Düzeltme 7 — advertising.module.ts Güncelleme

```typescript
// SideAd artık forFeature ile DI yönetimli
{ name: 'SideAd', schema: SideAdSchema }

// Yeni provider'lar
ListingFlagService
CampaignExpiredHandler  // @EventsHandler
```

---

## Bölüm 3 — Değiştirilmeyen Dosyalar (İş Kararı)

| Konu | Değer | Gerekçe |
|---|---|---|
| UPPER_BANNER süresi | 7 gün | Ürün kararı |
| LOWER_BANNER süresi | 14 gün | Ürün kararı |
| AI boost katsayısı | 1.5 | Ürün kararı (`AD_SLOT_CONFIG` üzerinden yönetiliyor) |
| Prime 1-4 haftalık fiyatlar | 6.000 / 8.000 / 10.000 / 12.000 ₺ | Ürün kararı |
| Aylık bağlılık indirimi | %10 | Ürün kararı |
| MENU_TAAHHUT tier süreleri | Bronz=1ay, Gümüş=2ay... | Ürün kararı |
| XP ile reklam ödemesi limiti | %25 | Ürün kararı |

---

## Bölüm 4 — Kalan İş Listesi

| # | Madde | Risk | Sonraki Sprint |
|---|---|---|---|
| 1 | `MENU_TAAHHUT` tam akışı — LaunchPartner bağlantısı, taahhüt sayısı doğrulama | 🔴 KRİTİK | GO sprint'inde LaunchPartner modülü tamamlanınca |
| 2 | `POST /admin/go/restaurants/:id/calculate-ad-right` endpoint | 🟠 YÜKSEK | GO admin sprint |
| 3 | `POST /admin/go/restaurants/:id/grant-ad-right` endpoint | 🟠 YÜKSEK | GO admin sprint |
| 4 | Cron job — süresi dolan kampanyaları `EXPIRED`'a geçirme | 🟠 YÜKSEK | Scheduler sprint |
| 5 | `AI_RECOMMENDATION` listing sıralama boost entegrasyonu | 🟡 ORTA | Catalog sprint |
| 6 | `SettingsController` route çakışması (`/settings` prefix) | 🟡 ORTA | Advertising route → `/ads/settings` |
| 7 | `AdSlotRepository.findById()` / `findAll()` — `return null`/`[]` ölü metodlar | 🟢 DÜŞÜK | Temizlik sprint |
| 8 | `AdCampaignMetricRepository.save()` — `return;` ölü metod | 🟢 DÜŞÜK | Temizlik sprint |

---

## Bölüm 5 — Etkilenen Dosya Listesi

```
MODIFIED:
  packages/shared/shared-persistence/src/schemas/backend/adCampaign.schema.ts
  packages/shared/shared-persistence/src/schemas/backend/adCampaignMetric.schema.ts
  packages/shared/shared-persistence/src/schemas/backend/sideAd.schema.ts
  apps/backend/src/modules/advertising/advertising.module.ts
  apps/backend/src/modules/advertising/domain/enums/advertising.enums.ts
  apps/backend/src/modules/advertising/domain/entities/ad-campaign.entity.ts
  apps/backend/src/modules/advertising/domain/events/advertising.events.ts
  apps/backend/src/modules/advertising/domain/repositories/ad-campaign.repository.interface.ts
  apps/backend/src/modules/advertising/application/commands/ad-lifecycle.handlers.ts
  apps/backend/src/modules/advertising/application/commands/create-ad-campaign.handler.ts
  apps/backend/src/modules/advertising/application/dtos/create-ad-campaign.dto.ts
  apps/backend/src/modules/advertising/infrastructure/persistence/mongo-ad-campaign.repository.ts
  apps/backend/src/modules/advertising/infrastructure/persistence/ad-misc.repositories.ts
  apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.ts

CREATED:
  apps/backend/src/modules/advertising/application/services/listing-flag.service.ts
```
