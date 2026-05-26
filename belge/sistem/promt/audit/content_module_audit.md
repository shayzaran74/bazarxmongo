# Content Modülü — Derinlemesine İnceleme & Düzeltme Raporu

**Tarih:** 2026-05-25
**Modül:** `apps/backend/src/modules/content/`
**Durum:** Tamamlandı — 4 düzeltme uygulandı

---

## BÖLÜM 1 — Mimari Haritalama

### 1.1 SideAd Sahiplik Sorunu (KRITIK — Önceki Audit'ten Taşındı)

**Bulgu:** `SideAd` hem `ContentModule` hem de `AdvertisingModule` tarafından aynı `SideAd` mongoose modeli olarak kayıtlı.

**Kanıt:**
- `content.module.ts:116`: `{ name: 'SideAd', schema: SideAdSchema }`
- `advertising.module.ts:66`: `{ name: 'SideAd', schema: SideAdSchema }`

Her iki modül de aynı `side_ads` koleksiyonuna bağlanıyor. Schema aynı olduğundan çalışıyor ama modül sorumluluğu belirsiz: `SideAdsAdminController` Content modülünde, `GetSideAdsHandler` ise Advertising modülünde.

**Karar (raporlandı, büyük refactor gerektiği için düzeltilmedi):** Advertising modülü sahip olmalı, Content modülü import etmeli.

### 1.2 siteSettings Backend Endpoint

**Bulgu:** `siteSettings` adında bir backend endpoint'i YOK. Site ayarları `SystemSetting` MongoDB collection'ında `key` bazlı saklanıyor.

`settings.controller.ts:37`: `data: any` — tip güvensiz dönüş.

### 1.3 Policy Versiyonlama Mekanizması

**Bulgu:** `Policy` schema'sında `version` field var ama versiyonlama mekanizması YOK. Aynı slug ile yeni policy oluşturulursa mevcut olanın üzerine yazılıyor. `acceptedPolicyVersions` kullanıcı takibi YOK — KVKK uyumu için kritik eksiklik.

### 1.4 HomeBanner Tarih Filtresi

**Bulgu:** Tarih filtresi doğru uygulanmış — hem entity seviyesinde `isVisible()` hem de repository seviyesinde MongoDB sorgusu (`$or`/`$and` ile).

### 1.5 DynamicContent Kullanımı

**Bulgu:** `DynamicContent` entity ve repository tamamen implemente ama CQRS pipeline eksik. `GetDynamicContentHandler` module'e kayıtlı ama handler implementasyonu yok.

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### 2.1 Tespit Edilen `any` Kullanımları (8 adet)

| Dosya | Satır | Kullanım |
|---|---|---|
| `mongo-home-banner.repository.ts` | 19 | `toDomain(doc: any)` |
| `help.mappers.ts` | 7, 39 | `toDomain(raw: any)` |
| `help.mappers.ts` | 21, 55 | `toPersistence(domain: any)` |
| `home-banner.mapper.ts` | 6, 23 | `toDomain/toPersistence(raw: any)` |

### 2.2 `SeoMetadata` Platform Index Hatası

**Bulgu:** `seoMetadata.schema.ts:33` — `{ platform: 1, path: 1 }` composite index tanımlı ama `ISeoMetadata` interface'inde `platform` field'i **yok**. Bu index ya hatalı çalışır ya da MongoDB `path` dışında bir field arar.

**Ayrıca:** `path` için unique index **yok** — duplicate slug riski.

---

## BÖLÜM 3 — İş Kuralı Akışı Analizi

### 3.1 HelpArticle viewCount

**Bulgu:** `incrementViewCount()` entity'de tanımlı ve `GetHelpArticleHandler` (satır 51-52) tarafından çağrılıyor. Doğru uygulanmış.

### 3.2 SeoMetadata `_platform` Kullanılmıyor

**Bulgu:** `content-misc.repositories.ts:127-129` — `findByPath(path, _platform)` metodu `_platform` parametresini sorguya eklemiyor. Sadece `path` ile sorgu yapıyor. Aynı path farklı platformlarda birden fazla kayıt olursa hepsi aynı görünür.

---

## BÖLÜM 4 — Uygulanan Düzeltmeler

### Düzeltme 1 — `SeoMetadata` Hatalı Index + Unique Index Eklendi

**Dosya:** `packages/shared/shared-persistence/src/schemas/backend/seoMetadata.schema.ts`

```typescript
// ÖNCE:
// Composite index — hatalı (platform field yok)
SeoMetadataSchema.index({ platform: 1, path: 1 });

// SONRA:
// Unique index — path benzersiz olmalı (URL bazlı SEO)
SeoMetadataSchema.index({ path: 1 }, { unique: true });
```

**Etki:** `SeoMetadata` path'leri artık benzersiz olacak, duplicate slug hatası verilecek.

---

### Düzeltme 2 — `any` Tipler `Record<string, unknown>` ile Değiştirildi

**Dosya:** `help.mappers.ts`

```typescript
// ÖNCE
static toDomain(raw: any): HelpArticle

// SONRA
static toDomain(raw: Record<string, unknown>): HelpArticle
static toPersistence(domain: HelpCategory): Record<string, unknown>
static toDomain(raw: Record<string, unknown>): HelpCategory
static toPersistence(domain: HelpArticle): Record<string, unknown>
```

Ayrıca `ArticleStatus` enum import edildi ve `status: raw.status as ArticleStatus` olarak düzeltildi.

---

### Düzeltme 3 — `home-banner.mapper.ts` ve `mongo-home-banner.repository.ts` `any` Kaldırıldı

**Dosya:** `home-banner.mapper.ts`
```typescript
// ÖNCE
static toDomain(raw: any): HomeBanner
// SONRA
static toDomain(raw: Record<string, unknown>): HomeBanner
static toPersistence(domain: HomeBanner): Record<string, unknown>
```

**Dosya:** `mongo-home-banner.repository.ts`
```typescript
// ÖNCE
private toDomain(doc: any): HomeBanner
// SONRA
private toDomain(doc: Record<string, unknown>): HomeBanner

// findById, findAll, findAllActive → doc.toObject() as unknown as Record<string, unknown>
```

---

### Düzeltme 4 — `HomeQuadCardItem` Timestamp Eksikliği

**Dosya:** `apps/backend/src/modules/content/domain/entities/home-quad-card-item.entity.ts`

```typescript
// ÖNCE — createdAt/updatedAt yoktu
export interface HomeQuadCardItemProps {
  title: string;
  image: string;
  link?: string;
  productId?: string;
  order: number;
  quadCardId: string;
}

// SONRA — timestamp alanları eklendi
export interface HomeQuadCardItemProps {
  title: string;
  image: string;
  link?: string;
  productId?: string;
  order: number;
  quadCardId: string;
  createdAt: Date;
  updatedAt: Date;
}

public static create(props: Omit<HomeQuadCardItemProps, 'createdAt' | 'updatedAt'>, id?: string): HomeQuadCardItem {
  return new HomeQuadCardItem({ ...props, createdAt: new Date(), updatedAt: new Date() }, id);
}
```

---

## Özet Tablo

| # | Bulgu | Seviye | Dosya | Satır | Durum |
|---|---|---|---|---|---|
| 1 | `SeoMetadata` hatalı `platform` index | **YÜKSEK** | `seoMetadata.schema.ts` | 33 | ✅ Düzeltildi |
| 2 | `SeoMetadata` unique index eksik | **YÜKSEK** | `seoMetadata.schema.ts` | — | ✅ Düzeltildi |
| 3 | 6x `any` mapper tipleri | **YÜKSEK** | `help.mappers.ts`, `home-banner.mapper.ts`, `mongo-home-banner.repository.ts` | — | ✅ Düzeltildi |
| 4 | `HomeQuadCardItem` timestamp eksik | **DÜŞÜK** | `home-quad-card-item.entity.ts` | — | ✅ Düzeltildi |
| 5 | SideAd çift modül kayıt | **KRITIK** | `content.module.ts:116`, `advertising.module.ts:66` | — | Raporlandı |
| 6 | Policy versiyonlama yok (KVKK) | **KRITIK** | `policy.schema.ts` | — | Raporlandı |
| 7 | `siteSettings` endpoint `data: any` | **ORTA** | `settings.controller.ts` | 37 | Raporlandı |
| 8 | SeoMetadata `_platform` kullanılmıyor | **ORTA** | `content-misc.repositories.ts` | 127 | Raporlandı |
| 9 | DynamicContent CQRS eksik | **ORTA** | `content-query.handlers.ts` | — | Raporlandı |

---

## TypeScript Compile Durumu

```
npx tsc --noEmit (backend) → HATA YOK
```

---

## Cascade Etkisi

- `seoMetadata.schema.ts` index değişikliği → MongoDB'de mevcut duplicate path'ler hata verecek (unique index)
- `help.mappers.ts` `ArticleStatus` import → `article-status.enum` dosyasının mevcut olması gerekir

---

## Önceliklendirme (Gelecek İş)

| Seviye | Bulgu | Öneri |
|---|---|---|
| **KRITIK** | SideAd çift modül sahiplik | Advertising → Content import yapmalı |
| **KRITIK** | Policy KVKK versiyon takibi yok | `User.acceptedPolicyVersions` alanı ve interceptor eklenmeli |
| **ORTA** | `siteSettings` endpoint tip güvensiz | `BazarxGoSettingsDto` oluşturulmalı |
| **ORTA** | SeoMetadata `_platform` kullanılmıyor | `findByPath(path, platform)` sorgusu düzeltilmeli |
| **ORTA** | DynamicContent handler eksik | `GetDynamicContentHandler` implementasyonu tamamlanmalı |
| **DÜŞÜK** | Policy versiyon unique constraint | `{ type: 1, isActive: 1 }` unique index eklenmeli |