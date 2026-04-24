# Gemini Prompt — TEKNİK BORÇ TEMİZLİĞİ: any Tiplerini Düzeltme

> **Proje Durumu (Nisan 2026):**
> Backend Faz 1-6 tamamlandı. `pnpm --filter @bazarx/backend build` sıfır hata.
> `(tx as any)` ve controller seviyesi Prisma temizlendi. Bu prompt kalan any'leri temizler.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior TypeScript developer'sın. BazarX/BarterBorsa backend projesindeki tip güvenliği sorunlarını düzeltiyorsun.

PROJE HAKKINDA:
- NestJS 10+ / TypeScript strict mode
- DDD: Entity, AggregateRoot, ValueObject pattern
- CQRS: Command/Query handlers (CommandBus + QueryBus her controller'da)
- Prisma ORM — @barterborsa/shared-persistence paketi üzerinden
- Monorepo: pnpm workspaces
- Build komutu: pnpm --filter @bazarx/backend build

TAMAMLANAN TEMİZLİKLER (bunlara dokunma):
- (tx as any) → sıfır, Prisma.TransactionClient kullanılıyor
- Controller'larda PrismaService inject → sıfır
- checkout.service.ts tip-safe Prisma transaction

GÖREV:
Kodlardaki KALAN `any` kullanımlarını doğru tiplerle değiştir.

KURALLAR:
1. `any` kullanmak YASAK — her birini doğru tiple değiştir
2. `unknown` sadece gerçekten tipi bilinmeyen dış veri için (API response, JSON parse)
3. `as unknown as X` pattern'i YASAK — doğru tip dönüşümü yap
4. Prisma model tipleri için `@prisma/client`'tan import et
5. JSON alanlar için spesifik interface tanımla
6. Result pattern: `(result as any).value` yerine `if (result.ok) result.value` kullan
7. HER DEĞİŞTİRDİĞİN DOSYANIN tam path'ini ve SADECE değişen satırları yaz
8. `pnpm --filter @bazarx/backend build` sonrası sıfır hata olmalı
9. `@ts-ignore` veya `@ts-nocheck` EKLEME
10. Prisma `$on('query', (e: any) => ...)` → DOKUNMA (resmi tip yok)
```

---

### GÖREV 1: BARTER MODÜLÜ (en yüksek öncelik — ~64 any)

```
Barter modülünde yaklaşık 64 tip güvenliği ihlali var.

Aşağıdaki grep çıktısını analiz et ve HER BİRİNİ düzelt:
```

Terminalde çalıştır, çıktıyı yapıştır:
```bash
grep -rn "as any\|: any" apps/backend/src/modules/barter/ --include="*.ts" | grep -v spec
```

**Bu modülde beklenen yaygın any sorunları:**

1. **MAPPER'LARDA:**
```typescript
// YANLIŞ
toDomain(raw: any): SurplusItem { ... }
// DOĞRU
import { surplus_item } from '@prisma/client';
toDomain(raw: surplus_item): SurplusItem { ... }
```

2. **RESULT PATTERN:**
```typescript
// YANLIŞ
const val = (emailResult as any).value;
// DOĞRU — Result discriminated union
if (!emailResult.ok) return Err(emailResult.error);
const val = emailResult.value;
```

3. **JSON ALANLAR:**
```typescript
// YANLIŞ
technicalSpecs: any;
// DOĞRU — interface tanımla
interface TechnicalSpecs {
  weight?: number;
  dimensions?: { width: number; height: number; depth: number };
  [key: string]: unknown;
}
technicalSpecs: TechnicalSpecs | null;
```

4. **REPOSITORY FILTER:**
```typescript
// YANLIŞ
async findMany(filter: any): Promise<TradeOffer[]>
// DOĞRU
import { Prisma } from '@prisma/client';
async findMany(filter: Prisma.trade_offerWhereInput): Promise<TradeOffer[]>
```

Çıktı formatı:
```
DOSYA: apps/backend/src/modules/barter/[path]
SATIR [n]:
  ESKİ: [any içeren satır]
  YENİ: [düzeltilmiş satır]
  NEDEN: [kısa açıklama]
```

---

### GÖREV 2: VENDOR MODÜLÜ (~59 any)

Terminalde çalıştır:
```bash
grep -rn "as any\|: any" apps/backend/src/modules/vendor/ --include="*.ts" | grep -v spec
```

Çıktıyı yapıştır, "Bu modülü de düzelt" de.

---

### GÖREV 3: IDENTITY MODÜLÜ (~31 any)

```bash
grep -rn "as any\|: any" apps/backend/src/modules/identity/ --include="*.ts" | grep -v spec
```

---

### GÖREV 4: KALAN MODÜLLER

```bash
# Catalog (~25)
grep -rn "as any\|: any" apps/backend/src/modules/catalog/ --include="*.ts" | grep -v spec

# Commerce (~18) — checkout.service.ts'de (tx as any) zaten temizlendi, skip
grep -rn "as any\|: any" apps/backend/src/modules/commerce/ --include="*.ts" | grep -v spec

# Inventory (~7)
grep -rn "as any\|: any" apps/backend/src/modules/inventory/ --include="*.ts" | grep -v spec

# Financial Gateway (~7) — wallet.controller.ts zaten CQRS, az any kalmalı
grep -rn "as any\|: any" apps/backend/src/modules/financial-gateway/ --include="*.ts" | grep -v spec

# Auction modülü (faz 6 sonrası temizlenmemiş olabilir)
grep -rn "as any\|: any" apps/backend/src/modules/auction/ --include="*.ts" | grep -v spec
```

---

### GÖREV 5: catch BLOKLARI (~57 adet)

```bash
grep -rn "catch.*: any" apps/backend/src/ --include="*.ts" | grep -v spec
```

**Kural:**
```typescript
// ÖNCE
} catch (err: any) {
  this.logger.error(err.message);
}

// SONRA
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  this.logger.error(message);
}
```

---

### GÖREV 6: useFactory TİPLERİ (~193 adet)

```bash
grep -rn "useFactory" apps/backend/src/ --include="*.ts" | grep ": any" | grep -v spec
```

**Kural:**
```typescript
// ÖNCE
useFactory: (repo: any, bus: any) => new CreateTradeOfferHandler(repo, bus),
inject: ['ITradeOfferRepository', IEventBus],

// SONRA
useFactory: (repo: ITradeOfferRepository, bus: IEventBus) =>
  new CreateTradeOfferHandler(repo, bus),
inject: ['ITradeOfferRepository', IEventBus],
```

---

### GÖREV 7: @Body() / @Request() any (~64 adet)

```bash
grep -rn "@Body().*any\|@Request().*any\|@Param().*any" apps/backend/src/ --include="*.ts" | grep -v spec
```

**`AuthenticatedRequest` interface — şu dosyaya ekle:**
`apps/backend/src/common/types/request.types.ts`
```typescript
export interface AuthenticatedRequest {
  user: { id: string; sub?: string; email: string; role: string };
}
```

---

### GÖREV 8: SHARED PAKETLER

```bash
grep -rn "as any\|: any" packages/ --include="*.ts" | grep -v spec
```

---

## GENEL İYİLEŞTİRMELER

### 1. BaseMapper generic'leştir
```typescript
// apps/backend/src/common/mappers/base.mapper.ts
export abstract class BaseMapper<TDomain, TPrisma> {
  abstract toDomain(raw: TPrisma): TDomain;
  abstract toPersistence(entity: TDomain): TPrisma;
}
```

### 2. Domain types klasörleri oluştur
```
apps/backend/src/modules/barter/domain/types/
  technical-specs.interface.ts
  shipment-info.interface.ts

apps/backend/src/modules/commerce/domain/types/
  variant-info.interface.ts
  order-metadata.interface.ts

apps/backend/src/modules/catalog/domain/types/
  product-specs.interface.ts
  variant-options.interface.ts
```

### 3. toError/toMessage yardımcı fonksiyonlar
`packages/shared-persistence/src/utils/errors.ts`:
```typescript
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}
export function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
```

---

## KONTROL

Tüm düzeltmeler sonrası:
```bash
echo "=== KALAN ANY ==="
grep -rn "as any\|: any" apps/backend/src/ --include="*.ts" | grep -v "spec\|\$on" | wc -l
grep -rn "as any\|: any" packages/ --include="*.ts" | grep -v spec | wc -l

echo "=== TS-IGNORE CHECK ==="
grep -rn "@ts-ignore\|@ts-nocheck" apps/backend/src/ --include="*.ts" | wc -l

echo "=== BUILD ==="
pnpm --filter @bazarx/backend build && echo "✅ OK" || echo "❌ HATA"
```

Hedef: toplam < 30 (yalnızca belgelenmiş kaçınılmaz `any`)

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

### Adım Adım İlerle

**ADIM 1:** System prompt'u + Görev açıklamasını yapıştır.

**ADIM 2:** Terminalde çalıştır, çıktıyı yapıştır:
```bash
grep -rn "as any\|: any" apps/backend/src/modules/barter/ --include="*.ts" | grep -v spec
```

**ADIM 3:** Her modülü bitirdikten sonra build al:
```bash
pnpm --filter @bazarx/backend build
```
Hata varsa Gemini'ye yapıştır.

**ADIM 4:** Modül sırası:
```
barter → vendor → identity → catalog → commerce → inventory → financial-gateway → auction
```

**ADIM 5:** Sonra catch blokları, useFactory, @Body/@Request.

**ADIM 6:** Tamamlandığında doğrulama:
```bash
grep -rn "as any\|: any" apps/backend/src/ --include="*.ts" | grep -v "spec\|\$on" | wc -l
# 30'un altında olmalı
pnpm --filter @bazarx/backend build
```

### Dikkat: Tamamlanan Bölümlere Dokunma
- `commerce/application/services/checkout.service.ts` — `(tx as any)` zaten temizlendi
- `financial-gateway/wallet.controller.ts` — CQRS pattern tamamlandı
- `vendor/presentation/vendor.controller.ts` — CQRS pattern tamamlandı
- Tüm controller'lar — `PrismaService` inject sıfır

### HEDEF: ~630 any → < 30 (belgelenmiş, kaçınılmaz)
