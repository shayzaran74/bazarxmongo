---
name: bazarx-barter-expert
description: >
  BazarX takas (barter) sistemi kuralları, durum geçişleri ve uyuşmazlık yönetimi uzmanı.
  TicariTakas, BarterBorsa havuz mantığı, SwapSession state machine, escrow/teminat
  hesaplamaları, komisyon/XP formülleri veya batch matching engine içeren her görevde
  bu skill'i kullan. Takas ile ilgili kod yazarken veya mimari karar alırken mutlaka tetikle.
  Veritabanı: MongoDB + Mongoose (Prisma yok).
---

# BazarX Takas (Barter) Sistemi Kuralları

Bu yetenek, ajanın BazarX projesindeki takas (swap/trade) işlemlerini denetlerken ve kod yazarken uyması gereken iş kurallarını tanımlar. Bu kurallar `MasterPlan_v4.3`, sistem incelemesi ve ürün sahibinin (User) direktiflerine dayanmaktadır.

> **⚠️ Veritabanı:** Tüm veri katmanı **MongoDB + Mongoose** kullanır. Prisma, PostgreSQL veya SQL migration referansı yoktur.

## 1. TradeOffer (Takas Teklifi) Kuralları
- **Zaman Aşımı:** Teklifler varsayılan olarak **7 gün** geçerlidir (`expiresInDays: 7`).
- **Nakit Desteği:** Takas tekliflerinde nakit para yönü `TO_INITIATOR` veya `TO_RECEIVER` olabilir.
- **Durumlar:** Sadece `PENDING` veya `COUNTER_OFFERED` durumundaki teklifler kabul edilebilir veya reddedilebilir.
- **MongoDB notu:** `TradeOffer` collection'ında `expiresAt` alanına **TTL index** tanımlanır (`db.tradeOffers.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })`).

## 2. SwapSession (Takas Oturumu) Kuralları
- **Zaman Aşımı:** Takas oturumu varsayılan olarak **30 gün** içinde tamamlanmalıdır.
- **Timeout Tetikleyicisi:** Tüm timeout geçişleri (`TIMEOUT`) bir **cron job** ile tetiklenir.
  - Zamanlama: Her gece `02:00` (batch matching ile aynı pencere, önce matching sonra timeout taraması).
  - Uygulama: `SwapSchedulerService` → `checkTimeouts()` → expire olan session'ları `TIMEOUT`'a geçirir.
  - MongoDB'de `deadlineAt` alanına index konur; cron bu alanı filtreler.
- **Durum Geçişleri (State Machine):**
  - `PENDING_COLLATERAL` → `ACTIVE`, `CANCELLED`, `TIMEOUT`
  - `ACTIVE` → `SHIPPING`, `DISPUTED`, `TIMEOUT`
  - `SHIPPING` → `PARTIALLY_COMPLETED`, `DISPUTED`, `COMPLETED`
  - `PARTIALLY_COMPLETED` → `COMPLETED`, `DISPUTED`
  - `DISPUTED` → `COMPLETED`, `CANCELLED`
- **MongoDB notu:** Durum geçişi `findOneAndUpdate` + `session` (transaction) ile yapılır; `transitionTo` metodu dışından doğrudan `status` güncellenmez.

## 3. TicariTakas (B2B) Kuralları
- **Üyelik Seviyeleri ve Barter Komisyonları:**
  - **CORE:** %12 Komisyon (Havuz Limiti: 150.000 ₺)
  - **PRIME:** %10 Komisyon (Havuz Limiti: 500.000 ₺)
  - **ELITE:** %8 Komisyon (Havuz Limiti: 1.500.000 ₺)
  - **APEX:** %6 Komisyon (Havuz Limiti: 10.000.000 ₺)
- **Takas Kredisi Kuralı:** Üyelik ücreti miktarının **5 katı** kadar havuzda takas kredisi açılır.
- **Havuz Limiti Dolduğunda:** Yeni teklif girişi reddedilir; `POOL_LIMIT_EXCEEDED` hatası fırlatılır. Seviye yükseltme önerisi bildirim olarak gönderilir.
- **Komisyon Yapısı ve İndirimler:**
  - **Grup İçi Oranlar:** CORE: %9, PRIME: %8, ELITE: %7, APEX: %6.
  - **XP İndirimi Sonrası Oranlar (Maksimum):** CORE: %6, PRIME: %5, ELITE: %4, APEX: %3.
  - **XP İndirimi Formülü:** `Standart Komisyon * 0.5`.
- **⚠️ Kritik Komisyon Kuralları:**
  - XP indirimi komisyonun **maksimum %50'sine** uygulanabilir. Kalan %50 her zaman **nakit** ödenir.
  - XP indirimi ve grup içi oran **aynı işlemde birlikte uygulanamaz**.
- **TrustScore Algoritması:**
  - **Ticari Performans (%40):** Tamamlanan takas hızı. 90 günde işlem yoksa −10 puan/ay.
  - **XP Sadakati (%30):** Cüzdandaki XP miktarı. Bakiye sıfırlanırsa −5 puan/ay.
  - **Uyumluluk (%30):** Price Floor ve kota uyumu. 1. ihlal uyarı, 2. −15 puan, 3. dondurma.
- **Price Floor:**
  - Her ürün/hizmet kategorisi için sistem yöneticisi tarafından belirlenir.
  - Teklif girerken Price Floor kontrolü yapılır; altında teklif verilemez (`PRICE_FLOOR_VIOLATION` hatası).
  - İhlal tespiti teklif anında gerçekleşir (batch beklenmez).
- **MongoDB notu:** TrustScore hesaplaması asenkron event-driven çalışır; `Vendor` document'ında `trustScore` alanı güncellenir. Hesaplama kritik yolu bloklamaz.

## 4. BarterBorsa Havuz Eşleşme Motoru (Batch Matching Engine) ⭐

### 4.1 Genel Mimari
- **Eşleşme Türü:** Toplu (Batch) — gerçek zamanlı değil.
- **Zamanlama:** Her gece **02:00**'de otomatik çalışır (`BarterMatchScheduler`).
- **Tetikleyici:** Cron job → `BarterMatchService.runDailyBatch()`.
- **MongoDB notu:** Batch sorguları `SurplusItem` collection'ında `{ status: 'ACTIVE' }` + `{ trustScore: -1, createdAt: 1 }` compound index ile çalışır.

### 4.2 Teklif Tercihleri (Önceden Belirlenir)
Teklif sahibi, teklifi oluştururken kısmi eşleşme tercihini **önceden** seçer. Batch sırasında insan müdahalesi olmaz.

```typescript
enum MatchPreference {
  FULL_ONLY          // Tam eşleşme bekle, kısmi kabul etme
  PARTIAL_ACCEPT     // Kısmi eşleşmeyi kabul et, kalan havuzda beklesin
  PARTIAL_CASH_DIFF  // Kısmi eşleşmeyi kabul et, farkı nakit ile karşıla
}
```

`SurplusItem` Mongoose schema'sında `matchPreference` alanı zorunludur (`required: true`).

### 4.3 Eşleşme Öncelik Sırası
Aynı anda birden fazla karşı teklif varsa sıralama şu şekilde yapılır:

1. **TrustScore** (yüksekten düşüğe) — birincil kriter
2. **Teklif Giriş Zamanı** (eskiden yeniye, FIFO) — eşitlik durumunda ikincil kriter

### 4.4 Kısmi Eşleşme Senaryoları

| Teklif Tercihi | Tam Eşleşme | Kısmi Eşleşme | Eşleşme Yok |
|---|---|---|---|
| `FULL_ONLY` | ✅ Eşleşir | ⏳ Bekler | ⏳ Bekler |
| `PARTIAL_ACCEPT` | ✅ Eşleşir | ✅ Kısmi eşleşir, kalan `PENDING` | ⏳ Bekler |
| `PARTIAL_CASH_DIFF` | ✅ Eşleşir | ✅ Kısmi eşleşir, fark nakit tahsil edilir | ⏳ Bekler |

- Nakit fark hesabı: `(Teklif Değeri - Eşleşen Değer)` → `Money` API ile hesaplanır, escrow'a bloke edilir.
- Kısmi eşleşmede kalan miktar aynı teklif altında `PENDING` kalır, bir sonraki batch'e girer.

### 4.4.1 Batch Scheduler Implementasyonu
- `@Cron('0 2 * * *')` dekoratörü ile her gece 02:00'de otomatik tetiklenir.
- `BarterMatchScheduler` sınıfı `OnApplicationBootstrap` / `OnModuleDestroy` implementasyonu **gerektirmez** — NestJS scheduler modülü lifetime yönetimini yapar.
- `runDailyBatch()` içinde 23 saatlik tekrar engeli **yoktur**; cron zaten günde bir kez tetikler.
- Match skoru eşiği: **50 puan** (minimum), **80 puan** (`FULL_ONLY` tercihi için daha yüksek eşik).

### 4.5 Batch Akışı (Pseudocode)
```
runDailyBatch():
  1. SurplusItem.find({ status: 'ACTIVE' }).sort({ trustScore: -1, createdAt: 1 })
  2. Her teklif için uygun karşı teklifleri bul (kategori, fiyat aralığı, Price Floor)
  3. MatchPreference'a göre eşleşme kararını ver
  4. PARTIAL_CASH_DIFF ise nakit farkı hesapla ve escrow'a bloke et
  5. MongoDB session (transaction) içinde SwapSession document oluştur → PENDING_COLLATERAL
  6. Her iki tarafa bildirim gönder (RabbitMQ event)
  7. Eşleşmeyen teklifleri PENDING bırak (7 günlük TTL kontrolü yap)
  8. BatchMatchLog collection'ına sonuç yaz (audit trail)
```

## 5. BarterBorsa (Kurumsal) Kuralları — Fabrika Ekosistemi

### 5.1 Ekosistem Aktörleri ve Roller

| Aktör | Üyelik Seviyesi | Açıklama |
|---|---|---|
| **Fabrika** | `APEX` (zorunlu) | Ekosistemin sahibi ve yöneticisi. Alt bayileri sisteme kaydeder. |
| **Bayi** | `CORE` (başlangıç) | Fabrika tarafından sisteme dahil edilir. Kendi başına kayıt olamaz. |

- Fabrika sisteme **APEX** üyesi olarak giriş yapmak **zorundadır**. APEX altındaki seviyelerle ekosistem kurulamaz.
- Bayiler sisteme **CORE** seviyesinden başlar. Seviye yükseltme fabrika onayına tabidir.
- Fabrika → Bayi ilişkisi `EcosystemMembership` collection'ında tutulur; bayi başka bir fabrikanın ekosistemine aynı anda dahil **olamaz** (unique index: `{ dealerId: 1 }`).

### 5.2 Ürün Gamı Yönetimi (Fabrika Kontrolü)

- Fabrika, kendi ürün gamını sisteme tanımlar. Bu ürünler **yalnızca o fabrikanın bayileri tarafından görülebilir**; genel BazarX pazaryerinde görünmez.
- **Görünürlük Kontrolü:** Fabrika her ürün için aşağıdaki parametreleri ayrı ayrı belirler:

```typescript
interface ProductVisibility {
  visibleTo:        'ALL_DEALERS' | 'SELECTED_DEALERS' | 'NONE'
  selectedDealerIds?: ObjectId[]   // visibleTo: SELECTED_DEALERS ise dolu
  availableFrom:    Date
  availableTo:      Date | null    // null = süresiz
  allowOnlineResale: boolean
}
```

- `allowOnlineResale: false` olan ürünleri satın alan bayi bu ürünü **internet üzerinden satamaz**. Bu kural platform tarafından denetlenir.
- Fabrika görünürlük ayarlarını istediği zaman güncelleyebilir; güncelleme aktif siparişleri etkilemez, yeni siparişlere uygulanır.
- **MongoDB notu:** `EcosystemProduct` document'ında `visibility` gömülü (embedded) obje olarak tutulur. `availableFrom`/`availableTo` alanlarına query index konur.

### 5.3 Sipariş ve Watchover (Kota) Mekanizması

- Bayiler, fabrika ürünlerini platform üzerinden sipariş eder.
- **Ürün bazlı kota:** Fabrika her ürün için `maxOrderQtyPerDealer` belirler. Bu alan zorunludur (`required: true`), `null` olamaz.
- **Watchover kontrolü:** Sipariş anında sistem bayi + ürün bazında toplam sipariş miktarını kontrol eder:
  - `EcosystemOrder.aggregate([{ $match: { dealerId, productId } }, { $group: { total: { $sum: '$qty' } } }])`
  - `total + yeniQty > maxOrderQtyPerDealer` → `DEALER_QUOTA_EXCEEDED` hatası.
  - Kontrol **uygulama katmanında** yapılır; MongoDB transaction içinde atomic olarak çalışır.
- **Kör Havuz (Blind Pool):** Bayiler toplam stok miktarını görebilir; başka bayinin `dealerId`'si hiçbir zaman client'a gönderilmez, sadece `anonymousId` expose edilir.
- **Smart Cap:** Bir bayi, mevcut havuz stoğunun **en fazla %25'ini** tek siparişte alamaz (`MAX_POOL_SHARE_PERCENT = 25`).

### 5.4 Garaj Günü (Flash Sale) Kuralları

- Fabrika belirli bir zaman aralığı için **Garaj Günü** kampanyası tanımlayabilir.
- `GarageSale` collection document yapısı:

```typescript
interface GarageSale {
  _id:             ObjectId
  factoryId:       ObjectId
  productId:       ObjectId
  discountRate:    Decimal128      // indirim oranı (%)
  maxTotalQty:     number          // kampanya toplam stok limiti
  soldQty:         number          // atomik artırılır ($inc)
  maxQtyPerDealer: number          // bayi başına limit
  startsAt:        Date
  endsAt:          Date
  status:          'ACTIVE' | 'EXHAUSTED' | 'EXPIRED'
}
```

- `soldQty >= maxTotalQty` olduğunda `status: 'EXHAUSTED'` set edilir; yeni sipariş alınmaz (`GARAGE_SALE_STOCK_EXHAUSTED`).
- `soldQty` artışı `findOneAndUpdate` + `$inc` + `$set` ile atomic yapılır (race condition önlemi).
- Garaj Günü fiyatı: `normalFiyat * (1 - discountRate)` → `Money` API ile hesaplanır.
- Garaj Günü siparişleri de Watchover (`maxOrderQtyPerDealer`) kurallarına tabidir.

### 5.5 Ekosistem İçi Takas Yasağı ⚠️

- **Bayiler bu ekosistem içinde birbirleriyle hiçbir şekilde takas yapamaz.**
- Takas yapmak isteyen bayiler, genel **BazarX Pazaryeri**'ne geçmek zorundadır.
- Pazaryerindeki takas işlemleri; Bölüm 1, 2, 4 ve 6 kurallarına tabidir.
- Ekosistem context'inden takas başlatma girişimi `BARTER_NOT_ALLOWED_IN_ECOSYSTEM` hatasıyla reddedilir.
- **Fabrika ürünleri de dahil:** Bayinin fabrikadan satın aldığı ürünü pazaryerinde takas etmesi `allowOnlineResale` iznine tabidir.

### 5.6 Grup İçi Oran
- Aynı grup/holding içi takaslarda (pazaryerinde gerçekleşen) **%6 sistem yönetim bedeli** kesilir.

## 6. Güvenli Takas (Escrow & 5 Adım) Kuralları ⭐
- **%20 Teminat (Blokaj):** Takas miktarının **%20'si** işlem başında **her iki taraftan da** bloke edilir. `CollateralCalculatorService` `DEFAULT_PERCENTAGE = 0.20` kullanır.
- **5 Kademeli Teslimat:** Toplam takas miktarı **5 defada** gerçekleştirilerek tamamlanır.
- **Teminat İadesi ve Komisyon:** Son gönderimde her iki taraf onay verdiğinde, 7 gün içinde üyelik seviyesine göre komisyon kesilerek kalan teminat iade edilir.
- **Uyuşmazlık (Dispute):** Sorun çıkarsa süreç **Arabulucuya** gider. Haksız bulunan tarafın bloke edilen miktarı mağdur tarafın zararını karşılamak için kullanılır.
- **Sanal İsimler ve Gizlilik:** Taraflar işlem tamamlanana kadar birbirlerini **sanal isimler** üzerinden görür ve iletişim kurar.
- **Platform Atlama (Bypass) Koruması:** Platformu aradan çıkarma girişimlerini önleyecek şekilde iletişim sınırlandırılmalı ve denetlenmelidir.
- **Çapraz Takas (Multi-Party Barter):** A→B→C→A zincirleri desteklenir. Zincir bütünlüğü ve gizlilik kritik derecede zorunludur.

## 7. Kodlama ve Mimari Kurallar (MongoDB)

- **ORM:** Mongoose kullanılır. `@Schema()` + `@Prop()` dekoratörleri ile model tanımlanır. Ham `db.*` çağrısı yasaktır.
- **Para hesapları:** `Decimal128` (MongoDB native) + `Money` API. JavaScript `number` ile para hesabı yapılmaz.
- **Durum geçişleri:** `transitionTo` metodu kullanılır; `status` alanı doğrudan (`document.status = ...`) güncellenmez.
- **`updatedAt` güncelleme:** SwapSession entity içinde domain metodlarda (`releaseCollateral`, `forfeitCollateral`) `this.props.updatedAt = new Date()` kullanılır, `this._updatedAt` değil. Entity üzerindeki tüm state mutation'larda `updatedAt` alanı güncellenir.
- **Transactions:** Kritik işlemler (SwapSession oluşturma, escrow blokaj, Garaj Günü `soldQty` artışı, iade onayı, erken ödeme transferi) `mongoose.startSession()` + `session.withTransaction()` içinde çalışır.
- **Race condition önlemi:** Stok ve kota kontrollerinde `findOneAndUpdate` + `$inc`/`$set` + optimistic locking (`__v`) kullanılır. `SERIALIZABLE` transaction yerine MongoDB'nin atomic operatörleri tercih edilir.
- **16MB döküman limiti:** Embed array'lerde (`BarterPart[]`, `TradeOfferItem[]` vb.) `maxEmbedSize` kontrolü yapılır; büyük listeler ayrı collection'a taşınır.
- **TrustScore ve VendorScore:** İkisi de asenkron (event-driven, RabbitMQ consumer) hesaplanır. Kritik yolu bloklamaz.
- **Kör Havuz:** Bayi kimliği (`dealerId`) hiçbir zaman client'a gönderilmez; projection'da daima exclude edilir (`{ dealerId: 0 }`).
- **Audit log:** Batch matching, satıcı ihlal kararları ilgili log collection'larına yazılır.
- **ICargoProvider / IEInvoiceProvider:** Adapter pattern — her kargo firması ve e-fatura entegratörü ayrı adapter ile implement eder. Yeni entegrasyon eklemek core'u değiştirmez.
- **İade 48s timeout:** `ReturnRequest.vendorDeadlineAt` alanı; `ReturnSchedulerService` cron ile tarar, süre dolunca auto-approve.
- **Buybox hesabı event-driven:** Fiyat veya puan değişikliğinde BullMQ job tetiklenir; `Listing.isBuyboxWinner` atomic güncellenir.
- **Index stratejisi:**
```
SurplusItem:         { status: 1, trustScore: -1, createdAt: 1 }
TradeOffer:          { expiresAt: 1 } ← TTL index
SwapSession:         { deadlineAt: 1 }
ReturnRequest:       { orderId: 1 } unique, { vendorId: 1, status: 1 }, { vendorDeadlineAt: 1 }
VendorScore:         { vendorId: 1 } unique
VendorViolation:     { vendorId: 1, createdAt: -1 }
BuyboxScore:         { productId: 1, listingId: 1 } unique
CargoShipment:       { orderId: 1 } unique, { status: 1 }
EarlyPaymentRequest: { vendorId: 1, createdAt: -1 }
EcosystemMembership: { dealerId: 1 } unique
GarageSale:          { factoryId: 1, status: 1, startsAt: 1, endsAt: 1 }
```
