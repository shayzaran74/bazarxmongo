# BazarX Backend `any` Temizleme Planı
## AI Otomatizasyon Talimatları

> **Proje Durumu (Nisan 2026):**
> Backend Faz 1-6 tamamlandı. `(tx as any)` sıfırlandı, controller seviyesinde Prisma sıfır.
> Bu dosya kalan `any` temizliğini sistematik olarak yapar.
> Her faz sonrası `pnpm --filter @bazarx/backend build` çalıştır.

---

## GERÇEK BASELINE (Nisan 2026)

```bash
# Mevcut durumu ölçmek için:
grep -rn "as any\|: any" apps/backend/src/ --include="*.ts" | grep -v spec | wc -l
grep -rn "as any\|: any" packages/ --include="*.ts" | grep -v spec | wc -l
```

**Bilinen durum:**
```
(tx as any)          → 0  ✅ Faz 4C'de temizlendi
controller Prisma    → 0  ✅ B1-C3'de temizlendi
catch (e: any)       → ~57 tahmini — ölçülmeli
@Body() any          → ~64 tahmini — ölçülmeli
useFactory any       → ~193 tahmini — ölçülmeli
mapper as any        → ~212 tahmini — ölçülmeli
genel : any          → ~327 tahmini — ölçülmeli
test dosyaları       → ~90 tahmini — düşük öncelik
TOPLAM               → ~630 (tamamlanan işler düştüğü için az olabilir)
```

> **NOT:** Baseline rakamları Nisan 2026 öncesi ölçüldü. `pnpm build` geçtiği için
> kritik hatalar yok — bu temizlik tip güvenliği kalitesini artırır, runtime'ı bozmaz.

---

## PROJE DOSYA YAPISI (Gerçek Yollar)

```
apps/
  backend/
    src/modules/
      barter/
      vendor/
      identity/
      catalog/
      commerce/           ← checkout.service.ts, invoice-pdf.service.ts burada
      inventory/
      financial-gateway/  ← wallet.controller.ts, financial-gateway.service.ts burada
      auction/
      loyalty/
      advertising/
      delivery/
    src/common/
packages/
  shared-types/src/       ← @barterborsa/shared-types
  shared-persistence/src/ ← @barterborsa/shared-persistence (PrismaService)
```

---

## GENEL KURALLAR

### ✅ Değiştir
```typescript
// YANLIŞ
catch (err: any) { throw err.message }
@Body() body: any
useFactory: (repo: any, bus: any) => ...
const x = result as any
toDomain(raw: any): Entity
```

### ✅ Doğrusu
```typescript
// DOĞRU
catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  throw new Error(message);
}
@Body() body: CreateOrderDto
useFactory: (repo: IOrderRepository, bus: IEventBus) => ...
const x = result as SpecificType
toDomain(raw: PrismaModel): Entity
```

### ⛔ DOKUNMA — Bunlar kalabilir
```typescript
// Prisma $on event handler — resmi tip yok
this.$on('query', (e: any) => { ... })

// Üçüncü parti kütüphane eksik tip
import('some-lib').then((m: any) => { ... })

// NestJS @Request() req — passport user inject için kabul edilebilir
@Request() req: any  // sadece req.user.id kullanılıyorsa
```

---

## FAZ 1 — catch Blokları 🔴 KRİTİK

### Kural
```typescript
// ÖNCE
} catch (err: any) {
  this.logger.error(err.message);
  throw err;
}

// SONRA
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  this.logger.error(message);
  throw err instanceof Error ? err : new Error(message);
}
```

### Yardımcı Fonksiyon — Oluşturulacak Dosya
`packages/shared-persistence/src/utils/errors.ts`:
```typescript
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
```

Import edilecek yer:
```typescript
import { toMessage, toError } from '@barterborsa/shared-persistence';
```

### Tarama Komutu
```bash
grep -rn "catch.*: any" apps/backend/src/ --include="*.ts" | grep -v spec
```

### Doğrulama
```bash
grep -rn "catch.*: any" apps/backend/src/ --include="*.ts" | grep -v spec | wc -l
# Hedef: 0
```

---

## FAZ 2 — @Body() / @Request() any 🔴 KRİTİK

### AuthenticatedRequest — Oluşturulacak Dosya
`apps/backend/src/common/types/request.types.ts`:
```typescript
export interface AuthenticatedRequest {
  user: {
    id:    string;
    sub?:  string;
    email: string;
    role:  string;
  };
}
```

### Kural
```typescript
// ÖNCE
async create(@Body() body: any) { ... }
async me(@Request() req: any) { const userId = req.user.id }

// SONRA
async create(@Body() body: CreateTradeOfferDto) { ... }

import { AuthenticatedRequest } from '~/common/types/request.types';
async me(@Request() req: AuthenticatedRequest) { const userId = req.user.id }
```

### Tarama Komutu
```bash
grep -rn "@Body().*any\|@Request().*any\|@Param().*any" apps/backend/src/ --include="*.ts" | grep -v spec
```

### Doğrulama
```bash
grep -rn "@Body().*any\|@Request().*any" apps/backend/src/ --include="*.ts" | grep -v spec | wc -l
# Hedef: 0
```

---

## FAZ 3 — useFactory Tipleri 🟡 ORTA

### Kural
```typescript
// ÖNCE
{
  provide:    CreateTradeOfferHandler,
  useFactory: (repo: any, eventBus: any) => new CreateTradeOfferHandler(repo, eventBus),
  inject:     ['ITradeOfferRepository', IEventBus],
}

// SONRA
{
  provide:    CreateTradeOfferHandler,
  useFactory: (repo: ITradeOfferRepository, eventBus: IEventBus) =>
    new CreateTradeOfferHandler(repo, eventBus),
  inject: ['ITradeOfferRepository', IEventBus],
}
```

### Önemli Not
Bu projedeki modüller (barter, vendor, commerce, auction, financial-gateway vb.)
DDD pattern kullanıyor. `inject` token'ları genellikle string (`'ITradeOfferRepository'`)
veya Symbol. Her birinin interface'i ilgili domain dosyasında tanımlı.

### Tarama Komutu
```bash
grep -rn "useFactory" apps/backend/src/ --include="*.ts" | grep ": any" | grep -v spec
```

### Doğrulama
```bash
grep -rn "useFactory" apps/backend/src/ --include="*.ts" | grep ": any" | grep -v spec | wc -l
# Hedef: 0
```

---

## FAZ 4 — Mapper `as any` (En Yüksek Hacim) 🟡 ORTA

### Öncelikli Modüller (bilinen yüksek any yoğunluğu)
```
1. apps/backend/src/modules/barter/infrastructure/    (64 any — en yüksek)
2. apps/backend/src/modules/vendor/infrastructure/    (59 any)
3. apps/backend/src/modules/identity/infrastructure/  (31 any)
4. apps/backend/src/modules/catalog/infrastructure/   (25 any)
5. apps/backend/src/modules/commerce/infrastructure/  (18 any)
6. apps/backend/src/modules/inventory/infrastructure/ (7 any)
7. apps/backend/src/modules/financial-gateway/        (7 any)
```

### Kural — Enum cast
```typescript
// ÖNCE
status: row.status as any
// SONRA
import { TradeOfferStatus } from '../../domain/enums/trade-offer-status.enum';
status: row.status as TradeOfferStatus
```

### Kural — JSON alan
```typescript
// ÖNCE
const items = row.offeredItems as any
// SONRA
interface TradeOfferItem { listingId: string; quantity: number; estimatedValue: number; }
const items = row.offeredItems as unknown as TradeOfferItem[]
```

### Kural — Prisma include ilişki
```typescript
// ÖNCE
const vendor = row.vendor as any
// SONRA — Prisma.XGetPayload kullan
import { Prisma } from '@prisma/client';
type VendorWithProfile = Prisma.VendorGetPayload<{ include: { profile: true } }>
```

### Kural — BaseMapper generic
```typescript
// ÖNCE
export abstract class BaseMapper {
  abstract toDomain(raw: any): any;
  abstract toPersistence(entity: any): any;
}

// SONRA
export abstract class BaseMapper<TDomain, TPrisma> {
  abstract toDomain(raw: TPrisma): TDomain;
  abstract toPersistence(entity: TDomain): TPrisma;
}
```

### Kural — Result pattern (projeye özgü)
```typescript
// ÖNCE — Result.value erişiminde yaygın
const email = (emailResult as any).value;

// SONRA — discriminated union kontrol
const emailResult = Email.create(dto.email);
if (!emailResult.ok) return Err(emailResult.error);
const email = emailResult.value; // tip güvenli
```

> **Not:** Projedeki Result tipi `{ ok: true; value: T } | { ok: false; error: E }` şeklinde.
> `(result as any).value` görüldüğünde önce `ok` kontrolü ekle.

### Domain Types Klasörleri — Oluşturulacak
```
apps/backend/src/modules/barter/domain/types/
  technical-specs.interface.ts
  trade-modes.interface.ts
  wanted-categories.interface.ts
  shipment-info.interface.ts

apps/backend/src/modules/commerce/domain/types/
  variant-info.interface.ts
  order-metadata.interface.ts

apps/backend/src/modules/catalog/domain/types/
  product-specs.interface.ts
  variant-options.interface.ts
  attribute-template.interface.ts
```

### Tarama Komutu
```bash
grep -rn "as any\|: any" apps/backend/src/modules/barter/ --include="*.ts" | grep -v spec
grep -rn "as any\|: any" apps/backend/src/modules/vendor/ --include="*.ts" | grep -v spec
```

---

## FAZ 5 — Genel `: any` Temizliği 🟡 ORTA

### Kural
```typescript
// ÖNCE
async processJob(data: any): Promise<any> { ... }
const result = await this.query<any>(sql)
const config: Record<string, any> = {}

// SONRA
async processJob(data: BulkIndexJobData): Promise<void> { ... }
const result = await this.query<XpTransactionRow>(sql)
const config: Record<string, string | number | boolean> = {}
```

### Tarama Komutu
```bash
grep -rn ": any" apps/backend/src/ --include="*.ts" | grep -v "spec\|catch\|\$on"
```

---

## FAZ 6 — Event Subscriber Generic'ler 🟡 ORTA

### Kural
```typescript
// ÖNCE
this.eventBus.subscribe('StockUpdatedEvent', (event: any) => { ... })

// SONRA
import { StockUpdatedEvent } from '../domain/events/stock-updated.event';
this.eventBus.subscribe<StockUpdatedEvent>('StockUpdatedEvent', (event) => { ... })
```

### Tarama Komutu
```bash
grep -rn "subscribe.*any\|publish.*any" apps/backend/src/ --include="*.ts" | grep -v spec
```

---

## FAZ 7 — Test Dosyaları 🟢 DÜŞÜK

### Kural
```typescript
// ÖNCE
const mockRepo: any = { findById: jest.fn() }
expect((result as any).value.id).toBe('123')

// SONRA
const mockRepo = {
  findById: jest.fn(),
  save: jest.fn(),
} satisfies Partial<IOrderRepository>

expect(result.ok).toBe(true);
if (result.ok) expect(result.value.id).toBe('123');
```

### Tarama Komutu
```bash
grep -rc "\bany\b" apps/backend/src/ --include="*.spec.ts" | sort -t: -k2 -rn | head -20
```

---

## DOĞRULAMA SCRIPTI

```bash
#!/bin/bash
echo "=== ANY SAYACI ==="
echo "catch any   : $(grep -rn "catch.*: any" apps/backend/src/ --include="*.ts" | grep -v spec | wc -l)"
echo "body any    : $(grep -rn "@Body().*any\|@Request().*any" apps/backend/src/ --include="*.ts" | grep -v spec | wc -l)"
echo "as any      : $(grep -rn "as any" apps/backend/src/ --include="*.ts" | grep -v "spec\|\\\$on" | wc -l)"
echo "useFactory  : $(grep -rn "useFactory" apps/backend/src/ --include="*.ts" | grep ": any" | wc -l)"
echo "genel any   : $(grep -rn ": any" apps/backend/src/ --include="*.ts" | grep -v "spec\|catch\|\\\$on" | wc -l)"
echo ""
echo "=== BUILD KONTROL ==="
pnpm --filter @bazarx/backend build && echo "✅ BUILD OK" || echo "❌ BUILD HATA"
```

---

## HEDEF SAYILAR

| Kategori | Başlangıç | Hedef |
|----------|-----------|-------|
| `(tx as any)` | 0 | 0 ✅ (Faz 4C'de temizlendi) |
| controller Prisma | 0 | 0 ✅ (B1-C3'de temizlendi) |
| catch any | ~57 | 0 |
| body any | ~64 | 0 |
| useFactory any | ~193 | 0 |
| as any (mapper) | ~212 | < 10 |
| genel : any | ~327 | < 20 |
| **TOPLAM** | **~630** | **< 30** |

---

## KAÇINILMAZ `any` — BELGELEME ŞABLONU

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// REASON: Prisma $on('query') event has no public TypeScript type definition
this.$on('query', (e: any) => { ... })
```

---

## FAZ SONRASI CHECKLIST

Her faz bittikten sonra:
- [ ] `pnpm --filter @bazarx/backend build` → sıfır hata
- [ ] `pnpm --filter @bazarx/backend test` → testler geçiyor
- [ ] `grep` sayacı düştü mü kontrol et
- [ ] Uygulama bootstrap ediliyor mu (`pnpm --filter @bazarx/backend dev`)

---

*Güncelleme: Nisan 2026 — BazarX Faz 6 sonrası*
*Tamamlanan: (tx as any) = 0, controller Prisma = 0*
*Baseline: ~630 any · Hedef: < 30 (belgelenmiş)*
