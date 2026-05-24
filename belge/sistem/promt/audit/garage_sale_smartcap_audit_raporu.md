# Garage Sale & SmartCap (Watchover) — Derinlemesine Audit Raporu

**Tarih:** 2026-05-24
**Auditor:** Claude Code (Garage Sale & SmartCap Audit Prompt v1)
**Proje yolu:** `apps/backend/src/modules/vendor/`

---

## Yönetici Özeti

| Seviye | Bulgu |
|--------|-------|
| KRİTİK | 2 |
| YÜKSEK | 2 |
| ORTA | 4 |
| DÜŞÜK | 3 |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] — Dealer Kota Kontrolü Race Condition — KRİTİK

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts:181-204`
**Tespit:** Dealer kota kontrolü (maxQtyPerDealer) oku/yaz race condition ile yapılıyor. İki adımlı işlem:

```typescript
// Satır 181-192 — OKUMA (aggregate)
const dealerQtyResult = await this.connection
  .model<{ dealerId: string; totalQty: number }>('EcosystemOrder')
  .aggregate([...], { session });

const totalDealerQty = dealerQtyResult[0]?.totalQty ?? 0;

// Satır 196-204 — KONTROL
if (totalDealerQty + requestedQty > garageSale.maxQtyPerDealer) {
  throw new ForbiddenException({ code: 'GARAGE_SALE_DEALER_QUOTA_EXCEEDED' });
}

// Satır 207-217 — ATOMIC GÜNCELLEME (ayrı işlem)
const updated = await this.garageSaleModel.findOneAndUpdate({...}, { $inc: { soldQty: requestedQty } }, { new: true, session });
```

İki eş zamanlı sipariş:
- İkisi de aynı anda `totalDealerQty = 3` okur
- İkisi de `3+2 <= maxQtyPerDealer(5)` kontrolünden geçer
- İkisi de `soldQty` günceller ama `EcosystemOrder` ayrı yazılır
- Dealer kota aşılır.

**Risk:** KRITIK — İki eş zamanlı sipariş aynı bayi için kota kontrolünden ikisi de geçer.

**Düzeltme:** Dealer kota kontrolü atomic olmalı — aggregate + kontrol tek `findOneAndUpdate` içinde yapılmalı veya aggregate + yazma transaction içinde olmalı. EcosystemOrder yazma işlemi bu method içinde değil, çağıranda yapılıyor — o da atomic olmalı.

---

### [1.2] — `campaignPrice` Placeholder — KRİTIK

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts:86, 92-100`
**Tespit:** `originalPrice` ve `campaignPrice` her zaman `0`:

```typescript
// Satır 86 — placeholder:
const originalPrice = dto.discountRate; // placeholder — gerçek uygulamada listing.price

// Satır 92-100:
const campaignPriceValue = 0; // TODO: gerçek hesaplama için originalPrice gerekir
originalPrice: Decimal128.fromString('0'),
campaignPrice: Decimal128.fromString('0'),
```

Kampanya oluşturulurken doğru fiyat hesaplanmıyor. Sipariş sonrası `campaignPrice = 0` ile sipariş oluşuyor — bayi parasız ürün alabilir.

**Risk:** KRITIK — Fiyat 0 TL olarak kaydediliyor. Kampanya fiyatı doğru hesaplanmıyor.

**Düzeltme:**
```typescript
const listing = await this.vendorRepo.findById(factoryUserId);
const originalPrice = parseFloat(listing.getProps().price.toString());
const campaignPrice = originalPrice * (1 - dto.discountRate / 100);
campaignPrice: Decimal128.fromString(campaignPrice.toFixed(2)),
originalPrice: Decimal128.fromString(originalPrice.toFixed(2)),
```

---

### [1.3] — `listingId` Yanlış Alan Adı — YÜKSEK

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts:166`
**Tespit:** `garageSale.listingId.toString()` kullanılıyor — ancak GarageSale schema'da `listingId` yerine `productId` olabilir. Schema `productId` kullanıyor:

```typescript
// Satır 166:
const dealerOrders = await this.orderRepo.sumQuantityByDealerAndProduct(
  dealerId,
  garageSale.listingId.toString(), // ← listingId mi productId mi?
  ['PENDING', 'CONFIRMED'],
  session,
);
```

`dealerQtyResult` aggregate'inde `productId` kullanılıyor (satır 187) ama burada `listingId` geçiyor — yanlış alan adı.

**Risk:** YÜKSEK — `undefined.toString()` hatası veya yanlış veri sorgulanması.

---

### [1.4] — Scheduler Multi-Instance Kilit Yok — YÜKSEK

**Dosya:** `apps/backend/src/modules/vendor/application/schedulers/garage-sale.scheduler.ts`
**Tespit:** `@Cron('*/5 * * * *')` ile her 5 dakikada çalışıyor ama Redis distributed lock **yok**. Auction ve Lottery scheduler'larında lock varken GarageSale scheduler'ında yok.

```typescript
@Cron('*/5 * * * *')
async activateScheduledSales(): Promise<void> {
  // Redis lock YOK — tüm instance'lar aynı anda çalışır
  await this.garageSaleService.activateScheduledSales();
}
```

İki backend instance aynı kampanyayı aynı anda ACTIVE yapabilir.

**Risk:** YÜKSEK — Multi-instance üretim ortamında çift tetikleme.

**Düzeltme:** AuctionCloseScheduler'daki gibi Redis lock ekle:
```typescript
const locked = await this.redisService.get('scheduler:garage-sale:lock');
if (locked === '1') return;
await this.redisService.set('scheduler:garage-sale:lock', '1', 55);
```

---

### [1.5] — SmartCap `totalStock` Harici Kaynak — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/watchover.service.ts:64-90`
**Tespit:** SmartCap kontrolü `totalStock` parametresi olarak alıyor:

```typescript
async checkSmartCap(
  productId: string,
  requestedQty: number,
  totalStock: number, // ← dışarıdan geliyor
  session: ClientSession,
): Promise<void> {
  const smartCapLimit = Math.floor(totalStock * 0.25);
```

`totalStock` nereden geliyor? Garaj Günü için `GarageSale.maxTotalQty - soldQty` mu, yoksa `EcosystemProduct.stock` mu? Çağırana bağlı — kodda tutarsızlık riski.

**Risk:** ORTA — SmartCap hesabı yanlış stok kaynağıyla yapılabilir.

---

### [1.6] — Dealer Kota Aggregate Race Window — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts:181-204`
**Tespit:** Aynı [1.1] ile ilgili — aggregate sonucu ile yazma arasında race window. İki eş zamanlı istek için aggregate aynı sonucu döndürür.

**Risk:** ORTA — İkinci isteğin aggregate sonucu birincinin EcosystemOrder yazmasını görmez.

---

### [1.7] — EcosystemOrder Index Eksikliği — ORTA

**Dosya:** `apps/backend/src/modules/vendor/infrastructure/persistence/schemas/ecosystemOrder.schema.ts`
**Tespit:** Mevcut index: `{ dealerId: 1, productId: 1 }`

Watchover aggregate için gerekli sorgu: `{ dealerId, productId, status: { $in: ['PENDING', 'CONFIRMED'] } }` — mevcut index `status`'u kapsamıyor.

GarageSale dealer kota için: `{ garageSaleId, dealerId, status }` — bu üç alan için index yok.

**Risk:** ORTA — Aggregate sorguları full collection scan yapabilir.

---

### [1.8] — `updateMany` Status Değişikliği Race — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts:220-224`
**Tespit:** `findOneAndUpdate` null döndüğünde EXHAUSTED status güncellemesi ayrı `updateOne` ile yapılıyor — race condition:

```typescript
if (!updated) {
  // Satır 220-224 — AYRI updateOne
  await this.garageSaleModel.updateOne(
    { _id: new Types.ObjectId(garageSaleId) },
    { $set: { status: 'EXHAUSTED' } },
  );
```

Aynı anda birden fazla istek null dönerse tümü EXHAUSTED yapmaya çalışır. Atomic değil.

**Risk:** ORTA — Çoklu istek aynı anda EXHAUSTED yapmaya çalışır.

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] — Mongo Repository `any` — ORTA

**Dosya:** `apps/backend/src/modules/vendor/infrastructure/persistence/repositories/mongo-ecosystem-order.repository.ts`
**Tespit:** Tip güvenliği sağlamış — `sumQuantityByDealerAndProduct` dönüşü `number` ✅ (satır 69: `result[0]?.totalQty ?? 0`)

Ancak `findByEcosystemId` ve `findByDealerId` dönüşleri tipli değil, `any` cast yok ama explicit tipler yok.

**Risk:** ORTA — Dönüş tipleri açıkça yazılmış ama validation yok.

---

### [2.2] — GarageSale Schema Alan Adı Tutarsızlığı — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts:166` vs `garage-sale.service.ts:97`
**Tespit:** GarageSale oluştururken `productId` kullanılıyor (satır 97) ama sipariş işlenirken `listingId` okunmaya çalışılıyor (satır 166). Schema'da hangisi olduğu tutarsız.

**Risk:** ORTA — Yanlış alan adı ile veri kaybı veya hata.

---

## BÖLÜM 3 — İş Kuralı Akışı

### [3.1] — Watchover Kota ve SmartCap Sıralaması — Doğru ✅

**Dosya:** `apps/backend/src/modules/vendor/application/services/watchover.service.ts`
**Tespit:** İki ayrı kontrol var — `checkDealerQuota` ve `checkSmartCap`. Hangisi önce çağrılacağı çağırana bağlı. İkisi de ayrı method olarak var ✅

---

### [3.2] — GarageSaleService `processGarageSaleOrder` Akışı — Kısmen Doğru

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts:133-241`
**Tespit:** Akış sırası doğru: status → zaman → dealer kota → atomic soldQty. Atomic `findOneAndUpdate` + `$expr` + `$inc` kullanılıyor ✅

Ancak dealer kota kontrolü (satır 181-204) aggregate + kontrol ayrı, atomic değil.

---

### [3.3] — `campaignPrice` Placeholder — KRITIK

Bkz. [1.2] — sipariş fiyatı her zaman 0.

---

### [3.4] — Scheduler Multi-Instance Kilit Eksik — YÜKSEK

Bkz. [1.4] — Redis lock yok.

---

### [3.5] — GarageSale Scheduler `@Cron` — Doğru ✅

**Dosya:** `apps/backend/src/modules/vendor/application/schedulers/garage-sale.scheduler.ts:22-41`
**Tespit:** `@Cron('*/5 * * * *')` ile her 5 dakikada çalışıyor. `setInterval` değil ✅

---

### [3.6] — Audit Log Tüm Kritik Eylemlerde — Doğru ✅

**Dosya:** `apps/backend/src/modules/vendor/application/services/garage-sale.service.ts`
**Tespit:** GarageSale oluşturma, EXHAUSTED, ACTIVATED, ENDED, CANCELLED tümü için `auditLogRepo.create()` çağrılıyor ✅

---

## BÖLÜM 4 — Gereksiz Kod & Temizleme

### [4.1] — Sprint 2 Implementasyon Durumu

| Görev | Dosya | Durum |
|-------|-------|-------|
| GarageSaleService | garage-sale.service.ts | ✅ Implementasyon var — placeholderlar mevcut |
| WatchoverService | watchover.service.ts | ✅ Implementasyon var |
| GarageSaleScheduler | garage-sale.scheduler.ts | ✅ Implementasyon var — lock yok |
| DealerController GarageSale endpoint | dealer.controller.ts | ✅ Endpoint'ler var |
| EcosystemOrder schema | ecosystemOrder.schema.ts | ✅ Schema mevcut |

---

### [4.2] — campaignPrice Hesabı Tek Yerde — Hayır

**Tespit:** `campaignPrice` hesabı `GarageSaleService.createGarageSale()` içinde placeholder olarak var (satır 92). Başka yerde hesaplanmıyor — doğru, ama placeholder.

---

### [4.3] — Watchover Kota Decimal — Doğru ✅

**Dosya:** `apps/backend/src/modules/vendor/application/services/watchover.service.ts:70`
**Tespit:** `Math.floor(totalStock * 0.25)` — number hesabı yapılıyor. `totalStock` parametresi number olduğu için uygun.

---

## Öncelikli Düzeltme Planı

### Bu Sprint (KRİTİK) — 1 DÜZELTİLDİ, 1 KALAN

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 1 | `garage-sale.service.ts` | `campaignPrice` — Listing.price'dan gerçek hesaplama + BadRequestException | ✅ |
| 2 | `garage-sale.service.ts:181-204` | Dealer kota kontrolü atomic yap | ⬜ Backlog |

### Sonraki Sprint (YÜKSEK) — 1 DÜZELTİLDİ, 1 KALAN

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 3 | `garage-sale.service.ts:166` | `listingId` → `productId` düzelt | ⬜ Backlog |
| 4 | `garage-sale.scheduler.ts` | Redis distributed lock eklendi (activate + close ayrı lock) | ✅ |

### Backlog (ORTA) — 2 DÜZELTİLDİ, 2 KALAN

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 5 | `ecosystemOrder.schema.ts` | Compound index: `{ garageSaleId: 1, dealerId: 1, status: 1 }` | ✅ |
| 6 | `ecosystemOrder.schema.ts` | Compound index: `{ dealerId: 1, productId: 1, status: 1 }` | ✅ |
| 7 | `garage-sale.service.ts:220-224` | EXHAUSTED atomic güncellemesi | ⬜ Backlog |
| 8 | `watchover.service.ts` | SmartCap `totalStock` kaynağı belgeleme | ⬜ Backlog |

### Belgeleme (DÜŞÜK) — KALAN

| # | Dosya | Not |
|---|-------|-----|
| 9 | `garage-sale.service.ts` | `listingId` vs `productId` alan adı tutarsızlığı |
| 10 | SmartCap | Stok kaynağı belgelenmeli |

---

## Sonuç — GÜNCELLEME (2026-05-24)

| Seviye | Başlangıç | Düzeltildi | Kalan |
|--------|-----------|------------|-------|
| KRİTİK | 2 | 1 | 1 (dealer kota race) |
| YÜKSEK | 2 | 1 | 1 (listingId/productId) |
| ORTA | 4 | 2 | 2 (backlog) |
| DÜŞÜK | 3 | 0 | 3 (backlog) |

**Kapanan sorunlar:**
1. ✅ `campaignPrice` placeholder → Listing fiyatından gerçek indirimli fiyat hesaplanıyor
2. ✅ GarageSale scheduler → Redis distributed lock (activate + close ayrı key)
3. ✅ EcosystemOrder compound index'ler eklendi (dealer kota + watchover sorguları)

**İyi bulgular:**
- Atomic `findOneAndUpdate` + `$expr` + `$inc` ✅
- Redis lock artık GarageSale scheduler'da da var ✅
- Audit log tüm kritik eylemlerde ✅
- SmartCap iki ayrı kontrol olarak ayrı method'larda ✅

**Görülmeye değer:** `garage-sale.service.ts:166`'da `listingId` kullanılıyor ama schema'da `productId` olabilir. Schema ile handler arasında alan adı tutarsızlığı var.