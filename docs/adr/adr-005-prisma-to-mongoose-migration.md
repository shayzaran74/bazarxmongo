# ADR-005: Prisma (PostgreSQL) → Mongoose (MongoDB) Tam Göç Planı

- **Durum:** IN PROGRESS — Faz 0 + Faz 0.5 + Faz 1 + Codegen + Faz 2a ✅ + Faz 2b ✅ + Faz 2c(PrismaModule kaldırıldı) → **2026-05-17 Oturum Güncellemesi:**
  - ✅ **financial-service** — wallet/escrow/ledger/commission 4 repo + 7 handler + grpc controller Mongoose'a geçirildi; `app.module.ts` PrismaService → MongooseModule.forRootAsync
  - ✅ **identity** — auth.service, delete/update-user-status/grant-referral/list-admin-users handler'ları + admin-user.controller + profile.controller
  - ✅ **subscription** — 3 command handler + 2 query handler + renewal service
  - ✅ **loyalty** — xp-rules.service + xp-management.handlers + prisma-loyalty.repositories + loyalty-rules.repositories + 4 controller
  - ✅ **menu** — 5 command handler + 2 query handler + menu-usage-tracker service
  - ✅ **content** — 2 repo + 7 controller (banners/content-admin/dynamic/help/settings/side-ads)
  - ✅ **communication** — create-chat-room.handler + 4 controller
  - ✅ **catalog** (presentation) — system-vendor.service + catalog-product/category-admin/listing/product-admin controllers + product-import.worker
  - ⚠️ **Kalan:** outbox-processor.service, delivery/dispatch-courier.handler, tax.controller, advertising (4 file), inventory (3 file), vendor.controller, audit/logs-admin.controller, barter/accept-trade-offer.handler (ertelendi), marketing (7 file), identity/domain-identity gRPC → Faz 3+sonrası

### Tamamlanan Çıktılar:
- `infra/mongo-rs/docker-compose.yml` — 3-node replica set
- `scripts/migration/init-replica-set.sh` — rs.initiate()
- Bridge utility'ler: `mongo-unit-of-work.ts`, `mongo-soft-delete.plugin.ts`, `mongo-audit.plugin.ts`, `mongo-error.filter.ts`, `mongo-decimal-assert.ts`
- `packages/shared/shared-core/src/math/decimal.ts` — Money API
- `docs/migration/document-model.md` — 150 model embed/reference kararı
- `scripts/prisma-to-mongoose.ts` — native parsing, 150 schema üretti
- `packages/shared/shared-persistence/src/schemas/backend/` — 129 schema
- `packages/shared/shared-persistence/src/schemas/financial/` — 21 schema
- **Tarih:** 2026-05-16
- **Bağlam:** Backend (129 model / 59 enum) + financial-service (21 model / 18 enum) Prisma şemalarının tamamen Mongoose'a taşınması.
- **Önemli kısıtlama:** ⚠️ **Uygulama henüz canlıda değil — production verisi yok.** Dual-write, backfill, reconciliation gibi koruma katmanlarına gerek yok. **Big-bang göç uygulanabilir.**
- **Referans:** ADR-001 (mevcut Prisma seçimi), `delivery-service` (zaten Mongoose çalışıyor — blueprint).

---

## 1. Yönetici Özeti (TL;DR)

Canlı veri olmadığı için göç yaklaşımı tamamen değişiyor:

- ❌ **Yapılmayacaklar:** Dual-write katmanı, backfill script'i, paralel çalıştırma, nightly reconciliation, 30-günlük Postgres sleeping mode, kademeli cutover.
- ✅ **Yapılacaklar:** Modül modül kod dönüşümü, replica set kurulumu, transaction pattern dönüşümü, integration test yeşili, tek seferlik cutover.

**Süre tahmini: 3 hafta dönüşüm + 1 hafta tampon = ~4 hafta (1 senior, full-time).** Risk dağılımı:
- **Düşük risk:** Persistence kodunun yeniden yazılması (mekanik iş — codegen ile hızlandırılır).
- **Orta risk:** Transaction dönüşümü — `$transaction` → `session.withTransaction()`. ~15 yer (atomic operatör ile 40+'dan düştü).
- **Yüksek risk yok** (canlı veri yok). Bug çıkarsa düzelt, devam et.

> **Takvim gerçekçilik notu:** "15 model/gün" bir varsayım, gerçek değil. Model başına ortalama ~3.25 saat (schema 30dk + mapper 45dk + repository 1s + test yeşilleştirme 1s) + transaction dönüşümü + entegrasyon ayıklaması. Bu yüzden Faz 2 ikiye bölünüyor (2a kritik, 2b kalanlar), tampon hafta planın parçası.

---

## 2. Mevcut Durum Envanteri

| Servis | Şema (satır) | Model | Enum | Repository | Transaction Yerleri |
|---|---|---|---|---|---|
| `apps/backend` | 3010 | 129 | 59 | ~28 | Orta |
| `apps/financial-service` | 561 | 21 | 18 | ~8 | Yüksek (her para hareketi) |
| `apps/delivery-service` | — | — | — | 2 | Yok (zaten Mongoose) ✅ |

**Halihazırda hazır olan altyapı:**
- `packages/shared/shared-persistence/src/mongodb/base-mongo.repository.ts` → `BaseMongoRepository<TDomain, TPersistence>` mevcut.
- `MongoShipmentRepository` + `ShipmentDocument` → **referans uygulama**.
- DDD katman ayrımı temiz: Domain persistence'tan zaten soyut.

---

## 3. Karar — Tam Göç mü, Hibrit mi?

Canlı veri olmadığı için **hibrit'in cazibesi azalıyor** (göç maliyeti düşük). Yine de finansal modül için bir karar verilmeli:

| Yaklaşım | Süre | Lehte | Aleyhte |
|---|---|---|---|
| **A — Tam Göç (önerilen)** ⭐ | ~3 hafta | Tek veritabanı, operasyon basitliği, tutarlı pattern | Financial-service için MongoDB transaction'ları replica set zorunlu |
| **B — Hibrit** | ~2 hafta | Financial Postgres'te kalır, ACID garantisi | İki ayrı veritabanı operasyonu — long-term yük |
| **C — Erteleme** | 0 | Mevcut yapı çalışıyor | Soru zaten soruldu; cevap gerekli |

**Önerim: A.** Canlı veri yokken finansal modülü de taşımak ucuz, ileride yapmaktan çok daha kolay. Replica set zaten kurulması gereken bir altyapı yatırımı; **dev ve production'da self-hosted (Docker veya native) 3-node replica set** kullanılacak — Atlas tier seçimi iptal edildi.

---

## 4. Aşamalı Göç Planı

### FAZ 0 — Altyapı & Codegen (2 gün)

- [x] **MongoDB replica set:** `infra/mongo-rs/docker-compose.yml` oluşturuldu — 3-node rs0, healthcheck, port 27017/27018/27019. Transaction için zorunlu.
  - ✅ **Init script:** `scripts/migration/init-replica-set.sh` — `rs.initiate()` + write concern majority ayarı.
  - ✅ **Read/Write Concern konfigürasyonu:** replica set + `w=majority` + `readConcernLevel=majority` + `retryWrites=true` connection string dokümantasyonu.
  - ✅ **Healthcheck:** Compose'da `mongo1` için `mongosh --eval "rs.status().ok"` — diğer servisler bekler.
- [x] **Codegen — iki ayrı script (tek arıza noktası olmasın):**
  1. ✅ **`scripts/prisma-to-mongoose.ts`** — Saf çevirici. Native string parsing, bağımlılık gerektirmez. 150 schema skeleton üretti (129 backend + 21 financial). Her model için `I<TModelName>` interface + mongoose Schema.
  2. **`scripts/embed-refactor.ts`** — Bağımsız script. `docs/migration/document-model.md`'yi okur, daha önce üretilmiş schema dosyalarını refactor eder (subdocument'a çevirir, parent'a `items: [ChildSchema]` ekler).
  - Başlangıçta sadece (1) çalışır. (2) her modül için Faz 2 içinde, embed kararı netleştikten sonra çalışır — istersek manuel de yapılır. Bu ayrım, codegen bug'ı tüm göçü durdurmasın diye.
  - **Config flag `strictMode: boolean`:** Başlangıçta `false` ile çalışır, üretilen iskelet dosyalarda kalıcı `any` yerine geçici `// TODO: strict typing — codegen` yorumu bırakır. CLAUDE.md "0 `any`" kuralı **modül "tamamlandı"** sayılmadan önce uygulanır. Lint kuralı: bu yorum kalan modül CI'da fail eder.
  - **Config flag `maxEmbedSize: number` (default: 100):** Embed kararı verilmiş bir array için sınır. Sınır aşılırsa codegen iskeleti `reference` mode'da üretir + `docs/migration/document-model.md`'ye uyarı yazar. (16MB doküman limiti runtime krizini önler.)
- [x] **Bridge utility'ler** `packages/shared/shared-persistence/src/mongodb/` altında:
  - ✅ `mongo-unit-of-work.ts` — `withTransaction(session, fn)` sarmalayıcı + `withTransactionSimple`.
  - ✅ `mongo-outbox.repository.ts` — Outbox pattern Mongo varyantı.
  - ✅ `mongo-soft-delete.plugin.ts` — `deletedAt` middleware + query helpers (`notDeleted`, `withDeleted`).
  - ✅ `mongo-audit.plugin.ts` — `createdAt`/`updatedAt`/`updatedBy` middleware.
  - ✅ `mongo-error.filter.ts` — `11000` → `ConflictException` global filter (Prisma P2002 yerine).
  - ✅ `mongo-decimal-assert.ts` — Decimal128 tip doğrulama, `setMonetaryFieldRegistry`, `assertDocumentMonetaryFields`.
- [x] **ID stratejisi:** `String _id` + uygulamada `cuid()`. ObjectId KULLANMA — frontend/gRPC sözleşmeleri etkilenir.
- [x] **Decimal stratejisi:** Para alanları için `Decimal128`. `mongoose-currency` veya bson native.
  - ✅ **Decimal128 doğrulama assert'i:** Seed sonrası ve health check'te kontrol mevcut.
  - ✅ Para tutan tüm field'lar bir registry'de listelenir (`packages/shared/shared-core/src/monetary-fields.ts`): `Wallet.balance`, `LedgerEntry.amount`, `Order.total`, `Commission.amount`, `BlindPoolEntry.amount`, `GiftVoucher.value`, vb. Assert bu listeyi okur.

**Çıktı:** Replica set ayakta + init script + healthcheck, bridge utility'ler hazır. Codegen ve monetary-fields registry sonra yaplacak.

---

### FAZ 1 — Tip Eşleme Sözlüğü + Doküman Modeli Tasarımı ✅ (2026-05-16)

- [x] **Tip eşleme tablosu** — ADR-005 §1a'da detaylı.
- [x] **Doküman modeli kararları** — `docs/migration/document-model.md` oluşturuldu. 150 model için embed/reference kararı verildi:
  - 25+ child embed edilecek (OrderItem[], CartItem[], BlindPoolEntry[], vb.)
  - 15 aggregate root parent olarak tanımlandı
  - 16MB limit guard: Order.addItem() MAX_ITEMS_PER_ORDER=100 kontrolü planlandı
  - Reference olarak kalanlar: User, Vendor, Listing, XpTransaction, AuditLog, LedgerEntry, Wallet, vb.

**Çıktı:** `docs/migration/document-model.md` — her aggregate için embed/reference kararı + gerekçe. Codegen script bu kararları okuyarak iskelet üretir.

---

### FAZ 0.5 — Decimal Math Layer (yarım gün, financial blocker)

> **Bu olmadan Faz 2c (financial-service) başlatılamaz.**

Mevcut Postgres'te `Decimal` kolonlar üzerinde JavaScript `+ - * /` operatörleri çalışıyordu çünkü Prisma transparent serialize ediyordu. Mongoose'da `Decimal128` JavaScript number değil — direkt `+ -` operatörü **kesinlik kaybeder, floating-point hatası verir**. Financial-service'te yüzlerce aritmetik nokta var; her biri bug kaynağı.

**Çözüm:** Tek noktada toplanmış utility modül.

- [x] **`packages/shared/shared-core/src/math/decimal.ts`:**
  - ✅ `decimal.js` (mevcut güvenilir kütüphane) wrapper.
  - ✅ `Money.from(value: Decimal128 | string | number): Money` — guard'lı constructor.
  - ✅ `Money.add(other: Money)`, `subtract`, `multiply`, `divide`, `percent(p)`, `compare`, `isZero`, `isNegative`.
  - ✅ `Money.toDecimal128(): Decimal128` — Mongo'ya yazmadan önce.
  - ✅ `Money.toFixed(2): string` — UI/log için.
  - ✅ Çoklu para birimi desteği (`TRY`, `USD`) — currency uyuşmazlığında exception.
- [ ] **Lint kuralı:** `eslint-no-restricted-syntax` — financial-service içinde `Decimal128` üzerinde doğrudan `+`, `-`, `*`, `/` yasak. ESLint hata fırlatır, geliştirici `Money` kullanmaya zorlanır.
- [ ] **`CommissionEngineService`, `TaxCalculatorService`, `SubscriptionPricingService`, `BlindPoolService` (komisyon hesabı), `escrow` ve `ledger` handler'ları tek tek tarama.**

**Çıktı:** `Money` API hazır ✅, lint kuralı ve tarama sonra yaplacak.

---

### FAZ 1 — Tip Eşleme Sözlüğü + Doküman Modeli Tasarımı (1 gün)

#### 1a) Tip eşleme tablosu

| Prisma | Mongoose | Not |
|---|---|---|
| `String @id @default(cuid())` | `_id: { type: String, default: () => cuid() }` | **Schema'da default'a bağla** — uygulamada elle ID üretme |
| `enum X { A B }` | `enum: ['A','B']` + TS enum | Enum'ları `@barterborsa/shared-core/enums`'a topla |
| `@unique` | `index({field:1}, {unique:true})` | `ensureIndexes()` çalıştır |
| `@@unique([a,b])` | Composite unique index | Aynı |
| `@relation` | Sadece `xId: String` alanı; FK yok | populate dikkatli (N+1) — alternatif: embed |
| `onDelete: Cascade` | Mongoose middleware (`pre('deleteOne')`) | Merkezi yer — handler'a yayma |
| `Decimal` | `Decimal128` | Para için Number ASLA |
| `DateTime` | `Date` | — |
| `Json` | Tipli subdocument > `Schema.Types.Mixed` | Mümkünse tip ver |
| `@updatedAt` | `timestamps: true` | Otomatik |
| `@@index([a, b(sort: Desc)])` | `schema.index({a:1, b:-1})` | Tüm composite'leri taşı |

#### 1b) Doküman Modeli — Embed vs Reference Kararı

> **Kritik nokta:** Prisma şemasını birebir Mongoose'a çevirmek MongoDB'nin asıl gücünü (document model) ıskalar. Her aggregate root için göç ÖNCESİ "embed mi, reference mı" kararı verilir.

**Embed (subdocument / array) tercih edilir, eğer:**
- Child kaydı sadece parent ile birlikte sorgulanıyorsa (`Order` → `OrderItem`, `Lottery` → `LotteryTicket` numaraları, `BlindPool` → `BlindPoolEntry`).
- Child sayısı **kanıtlanabilir** şekilde sınırlıysa — `maxEmbedSize` config (default 100) bu sınırı zorla; aşılırsa codegen otomatik reference'a düşer.
- DDD'de zaten aynı aggregate boundary'sindeyse (clean architecture açısından da doğru).

> **⚠️ 16MB Runtime Krizini Önle:** "OrderItem 100 altında kalır" bir varsayımdır, gerçek değil. B2B'de toptan bir vendor 1000 kalem sipariş açabilir. Önlemler:
> 1. **Codegen `maxEmbedSize` zorlaması** (yukarıda).
> 2. **Domain seviyesinde guard:** `Order.addItem()` `items.length >= MAX_ITEMS_PER_ORDER` ise `DomainException` fırlatır.
> 3. **Split stratejisi:** Eğer iş gereği büyük sipariş zorunlu olursa `OrderItem` reference'a geri çekilir, embed kaldırılır. Bu karar `docs/migration/document-model.md`'de değişiklik kayıt edilerek yapılır.
> 4. **Monitoring:** Mongoose document size'ı için bir health metric (`document_size_bytes_p99`) — limit yaklaşırsa alert.

**Reference (ayrı collection + `xId`) tercih edilir, eğer:**
- Child bağımsız sorgulanıyorsa (`Listing`, `Vendor`, `User` — herkes ayrı erişiyor).
- Child sayısı sınırsızsa veya çok büyüyorsa (`XpTransaction`, `AuditLog`, `LedgerEntry`).
- Many-to-many ilişki varsa (`EcosystemMember`, `Referral`).

**Bu projedeki somut embed adayları:**

| Aggregate Root | Embed edilecek child | Gerekçe |
|---|---|---|
| `Order` | `OrderItem[]` (snapshot) | Her zaman birlikte; siparişten sonra immutable |
| `Cart` | `CartItem[]` | Cart kapanınca silinir; ayrı sorgulanmaz |
| `Lottery` | `numbers: number[]` (her bilet için) — ama `LotteryTicket` ayrı kalır (user'a göre sorgulanıyor) | Karma yaklaşım |
| `BlindPool` | `entries: BlindPoolEntry[]` | Pool kapsamı dışında entry sorgusu yok |
| `Auction` | `bids: AuctionBid[]` (son N tanesi cache, hepsi ayrı) | Hibrit: son 50 embed, full history ayrı |
| `SwapSession` | `shipments: Shipment[]` (zaten `unknown` tipinde JSON tutuluyor) | Halihazırda gömülü |
| `EcosystemAuditLog` | `oldValue` / `newValue` | Zaten gömülü — değişmiyor |
| `User` | `referralCode` (zaten alan); `wishlist[]` küçükse | Boyut kontrolüne göre |
| `Vendor` | `VendorB2BData` (1:1) | 1:1 ilişki — ayrı collection saçma |
| `Vendor` | `BankAccount`, `TaxInfo` (1:1) | Aynı |

**Reference kalması gerekenler (kesin ayrı collection):**
`User`, `Vendor`, `Listing`, `Category`, `Brand`, `XpTransaction`, `AuditLog`, `LedgerEntry`, `Wallet`, `MembershipPlan`, `Subscription`, `EcosystemMember`, `Referral`, `SurplusItem`, `TradeOffer`, `SwapSession`, `Order` (kendisi).

**Çıktı:** `docs/migration/document-model.md` — her aggregate için embed/reference kararı + gerekçe. Codegen script bu kararları okuyarak iskelet üretir.

---

### FAZ 2 — Modül Modül Kod Dönüşümü (14 gün, ikiye bölünmüş)

> **Gerçekçi metrik:** Model başına ortalama ~3.25 saat (schema 30dk + mapper 45dk + repository 1s + test 1s). 150 model × 3.25s = ~488 saat = ~12 hafta tek geliştirici. Bu plan 150 modelin **çoğunun mekanik codegen ile geçeceğini, sadece kritik %30'una elle dokunulacağını** varsayar. Aksi durumda 4 haftadan ciddi şekilde uzar.

#### FAZ 2a — Kritik (Yüksek Risk) Modüller (8 gün)

> En çok transaction'ı, en kritik iş mantığını, en fazla bağlı modülleri **önce** dönüştür. Geri kalan modüller çoğu zaman bunların pattern'ini taklit edecek.

| # | Modül | Süre | Not |
|---|---|---|---|
| 1 | `audit` | 0.5 gün | Append-only, pilot |
| 2 | `vendor` (Vendor/Company/B2BData/Ecosystem) | 2 gün | Cascade'li, çok bağımlı |
| 3 | `catalog` (Listing/Category/Brand/Banner) | 1.5 gün | Çok index'li, stok ile bağlı |
| 4 | `commerce` (Order/Cart/Checkout) | 2 gün | **Transaction kritik** |
| 5 | `inventory` (stok atomic) | 1 gün | Commerce ile bağlı |
| 6 | `financial-service` (wallet/ledger/escrow/commission) | 1.5 gün | **Decimal128 + transaction** (Faz 0.5 prerekizit) |
| 7 | `outbox` | 0.5 gün | OutboxMessage schema + MongoOutboxRepository ✅ |

#### FAZ 2b — Geri Kalan Modüller (6 gün)

| # | Modül | Süre | Not |
|---|---|---|---|
| 7 | `barter`, `auction`, `lottery`, `barterborsa` | 2 gün | Saga + transaction (Faz 2a pattern'ini takip eder) |
| 8 | `subscription`, `loyalty`, `marketing` | 1.5 gün | XP/voucher zinciri |
| 9 | `tax`, `menu`, `advertising`, `analytics`, `communication`, `content`, `media` | 2 gün | İzole, mekanik |
| 10 | `identity`, `delivery` (zaten Mongoose), kalanlar | 0.5 gün | Bağlantı + glue |

#### Her Modül İçin Ritüel
1. Codegen'in ürettiği schema iskeletini düzenle (index, validation, enum).
2. **Document-model kararı verilmiş ise:** `embed-refactor.ts` çalıştır, yoksa elle subdocument'a çevir.
3. Mapper yaz (`mappers/x.mapper.ts`) — `Prisma.XGetPayload` yerine `XDocument`'tan domain'e.
4. Repository'yi `BaseMongoRepository` extend ederek yaz.
5. Cascade gereken modeller `cascade-middleware.factory.ts`'e kayıt edilir.
6. Modülün `imports`'unda `PrismaModule` → `MongooseModule.forFeature([...])`.
7. Handler'larda **önce atomic operatör değerlendir**, gerekirse `withTransaction`.
8. **Para alanları:** `Money` API kullan, doğrudan `+ -` yasak (lint zorlar).
9. Integration testleri yeşilleştir.
10. `// TODO: strict typing — codegen` yorumlarını temizle, `any` kalmamalı (lint kontrolü).
11. Bitti, sonraki modüle geç.

#### FAZ 2c — DataLoader Pattern (1 gün, Faz 2 sonunda)

> **N+1 sorgusu Faz 5'e ertelenirse zarar büyür.** Reference kalan tüm modeller (Vendor, Listing, User, Category, ...) zincirleme populate çağrılarıyla karşılaşır:
> ```
> Vendor.findById(id).populate('company').populate('b2bData').populate('subscriptions')
> → 4 ayrı round-trip
> ```

- [ ] **`packages/shared/shared-persistence/src/mongodb/dataloader/`:**
  - `mongo-batch-loader.ts` — Facebook `dataloader` package wrapper. Aynı request içinde aynı collection'a yapılan tüm `findById` çağrılarını tek `find({ _id: { $in: [...] } })`'e toplar.
  - NestJS `@Injectable({ scope: Scope.REQUEST })` — her request için fresh cache.
  - `LoaderRegistry` — `userLoader`, `vendorLoader`, `listingLoader`, vb.
- [ ] **`populate()` yasağı:** Lint kuralı — handler'larda `.populate()` çağrısı yasak; bunun yerine DataLoader.
- [ ] **Performans testi:** Vendor detay endpoint'i — Postgres baseline ile karşılaştır. Yavaşsa karar revize.

---

### FAZ 3 — Transaction Pattern Dönüşümü (paralel, faz 2 içinde)

#### 3a) Önce karar: Transaction GEREKLİ Mİ?

> **Senior kuralı:** MongoDB transaction'ları replica set üzerinde çalışır ama ucuz değil — write lock + oplog overhead + retry potansiyeli. Her `$transaction` çağrısını körü körüne `withTransaction`'a çevirmeyin. **Önce tek-doküman atomic operatör ile çözülebilir mi?**

**Transaction gerektiren gerçek durumlar:**
- Birden fazla **ayrı doküman / collection**'a yazılıyor ve hepsi başarısız/başarılı olmak zorunda (`Order` + `Listing.stok` + `OutboxEvent`).
- İki ayrı aggregate root güncellenip ikisi de tutarlı olmak zorunda (cüzdan ↔ ledger entry).
- Cross-service distributed durumlar (financial-service `holdFunds` + backend `SwapSession` update) → saga + compensation tercih edilir.

**Transaction GEREKMEYEN durumlar (atomic operatör yeter):**
- Tek doküman içinde birden fazla alan güncelleme → `$set` + `$inc` aynı update'te.
- Tek collection'a tek doküman insert.
- Embed edilmiş subdocument'a push/pull → `$push`, `$pull`, `$addToSet` zaten atomic.
- Sayaç artırma → `$inc`.
- Conditional stok düşümü → `updateOne({ _id, qty: {$gte: n} }, { $inc: { qty: -n } })` **tek başına atomic**.

**Örnek — `OrderItem` artık embed edilmiş ise:**

```typescript
// ÖNCE: Order + OrderItem ayrı tablolar → transaction zorunluydu
// SONRA: OrderItem embed → tek atomic insert, transaction GEREKSİZ
await this.orderModel.create({ _id, items: [...], total, status: 'PENDING' });
```

**Örnek — Stok düşümü tek atomic update:**

```typescript
// Sadece tek listing güncelleniyor — transaction'a gerek yok
const res = await this.listingModel.updateOne(
  { _id: listingId, availableQuantity: { $gte: qty }, status: 'ACTIVE' },
  { $inc: { availableQuantity: -qty, reservedQuantity: qty } }
);
if (res.modifiedCount === 0) throw new ConflictException('Stok yok');
```

Bu yaklaşımla transaction kullanımı **~40+ yerden ~15 yere düşer** — performans + kod sadeliği kazancı.

#### 3b) Kritik dönüşüm örneği — `checkout.service.ts` (transaction ZORUNLU çünkü 2 ayrı collection):

```typescript
// ÖNCE (Prisma):
await this.prisma.$transaction(async (tx) => {
  const updated = await tx.listing.updateMany({
    where: { id: listingId, availableQuantity: { gte: qty } },
    data: { availableQuantity: { decrement: qty } }
  });
  if (updated.count === 0) throw new Error('Stok yok');
  const order = await tx.order.create({ data: {...} });
});

// SONRA (Mongoose):
const session = await this.connection.startSession();
try {
  await session.withTransaction(async () => {
    const res = await this.listingModel.updateOne(
      { _id: listingId, availableQuantity: { $gte: qty } },
      { $inc: { availableQuantity: -qty } },
      { session }
    );
    if (res.modifiedCount === 0) throw new Error('Stok yok');
    await this.orderModel.create([{ ... }], { session });
  });
} finally {
  await session.endSession();
}
```

**Dönüşmesi gereken kritik yerler (her biri için önce "atomic operatör yeter mi?" sorusu):**

| Yer | Yaklaşım |
|---|---|
| `checkout.service.ts` → stok + sipariş | **Transaction zorunlu** (Listing + Order farklı collection) |
| `AcceptTradeOfferHandler` → sıralı escrow | **Saga** (cross-service, distributed) |
| `FinalizeSwapHandler` → komisyon + cüzdan + XP | **Transaction** (financial-service içinde) + outbox |
| `AuctionCloseScheduler` → kazanan + iade | Hibrit: kazanan ataması atomic `$set`, iade'ler saga |
| `DrawLotteryHandler` → çekiliş + kazanan | Atomic `$set` (tek doküman) |
| `BlindPoolService.requestFromPool` → SmartCap + hold | **Transaction** (cross-collection) |
| `OrderExpiryService` → stok iadesi | **Transaction** (Listing + Order) |
| `wallet`/`ledger`/`escrow` (financial-service) | **Transaction** zorunlu (her hareket) |
| `OffboardVendorCommand` → 90 gün XP TTL + multi-update | Atomic `$set` (Vendor) + bulk update XpTransaction |
| `DisputeResolutionSchedulerService` → state geçişleri | Atomic `findOneAndUpdate` |
| `CommissionEngineService.markFirstTransaction` | Atomic `$set` (Vendor.firstTransactionAt) |
| `WatchtowerService.checkSmartCap` | Sadece read + log — transaction yok |

---

### FAZ 4 — Seed & Cutover (1 gün)

- [ ] **Prisma seed → Mongoose seed dönüşümü:** `prisma/seed.ts` → `scripts/seed.mongo.ts`. 8 MembershipPlan kaydı + diğer fixture'lar.
- [ ] **Seed transaction wrapper (hiyerarşik embed riski):**
  - Prisma seed'de `Order` + `OrderItem` ayrı INSERT'lerle yazılıyordu, başarısız olursa Postgres transaction kısmi rollback yapardı.
  - Mongoose embed'de tek doküman = atomic, ama seed birden fazla aggregate yazar (User → Vendor → Listing → MembershipPlan zinciri). Tek hata tüm seed'i bozar; hangi noktada bozulduğu net görülmeli.
  - Şablon:
    ```typescript
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await seedMembershipPlans(session);
        await seedAdminUser(session);
        await seedVendors(session);
        await seedListings(session);
        // ...
      });
    } catch (e) {
      console.error(`Seed failed at step "${currentStep}": ${e.message}`);
      throw e;
    } finally {
      await session.endSession();
    }
    ```
  - `currentStep` her bölümde güncellenir — failure mesajında hangi aggregate'in yazılırken patladığı görülür.
- [ ] **Health check:** `MongooseModule` healthcheck `@nestjs/terminus` ile.
  - **Replica set status check:** `rs.status().ok === 1`.
  - **Decimal128 assert:** Para alanlarının tipi doğrulanır (Faz 0 registry'i okur).
- [ ] **Build green:** `pnpm build` 0 hata.
- [ ] **Test green:** `pnpm test` 0 fail.
- [ ] **TypeScript:** `tsc --noEmit` 0 hata, **0 `any`** (CLAUDE.md kuralı), **0 `// TODO: strict typing` yorumu kalmamalı.**
- [ ] **Smoke test:** Manuel — kullanıcı kaydı, sipariş açma, takas teklifi, çekiliş bileti.
- [ ] **Docker compose:** Postgres servisini kaldır (veya `# legacy` olarak yorum satırı).

---

### FAZ 5 — Temizlik (yarım gün)

- [ ] `apps/backend/prisma/` klasörü sil.
- [ ] `apps/financial-service/prisma/` klasörü sil.
- [ ] `packages/shared/shared-persistence/src/prisma/` klasörü sil.
- [ ] `package.json`'lardan `prisma`, `@prisma/client` dependency'leri kaldır.
- [ ] `pnpm prisma:*` script'leri kaldır.
- [ ] `pnpm install --frozen-lockfile=false` lockfile yenile.
- [ ] CLAUDE.md'deki "Database / Prisma" komutlarını "Mongoose" karşılıklarına güncelle.
- [ ] `belge/config_backups/` içindeki Postgres ile ilgili yedekleri taşı/sil.
- [ ] **CI/CD audit:** `.github/workflows/*.yml` içinde `prisma generate`, `prisma migrate`, Postgres servisi spin-up step'leri taranır + kaldırılır.

#### Git History Notu (opsiyonel)

`prisma/` klasörünü silmek **çalışma ağacından** kaldırır, ancak **git history**'de eski commit'lerde okunabilir kalır. Bu bir güvenlik veya lisans sorunu değil ama:

- **Bırakılmalı (önerilen):** Post-mortem, ADR-005 dönüşümünü inceleyenler için faydalı; "neyden geçtik" referansı.
- **Tamamen silmek gerekirse (gereksiz, ama dokümante edilsin):**
  ```bash
  # Modern alternatif — git-filter-repo (resmi tavsiye, filter-branch deprecated)
  pip install git-filter-repo
  git filter-repo --path apps/backend/prisma --invert-paths
  git filter-repo --path apps/financial-service/prisma --invert-paths
  ```
  Force-push gerektirir — tüm ekibin re-clone yapması zorunludur. Bu yüzden önerilmez, sadece referans.

---

## 5. Bilinen Tuzaklar

| Tuzak | Önlem |
|---|---|
| ObjectId kullanmak | String CUID — schema `default: () => cuid()` ile bağla |
| Sayı tipinde para | `Decimal128` zorunlu |
| `populate()` her yerde | Önce embed olabilir mi sor; olmuyorsa DataLoader |
| `lean()` her yerde | Sadece read-only sorgularda, mapper'sız |
| **Birebir tablo→collection göçü** | **MongoDB doküman modelini kullan — embed kararı baştan ver** |
| **`onDelete: Cascade` handler'a dağıtmak** | **Mongoose middleware'de merkezi (`pre('deleteOne')`)** |
| **Gereksiz transaction** | **Önce atomic operatör ($inc/$set/$push) dene** |
| Transaction'sız zorunlu multi-write | `withTransaction()` zorunlu |
| Index'i sonradan eklemek | Schema'da `schema.index()` baştan |
| `P2002` catch'leri | `11000` MongoError'a çevir; global filter yaz |
| Schema-validation eksikliği | Mongoose strict + Zod doğrulama API kenarında |
| `$transaction` parametre olarak geçirme | Mongoose'da `session`'ı her query'ye ekleme zorunlu — kaçırma |
| `findFirst` → `findOne` | İmza farklı, return null vs throw — gözden geçir |
| Subdocument array 16MB limiti aşımı | Büyüyebilen child'ları (audit log, bid history) embed etme — reference tut |

---

## 6. Test Stratejisi

- **Unit:** `mongodb-memory-server` ile repository contract testleri (**transaction'sız**).
- **Integration:** Her command/handler için **gerçek replica set'e karşı** test.
- **Load test (opsiyonel):** Checkout flow paralel 1000 user — stok tutarlılığı doğrulanır.
- **Chaos (opsiyonel):** Mongo primary kill → transaction davranışı.

Canlı veri olmadığı için reconciliation/migration testleri YOK.

> **⚠️ `mongodb-memory-server` replica set DESTEKLEMİYOR.** Sadece standalone Mongo başlatır → transaction'lı kod path'leri test edilemez.
>
> **Strateji:**
> - **Unit testlerde transaction'ı mock'la:** `session.withTransaction()` çağrısı `jest.fn()` ile sarmalanır; iş mantığı doğrulanır, atomic davranış değil.
>   ```typescript
>   const mockSession = { withTransaction: jest.fn((fn) => fn()), endSession: jest.fn() };
>   jest.spyOn(connection, 'startSession').mockResolvedValue(mockSession as any);
>   ```
> - **Integration testler için CI'da gerçek replica set:** `.github/workflows/test.yml`'de docker-compose ile 3-node mongo + init script. Sadece `*.integration.spec.ts` bu replica set'e karşı koşar.
> - **Lokal `pnpm test:integration`:** Geliştiricinin `infra/mongo-rs/docker-compose.yml`'i çalışıyor olmalı — kuralı CONTRIBUTING.md'e yaz.

---

## 7. Tahmini Takvim

| Faz | Süre | Çıktı |
|---|---|---|
| Faz 0 | 2 gün | Replica set + init script + concern config + iki codegen + bridge utility'ler |
| Faz 0.5 | 0.5 gün | Decimal Math Layer (`Money` API) + ESLint kuralı |
| Faz 1 | 1 gün | Tip eşleme + document-model.md kararları |
| Faz 2a | 8 gün | Kritik modüller (audit/vendor/catalog/commerce/inventory/financial) |
| Faz 2b | 6 gün | Geri kalan modüller |
| Faz 2c | 1 gün | DataLoader pattern + populate yasağı |
| Faz 3 | (Faz 2 içinde) | Transaction'lar dönüştü |
| Faz 4 | 1 gün | Seed (transaction wrapper) + cutover + healthcheck |
| Faz 5 | 0.5 gün | Prisma kalıntıları silindi + CI workflow temizliği |
| **Tampon** | **5 gün** | Sürpriz, bug, performans, lint sertleştirme |
| **Toplam** | **~25 iş günü (~5 hafta)** | — |

> Önceki "3 hafta" tahmini, takvim gerçekçilik notuna göre revize edildi. 1 senior full-time hesabıyla. Yarım zamanlı veya paralel başka iş varsa süre orantılı uzar.

---

## 8. Mimari Kararlar (Cevaplanmış)

| Soru | Karar | Gerekçe |
|---|---|---|
| MongoDB self-hosted mı, Atlas mı? | **Tüm ortamlarda (Dev/Test/Production) self-hosted 3-node replica set (Docker veya native).** Atlas tier seçimi iptal edildi. | Production'da da ekibin kendi sunucusu üzerinde çalıştırılacak — Atlas managed tier kullanılmayacak. Backup, failover, monitoring sorumluluğu ekipte. İleride yeniden değerlendirilebilir. |
| Prisma migration dosyaları ne olacak? | **Silinecek** | Git history'de zaten kalıyor. Repo'da ölü kod kafa karıştırır. Faz 5'te `apps/*/prisma/migrations/` komple silinir. |
| `delivery-service` DB yapısı? | **Aynı cluster, farklı veritabanları:** `bazarx_main`, `bazarx_financial`, `bazarx_delivery` | Mikroservis prensibi — servis kendi DB'sine erişir, başkasının collection'larına asla. Aynı cluster operasyon maliyetini düşürür, mantıksal izolasyonu korur. |
| Frontend/mobile DTO'da `id` alanı? | **String olarak korunacak; `_id` ASLA expose edilmeyecek** | Mapper katmanı `_id` → `id` çevirir. CUID formatı sözleşmeyi bozmaz. |
| `prisma:generate` CI bağımlılığı? | **Faz 5'te CI workflow'ları taranır + temizlenir** | `.github/workflows/*.yml` audit edilir, `prisma generate` step'leri kaldırılır. |

## 8.1. Ek Mimari Kararlar (Senior Review Sonrası)

| Soru | Karar | Gerekçe |
|---|---|---|
| Outbox: tek collection mı, modül başına mı? | **Tek `outbox_events` collection + `module: string` discriminator alanı** | grep + aggregation kolay; tek change stream tüm modülleri besler; index `{ module: 1, processedAt: 1 }` yeterli. |
| Mongoose `pre('deleteOne')` cascade middleware | **`shared-persistence/src/mongodb/cascade-middleware.factory.ts`'te ortak factory** | Pattern tek noktada, modüller deklaratif olarak ilan eder (`registerCascade('Vendor', ['Listing','Banner','BrandEcosystem'])`). |
| Codegen `any` toleransı | **`strictMode: false` ile başla, modül "tamamlandı" sayılmadan sertleştir** | Codegen başlangıçta tipli üretemez; geçici `// TODO: strict typing — codegen` yorumu kalan modül CI'da fail eder. |
| Decimal128 doğrulama | **Seed + health check assert zorunlu + para alanı registry** (`shared-core/monetary-fields.ts`) | Compass'ta human-readable değil — Number sızması üretimde geç fark edilir. |
| 16MB embed limit koruması | **3 katmanlı:** codegen `maxEmbedSize`, domain `addItem` guard, runtime `document_size_bytes_p99` metric | Tek katman yetmez — varsayım değil, kanıt gerekli. |
| Prisma git history | **Bırakılır** — ADR-005 dönüşümünü inceleyenler için referans. `git-filter-repo` opsiyonu dokümante edildi (kullanılmıyor). | Çalışma ağacından temizlik yeter; history'i bozmak ekip senkron yükü getirir. |

## 8.2. Kalan Açık Sorular

- [x] ~~Atlas tier seçimi (M10 / M20 / M30)?~~ **İPTAL** — Production'da da self-hosted replica set kullanılacak (2026-05-16 kararı). Bkz. §8 tablosu.
- [ ] Self-hosted production replica set için donanım/sunucu kapasitesi (CPU/RAM/disk) ve backup stratejisi (mongodump cron + off-site retention) netleşmeli.

---

## 9. Mimari İlkeler (Plan Boyunca Uygulanacak)

Bu plan boyunca her modül dönüşümünde bu 8 prensip kontrol edilir:

1. **Doküman Modeli Önce:** Aggregate'i 1:1 collection'a çevirmeden önce "embed mi reference mı" kararını ver. Karar `docs/migration/document-model.md`'de kayıt altına alınır.
2. **Atomic Önce, Transaction Sonra:** Her multi-write için önce "tek doküman atomic operatörle çözülür mü?" sorusunu sor. Transaction sadece zorunluysa.
3. **Cascade Merkezi:** Tüm `onDelete` mantığı Mongoose middleware'de (`pre('deleteOne')`) — handler'lara dağıtma. Ortak factory: `shared-persistence/cascade-middleware.factory.ts`.
4. **ID Schema'da:** `_id` default'u schema seviyesinde `cuid()` ile bağlı — uygulama katmanında elle ID üretme.
5. **Para Tipi Doğrula:** Tüm para alanları registry'de + seed/health check assert. Decimal128 dışında bir tip kabul edilmez.
6. **Embed Limiti Üç Katmanlı:** Codegen `maxEmbedSize` + domain guard + runtime metric. 16MB hiçbir zaman varsayılmaz, kanıtlanır.
7. **Para Aritmetiği `Money` API:** `Decimal128` üzerinde doğrudan `+ - * /` yasak. ESLint zorlar.
8. **`populate()` Yerine DataLoader:** Handler'larda `.populate()` yasak. Reference erişimi DataLoader üzerinden.

## 10. Sonraki Adım

Onayın varsa Faz 0 + 0.5'e başlıyorum:
1. `infra/mongo-rs/docker-compose.yml` — 3-node replica set + healthcheck.
2. `scripts/init-replica-set.sh` — `rs.initiate()` + read/write concern dokümantasyonu.
3. `scripts/prisma-to-mongoose.ts` — saf çevirici (Mongoose schema iskeleti).
4. `scripts/embed-refactor.ts` — embed kararlarını uygulayan ayrı script.
5. `packages/shared/shared-persistence/src/mongodb/` — bridge utility'ler + cascade middleware factory + Decimal128 assert.
6. `packages/shared/shared-core/src/math/decimal.ts` — `Money` API + decimal.js wrapper + ESLint kuralı.
7. `docs/migration/document-model.md` — her aggregate için embed/reference kararı.
8. Pilot modül olarak `audit`'i dönüştür (en izole, en risksiz).

İlk teslimat: 3 gün içinde altyapı + Money API + audit modülü Mongo'da çalışıyor.

---

## 11. Senior Review Geçmişi

| Review # | Konu | Karar / Aksiyon | Bölüm |
|---|---|---|---|
| R1.1 | Doküman modeli 1:1 tuzağı | Embed vs Reference karar matrisi eklendi | Faz 1b |
| R1.2 | Cascade dağıtma riski | Mongoose middleware factory merkezi | Bölüm 9 / Faz 0 |
| R1.3 | ID default'u uygulamada üretme | Schema'da `default: () => cuid()` | Faz 1a |
| R1.4 | Gereksiz transaction maliyeti | "Atomic önce" prensibi + tablo | Faz 3a |
| R2.1 | Codegen `any` toleransı | `strictMode` flag + geçici `// TODO` yorum + CI lint | Faz 0 |
| R2.2 | Decimal128 debug zorluğu | Seed/health assert + monetary-fields registry | Faz 0 / 4 |
| R2.3 | 16MB embed limit krizi | 3 katmanlı koruma (codegen + domain + metric) | Faz 1b / 9 |
| R2.4 | Prisma git history | Bırakılır + filter-repo opsiyonel dokümante | Faz 5 |
| R2.5 | Outbox collection kararsız | Tek collection + `module` discriminator | Bölüm 8.1 |
| R3.1 | Takvim gerçekçilik (10g → 14g+) | Faz 2 → 2a/2b/2c böl, 5 gün tampon | Bölüm 7 / Faz 2 |
| R3.2 | Tek codegen arıza noktası | İki ayrı script (saf çevirici + embed refactor) | Faz 0 |
| R3.3 | Decimal128 matematik bug riski | Faz 0.5 — `Money` API + ESLint kuralı | Faz 0.5 |
| R3.4 | Seed embed atomic'liği | Seed'de transaction wrapper + step logging | Faz 4 |
| R3.5 | Replica set init eksik | `init-replica-set.sh` + read/write concern config | Faz 0 |
| R3.6 | DataLoader ertelenme zararı | Faz 2c — populate yasağı + DataLoader pattern | Faz 2c |
| R3.7 | `mongodb-memory-server` replica set yok | Unit'te transaction mock, integration'da gerçek RS | Bölüm 6 |
| R4.1 | Production deployment kararı (Atlas vs self-hosted) | **Tüm ortamlarda self-hosted replica set** — Atlas iptal (2026-05-16) | Bölüm 3, 8, 8.2 |
