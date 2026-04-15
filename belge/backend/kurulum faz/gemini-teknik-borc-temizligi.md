# Gemini Prompt — TEKNİK BORÇ TEMİZLİĞİ: any Tiplerini Düzeltme

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior TypeScript developer'sın. BarterBorsa backend projesindeki tip güvenliği sorunlarını düzeltiyorsun.

PROJE HAKKINDA:
- NestJS 10+ / Fastify / TypeScript strict mode
- DDD: Entity, AggregateRoot, ValueObject pattern
- CQRS: Command/Query handlers
- Prisma ORM

GÖREV:
Kodlardaki TÜM `any` kullanımlarını doğru tiplerle değiştir. Her `as any` ve `: any` ifadesini kaldırıp
gerçek tipi kullan. Eğer tip belirsizse, uygun bir interface veya generic tanımla.

KURALLAR:
1. `any` kullanmak YASAK — her birini doğru tiple değiştir
2. `unknown` sadece gerçekten tipi bilinmeyen dış veri için kullanılabilir (API response, JSON parse)
3. `as unknown as X` pattern'i YASAK — doğru tip dönüşümü yap
4. Generic tipler kullan: `Record<string, unknown>` yerine spesifik interface tanımla
5. Prisma model tipleri için `@prisma/client`'tan import et (örn: `Prisma.UserCreateInput`)
6. Domain event'ler için doğru event sınıfını kullan (`as any` yerine)
7. JSON alanları için spesifik interface tanımla (metadata, payload, specs, variantOptions vs.)
8. HER DEĞİŞTİRDİĞİN DOSYANIN tam path'ini ve SADECE değişen satırları yaz
9. Yeni interface/type tanımı gerekiyorsa nereye ekleneceğini belirt
10. `pnpm build` sonrası sıfır hata olmalı
```

### GÖREV 1: BARTER MODÜLÜ (64 any — en yüksek öncelik)

```
Barter modülünde 25 adet `as any` ve 39 adet `: any` var. Toplamda 64 tip güvenliği ihlali.

Aşağıdaki komutun çıktısını incele ve HER BİRİNİ düzelt:

Önce şu komutu bana ÇALIŞTIRMAMI isteme — ben sana dosyaları vereceğim.
Ama şu pattern'leri bilmelisin:

BARTER modülünde beklenen yaygın `any` sorunları:

1. MAPPER'LARDA: `toDomain(prismaModel: any)` ve `toPersistence(entity: any)`
   DÜZELTME: Prisma model tipini kullan
   ```typescript
   // YANLIŞ
   toDomain(raw: any): SurplusItem { ... }
   // DOĞRU
   import { SurplusItem as PrismaSurplusItem } from '@prisma/client';
   toDomain(raw: PrismaSurplusItem): SurplusItem { ... }
   ```

2. HANDLER'LARDA: `event as any` veya `result: any`
   DÜZELTME: Doğru event/result tipini kullan
   ```typescript
   // YANLIŞ
   await this.eventPublisher.publishTradeOfferAccepted(event as any);
   // DOĞRU
   await this.eventPublisher.publishTradeOfferAccepted(event as TradeOfferAcceptedEvent);
   ```

3. REPOSITORY'LERDE: `where: any` veya `data: any`
   DÜZELTME: Prisma.XWhereInput kullan
   ```typescript
   // YANLIŞ
   async findMany(filter: any): Promise<TradeOffer[]> { ... }
   // DOĞRU
   async findMany(filter: Prisma.TradeOfferWhereInput): Promise<TradeOffer[]> { ... }
   ```

4. JSON ALANLARDA: `metadata: any`, `payload: any`, `specs: any`
   DÜZELTME: Spesifik interface tanımla
   ```typescript
   // YANLIŞ
   technicalSpecs: any;
   // DOĞRU
   interface TechnicalSpecs {
     weight?: number;
     dimensions?: { width: number; height: number; depth: number };
     material?: string;
     [key: string]: unknown;
   }
   technicalSpecs: TechnicalSpecs | null;
   ```

5. VALUE OBJECT create() DÖNÜŞÜNDE: `(result as any).value`
   DÜZELTME: Result type guard kullan
   ```typescript
   // YANLIŞ
   const emailResult = Email.create(dto.email);
   const email = (emailResult as any).value;
   // DOĞRU
   const emailResult = Email.create(dto.email);
   if (!emailResult.ok) return Err(emailResult.error);
   const email = emailResult.value; // TypeScript artık tipi biliyor
   ```
   NOT: Eğer Result tipi `value` property'si sunmuyorsa, Result tipini güncelle:
   ```typescript
   // shared-core/src/types/result.type.ts
   type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
   ```

Şimdi barter modülündeki TÜM dosyaları tara ve `any` olan her satırı düzelt.
Her dosya için şu formatı kullan:

DOSYA: [tam path]
SATIR [numara]: 
  ESKİ: [any içeren satır]
  YENİ: [düzeltilmiş satır]
  NEDEN: [kısa açıklama]

Eğer yeni bir interface/type tanımı gerekiyorsa:

YENİ DOSYA: [tam path]
İÇERİK: [tam dosya içeriği]
```

Şimdi sana barter modülünün dosyalarını vereceğim. Aşağıdaki komutları çalıştırıp çıktıları yapıştır:

```bash
# Barter modülündeki tüm any'leri satır numarasıyla göster
grep -rn "as any\|: any" apps/backend/src/modules/barter/ --include="*.ts"
```

Bu çıktıyı yapıştır, ben her birini düzelteceğim.

---

### GÖREV 2: VENDOR MODÜLÜ (59 any)

Vendor modülünde 4 adet `as any` ve 55 adet `: any` var. Aynı pattern'leri uygula.

Çıktı için:
```bash
grep -rn "as any\|: any" apps/backend/src/modules/vendor/ --include="*.ts"
```

Bu çıktıyı yapıştır, düzelteceğim.

---

### GÖREV 3: IDENTITY MODÜLÜ (31 any)

Identity modülünde 13 adet `as any` ve 18 adet `: any` var.

Çıktı için:
```bash
grep -rn "as any\|: any" apps/backend/src/modules/identity/ --include="*.ts"
```

Bu çıktıyı yapıştır, düzelteceğim.

---

### GÖREV 4: KALAN MODÜLLER (Catalog 25, Commerce 18, Inventory 7, Financial-GW 7)

```bash
grep -rn "as any\|: any" apps/backend/src/modules/catalog/ --include="*.ts"
grep -rn "as any\|: any" apps/backend/src/modules/commerce/ --include="*.ts"
grep -rn "as any\|: any" apps/backend/src/modules/inventory/ --include="*.ts"
grep -rn "as any\|: any" apps/backend/src/modules/financial-gateway/ --include="*.ts"
```

---

### GÖREV 5: SHARED PAKETLER

```bash
grep -rn "as any\|: any" packages/shared/ --include="*.ts"
```

---

### GENEL TİP İYİLEŞTİRMELERİ

Bu düzeltmeler sırasında şu genel iyileştirmeleri de yap:

1. JSON alanları için interface'ler tanımla ve `apps/backend/src/modules/[modül]/domain/types/` klasörüne koy:
   ```
   // Barter için
   apps/backend/src/modules/barter/domain/types/
   ├── technical-specs.interface.ts
   ├── trade-modes.interface.ts
   ├── wanted-categories.interface.ts
   └── shipment-info.interface.ts
   
   // Commerce için
   apps/backend/src/modules/commerce/domain/types/
   ├── variant-info.interface.ts
   └── order-metadata.interface.ts
   
   // Catalog için
   apps/backend/src/modules/catalog/domain/types/
   ├── product-specs.interface.ts
   ├── variant-options.interface.ts
   └── attribute-template.interface.ts
   ```

2. Result type'ı düzelt (shared-core'da):
   Eğer `(result as any).value` pattern'i yaygınsa, Result tipinin discriminated union olarak
   doğru çalıştığından emin ol:
   ```typescript
   export type Result<T, E = Error> = 
     | { ok: true; value: T }
     | { ok: false; error: E };
   
   export function Ok<T>(value: T): Result<T, never> {
     return { ok: true, value };
   }
   
   export function Err<E>(error: E): Result<never, E> {
     return { ok: false, error };
   }
   
   export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
     return result.ok === true;
   }
   
   export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
     return result.ok === false;
   }
   ```

3. Mapper base class'a generic tip ekle:
   ```typescript
   // YANLIŞ
   export abstract class BaseMapper {
     abstract toDomain(raw: any): any;
     abstract toPersistence(entity: any): any;
   }
   
   // DOĞRU
   export abstract class BaseMapper<TDomain, TPrisma> {
     abstract toDomain(raw: TPrisma): TDomain;
     abstract toPersistence(entity: TDomain): TPrisma;
   }
   ```

### KONTROL

Tüm düzeltmeler sonrası:
1. `grep -rn "as any\|: any" apps/backend/src/ --include="*.ts" | wc -l` → 0 olmalı
2. `grep -rn "as any\|: any" packages/shared/ --include="*.ts" | wc -l` → 0 olmalı
3. `pnpm build` → hatasız derlenmeli
4. Hiçbir `@ts-ignore` veya `@ts-nocheck` EKLENMEMİŞ olmalı

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

BU PROMPT'U DOĞRUDAN YAPIŞTIRAMA. Adım adım ilerle:

ADIM 1: Önce system prompt'u + Görev açıklamasını yapıştır.

ADIM 2: Sonra terminalde şu komutu çalıştır ve çıktıyı Gemini'ye yapıştır:
```bash
grep -rn "as any\|: any" apps/backend/src/modules/barter/ --include="*.ts"
```
"Bu çıktıdaki TÜM any'leri düzelt" de.

ADIM 3: Gemini düzeltmeleri verdikten sonra uygula, sonra:
```bash
grep -rn "as any\|: any" apps/backend/src/modules/vendor/ --include="*.ts"
```
Yapıştır, "Bu modülü de düzelt" de.

ADIM 4: Identity modülü için aynısını yap.

ADIM 5: Kalan modüller (catalog, commerce, inventory, financial-gateway) için aynısını yap.

ADIM 6: Shared paketler için aynısını yap.

ADIM 7: Her adımdan sonra `pnpm build` çalıştır, hata varsa Gemini'ye gönder.

ADIM 8: Tamamlandığında doğrulama:
```bash
echo "=== KALAN ANY ==="
grep -rn "as any\|: any" apps/backend/src/ --include="*.ts" | wc -l
grep -rn "as any\|: any" packages/shared/ --include="*.ts" | wc -l
echo "=== TS-IGNORE CHECK ==="
grep -rn "@ts-ignore\|@ts-nocheck" apps/backend/src/ --include="*.ts" | wc -l
```
Hepsi 0 olmalı.

HEDEF: 211 any → 0 any

Temizlik tamamlandıktan sonra Claude'a bildir, Faz 6 (Delivery Service) prompt'unu hazırlayacak.
