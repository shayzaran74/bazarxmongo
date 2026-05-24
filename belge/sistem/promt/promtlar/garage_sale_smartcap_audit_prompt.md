# Garage Sale & SmartCap (Watchover) — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Garage Sale ve SmartCap sistemi vendor modülünün içinde, ecosystem alt kümesinde yaşıyor — ayrı bir `garage-sale/` modülü yok. `ekosistem.md` dosyasında Sorun #9 olarak kaydedildi: "Smart Cap (%25 havuz payı) — Ekosistem Smart Cap kontrolünün ekosistem bazlı uygulanması eksik." Sprint 2 planında `WatchoverService` ve `GarageSaleService`'in yazılması öngörüldü.

Bu iki servis hayattaki en kritik atomiklik noktaları. `soldQty` ve `blockedQuantity` race condition, onlarca bayinin aynı anda aynı ürüne hücum ettiği bir kampanya anında gerçekleşir. Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/vendor/` (garage-sale ve watchover burada)

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (kampanya fiyatı, indirim hesabı)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**İlgili dosyalar:**
```
application/services/
  garage-sale.service.ts     → Flash sale CRUD, atomic soldQty, status geçişi
  watchover.service.ts       → Kota kontrolü (aggregate + atomic)

infrastructure/persistence/schemas/
  garageSale.schema.ts       → GarageSale modeli
  ecosystemOrder.schema.ts   → EcosystemOrder modeli

presentation/
  ecosystem.controller.ts    → Fabrika endpoint'leri (Garaj Günü CRUD)
  dealer.controller.ts       → Bayi endpoint'leri (sipariş, kota sorgulama)
```

**Mongoose modelleri:**
```
GarageSale        → Flash sale kampanyası
EcosystemOrder    → Ekosistem içi sipariş kaydı
EcosystemProduct  → Fabrika ürün gaması
ProductVisibility → Ürün görünürlük kuralları
```

**MongoDB index'leri:**
```
GarageSale:     { factoryId: 1, status: 1, startsAt: 1, endsAt: 1 }
EcosystemOrder: { dealerId: 1, productId: 1 }
```

---

## Garage Sale & SmartCap İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Watchover (Kota) Mekanizması §4.3

```
Sipariş anında:
  SELECT SUM(quantity) FROM ecosystem_orders
    WHERE dealerId = ? AND productId = ? AND status IN ('PENDING', 'CONFIRMED')
  IF toplamGeçmişAdet + yeniAdet > maxOrderQtyPerDealer
    → DEALER_QUOTA_EXCEEDED

Smart Cap (havuz koruma):
  yeniAdet > havuzStoku * 0.25
  → SMART_CAP_EXCEEDED
  (Bir bayi tek siparişte havuzun %25'inden fazlasını alamaz)

Her iki kontrol:
  - Uygulama katmanında atomic olmalı (tekelleşme önlemi)
  - Aggregate ile geçmiş sipariş sayısı hesaplanmalı
  - Race condition: iki eş zamanlı sipariş ikisi de geçerse kota aşılır
```

### Garaj Günü (Flash Sale) §4.4

```
Fabrika parametreleri belirler:
  discountRate:      İndirim oranı % (1-99, tam sayı)
  maxTotalQty:       Kampanya toplam stok (soldQty bu kadar dolunca → EXHAUSTED)
  maxQtyPerDealer:   Bayi başına limit (Watchover'dan bağımsız — daha kısıtlayıcı)
  startsAt/endsAt:   Kampanya zaman aralığı
  originalPrice:     Kampanya başındaki fiyat snapshot (Decimal128)
  campaignPrice:     originalPrice × (1 - discountRate/100) (Decimal128)

Kritik kurallar:
  - soldQty tükenince → otomatik EXHAUSTED (süre dolmamış olsa bile)
  - soldQty artırımı ATOMIC olmalı ($inc ile, find+update değil)
  - Aynı ürüne çakışan kampanya açılamaz
  - maxQtyPerDealer <= maxTotalQty olmalı

Status geçişleri:
  SCHEDULED → ACTIVE (startsAt geldi, scheduler tetikler)
  ACTIVE → EXHAUSTED (soldQty >= maxTotalQty, atomic check sonucu)
  ACTIVE → ENDED (endsAt geçti, scheduler tetikler)
  ACTIVE → CANCELLED (fabrika iptal etti — sadece SCHEDULED iken)

GarageSale sipariş akışı:
  1. Bayi sipariş verir (checkout.service.ts veya dealer.controller.ts)
  2. WatchoverService.checkSmartCap() → havuz %25 kontrolü
  3. GarageSaleService.processGarageSaleOrder() →
     a. GarageSale aktif mi + süre penceresi mi kontrol et
     b. Bu bayi bu kampanyada kaç adet aldı? (maxQtyPerDealer kontrolü)
     c. Atomic $inc soldQty + $expr koşul:
        findOneAndUpdate(
          { _id: garageSaleId, status: 'ACTIVE', $expr: { $lte: [{ $add: ['$soldQty', qty] }, '$maxTotalQty'] } },
          { $inc: { soldQty: qty } }
        )
        → null dönerse GARAGE_SALE_STOCK_EXHAUSTED
  4. EcosystemOrder oluştur (isGarageSale: true, garageSaleId bağlı)
  5. campaignPrice ile sipariş fiyatı override et
```

### SmartCap Özel Durumu (Sorun #9)

```
ekosistem.md kayıt: "Smart Cap kontrolünün ekosistem bazlı uygulanması eksik"

Smart Cap iki farklı bağlamda çalışmalı:
  1. Normal Watchover: bayi geçmiş + anlık adeti > maxOrderQtyPerDealer → DEALER_QUOTA_EXCEEDED
  2. Smart Cap: anlık istek > havuzStoku * 0.25 → SMART_CAP_EXCEEDED

Sorun: havuzStoku kimden geliyor?
  → EcosystemProduct.stock mı?
  → GarageSale.maxTotalQty - soldQty mı?
  → Aktif siparişlerdeki blockedQuantity mı?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Servis dosyaları gerçekten implement edilmiş mi?**

Sprint 2 planında şu servisler yazılacaktı. Gerçek durumu raporla:

| Dosya | Beklenen İçerik | Gerçek Durum |
|---|---|---|
| `garage-sale.service.ts` | GarageSale CRUD, atomic soldQty, status geçişi | ? |
| `watchover.service.ts` | Kota kontrolü, SmartCap aggregate | ? |

Her biri için:
- Dosya var mı?
- Method imzaları tanımlı mı?
- Method body'leri dolu mu yoksa `throw new NotImplementedException()` mi?
- `vendor.module.ts`'de provider olarak kayıtlı mı?

**1.2 `soldQty` atomic artırımı doğruluğu:**

Bu, modülün en kritik noktası. Kodu oku:

```
Kontrol listesi:
  □ findOneAndUpdate + $inc + $expr kombinasyonu kullanılıyor mu?
    (Bu üçü birlikte: hem kontrol hem artırım atomic)
  □ Yoksa ayrı find + update mi?
    (Race condition: iki eş zamanlı sipariş ikisi de stok görür, ikisi de azaltır)
  □ GarageSale.soldQty her artırımda stok kontrol edilip atomic yazılıyor mu?
  □ null döndüğünde EXHAUSTED durum geçişi tetikleniyor mu?
  □ Mongoose session içinde mi? (Transaction kullanılıyor mu?)
```

**1.3 Watchover aggregate sorgusu:**

`toplamGeçmişAdet` hesabı nasıl yapılıyor?

```
Kontrol listesi:
  □ EcosystemOrder koleksiyonunda aggregate:
    { dealerId, productId, status: { $in: ['PENDING', 'CONFIRMED'] } }
    → $group: { totalQty: { $sum: '$quantity' } }
  □ Bu aggregate Mongoose session ile çalışıyor mu?
    (Session olmadan: pending order başka bir transaction'da görülmeyebilir)
  □ Smart Cap: havuzStoku neye bakıyor?
    EcosystemProduct.stock mu? GarageSale.maxTotalQty - soldQty mı?
  □ İki kontrol (Watchover + SmartCap) sıralı mı?
    Hangisi önce? Hangi hata önce fırlatılır?
```

**1.4 Scheduler doğruluğu:**

```
  □ SCHEDULED → ACTIVE geçişi: her 5 dakika @Cron mu, BullMQ job mu?
  □ ACTIVE → ENDED geçişi: her 5 dakika @Cron mu?
  □ Multi-instance: iki backend instance aynı kampanyayı aynı anda ACTIVE yapabilir mi?
    (findOneAndUpdate atomic geçiş var mı? { status: 'SCHEDULED', startsAt: { $lte: now } })
  □ Geç başlayan kampanya (startsAt geçti ama hâlâ SCHEDULED): ne kadar gecikme tolere ediliyor?
```

**1.5 Dealer.controller.ts → GarageSaleService entegrasyonu:**

```
  □ Bayi sipariş verdiğinde Garaj Günü fiyatı nasıl uygulanıyor?
    - Dealer campaign fiyatını kendisi mi giriyor? (Güvensiz)
    - Checkout servisi GarageSaleService'e sorarak mı alıyor? (Doğru)
  □ campaignPrice hesabı nerede? GarageSaleService'te mi, checkout'ta mı?
  □ GarageSale.campaignPrice Decimal128 mı? Float mu?
  □ originalPrice snapshot ne zaman alınıyor?
    Kampanya oluşturulurken mi (doğru) yoksa sipariş anında mı (hatalı)?
```

**1.6 Modül bağımlılık grafiği:**

- `garage-sale.service.ts` `vendor.module.ts`'de mi, ayrı bir yerde mi?
- `checkout.service.ts` (commerce modülü) `WatchoverService`'e nasıl erişiyor?
  - Doğrudan inject mi? (cross-module injection → circular dependency riski)
  - Event tabanlı mı?
  - Ayrı bir `watchover.module.ts` export ediyor mu?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Garage-sale ve watchover ile ilgili tüm dosyaları tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts" \
  | grep -iE "garage|sale|watchover|ecosystemOrder|smartCap|soldQty|quota" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| garage-sale.service.ts | ? | `result: any` | KRİTİK | `GarageSaleDocument` |
| watchover.service.ts | ? | `aggregateResult: any` | YÜKSEK | `QuotaAggregateResult` |

Risk seviyeleri:
- `KRİTİK`: campaignPrice `any` → Decimal128 yerine float → fiyat hatası
- `YÜKSEK`: Aggregate sonucu `any` → totalQty undefined → kota kontrolü geçer
- `ORTA`: DTO `any` → validation atlıyor
- `DÜŞÜK`: İzole scope

**Adım 3:** GarageSale şema tam tipleri:

```typescript
interface GarageSaleDocument {
  _id: Types.ObjectId;
  ecosystemId: Types.ObjectId;
  factoryId: Types.ObjectId;
  productId: Types.ObjectId;
  
  discountRate: number;                  // 1-99 tam sayı
  originalPrice: Types.Decimal128;       // snapshot — kampanya başındaki fiyat
  campaignPrice: Types.Decimal128;       // originalPrice × (1 - discountRate/100)
  
  maxTotalQty: number;                   // toplam stok limiti
  soldQty: number;                       // atomic $inc ile artırılır — default 0
  maxQtyPerDealer: number;               // bayi başına limit
  
  startsAt: Date;
  endsAt: Date;
  
  status: 'SCHEDULED' | 'ACTIVE' | 'EXHAUSTED' | 'ENDED' | 'CANCELLED';
  
  createdAt: Date;
  updatedAt: Date;
}
```

Bu şema tam mı yoksa field'lar eksik mi? `any` ile doldurulmuş alan var mı?

**Adım 4:** `processGarageSaleOrder` dönüş tipi:

```typescript
// GarageSaleService.processGarageSaleOrder() dönüş tipi:
interface GarageSaleOrderResult {
  garageSale: GarageSaleDocument;    // güncellenmiş kampanya (soldQty artmış)
  campaignPrice: Types.Decimal128;   // checkout'un kullanacağı fiyat
  remainingStock: number;            // maxTotalQty - soldQty (sipariş sonrası)
  wasExhausted: boolean;             // bu sipariş stoğu bitirdi mi?
}
```

Mevcut return tipi ne? `any` mi, `GarageSaleDocument` mi, başka mı?

**Adım 5:** Watchover aggregate sonuç tipi:

```typescript
// sumQuantityByDealerAndProduct dönüş tipi:
interface QuotaAggregateResult {
  totalQty: number;    // toplam geçmiş sipariş adeti
}

// Aggregate: $group ile dönen sonuç:
const result = await EcosystemOrderModel.aggregate([
  { $match: { dealerId, productId, status: { $in: ['PENDING', 'CONFIRMED'] } } },
  { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
], { session });

// result[0]?.totalQty ?? 0
// result[0] undefined gelirse totalQty undefined → any'e cast edilirse 0 yerine NaN
```

Bu dönüş tipi güvenli mi?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Kampanya durum dallanması:**
```typescript
// Kötü:
if (garageSale.status !== 'ACTIVE') { throw ... }
if (now < garageSale.startsAt) { throw ... }
if (now > garageSale.endsAt) { throw ... }
if (garageSale.soldQty >= garageSale.maxTotalQty) { throw ... }
// → GarageSale entity metodları:
class GarageSaleEntity {
  isCurrentlyActive(): boolean {
    return this.status === 'ACTIVE'
      && new Date() >= this.startsAt
      && new Date() <= this.endsAt
      && this.soldQty < this.maxTotalQty;
  }
}
```

**Pattern B — Kota kontrol sırası:**
```typescript
// Kontrol sırası önemli:
// 1. SmartCap kontrolü (anlık istek > havuz %25)
// 2. Watchover kota kontrolü (geçmiş + anlık > bayi limiti)
// 3. GarageSale dealer kota (bu kampanyada bayi kaç aldı)
// Bu sıra doğru mu? Hangi hata önce fırlatılmalı?
```

**Pattern C — campaignPrice hesabı:**
```typescript
// Kötü — float ile:
const campaignPrice = originalPrice * (1 - discountRate / 100);
// → Floating point hatası: 100 * (1 - 0.3) = 70.00000000000001

// Doğru — Decimal128 ile:
const original = parseFloat(originalPrice.toString());
const discount = discountRate / 100;
const campaign = original * (1 - discount);
campaignPrice = Decimal128.fromString(campaign.toFixed(2));
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — soldQty artırımı race condition (KRİTİK):**
```typescript
// Kötü — iki adımlı:
const garageSale = await GarageSaleModel.findById(id);
if (garageSale.soldQty + requestedQty > garageSale.maxTotalQty) {
  throw new ForbiddenException({ code: 'GARAGE_SALE_STOCK_EXHAUSTED' });
}
await GarageSaleModel.updateOne({ _id: id }, { $inc: { soldQty: requestedQty } });
// → İki eş zamanlı sipariş:
//   Her ikisi de "soldQty 8/10" görür, her ikisi de 3 adet ister
//   Her ikisi de kontrol geçer, her ikisi de +3 yazar → soldQty = 14/10 → stok aşıldı

// Doğru — atomic findOneAndUpdate + $expr:
const updated = await GarageSaleModel.findOneAndUpdate(
  {
    _id: garageSaleId,
    status: 'ACTIVE',
    $expr: {
      $lte: [{ $add: ['$soldQty', requestedQty] }, '$maxTotalQty']
    }
  },
  {
    $inc: { soldQty: requestedQty }
  },
  { new: true, session }
);
if (!updated) {
  throw new ForbiddenException({ code: 'GARAGE_SALE_STOCK_EXHAUSTED' });
}
```

**Antipattern B — Watchover aggregate session'sız:**
```typescript
// Kötü — session olmadan aggregate:
const result = await EcosystemOrderModel.aggregate([...]);
// → Transaction içinde oluşturulan ama commit edilmemiş siparişler görünmez
// → Phantom read: aynı bayi iki eş zamanlı sipariş verdiğinde ikisi de geçer

// Doğru:
const result = await EcosystemOrderModel.aggregate([...], { session });
```

**Antipattern C — Kampanya kapatmada çift tetikleme:**
```typescript
// Scheduler ENDED yaparken aynı anda son sipariş EXHAUSTED yapabilir:
// Her ikisi de status'ü güncellemeye çalışır
// → findOneAndUpdate + { status: 'ACTIVE' } koşuluyla atomic:
const closed = await GarageSaleModel.findOneAndUpdate(
  { _id: id, status: 'ACTIVE' },
  { $set: { status: 'ENDED', endedAt: new Date() } }
);
if (!closed) return; // zaten kapatılmış — çift tetikleme önlendi
```

**Antipattern D — Dealer kota kontrolü idempotency:**
```typescript
// GarageSale dealer kota: "Bu bayi bu kampanyada kaç adet aldı?"
// EcosystemOrder'da aggregate yapılıyor mu?
// Bu aggregate de session içinde olmalı (aynı transaction):
const dealerTotal = await EcosystemOrderModel.aggregate([
  {
    $match: {
      garageSaleId: new Types.ObjectId(garageSaleId),
      dealerId: new Types.ObjectId(dealerId),
      status: { $in: ['PENDING', 'CONFIRMED'] }
    }
  },
  { $group: { _id: null, total: { $sum: '$quantity' } } }
], { session });
const currentDealerTotal = dealerTotal[0]?.total ?? 0;
if (currentDealerTotal + requestedQty > garageSale.maxQtyPerDealer) {
  throw new ForbiddenException({ code: 'GARAGE_SALE_DEALER_QUOTA_EXCEEDED' });
}
```

**Antipattern E — campaignPrice override'ı checkout'ta:**
```typescript
// Sipariş fiyatı checkout.service.ts'te nasıl override ediliyor?
// Kötü: bayi kendi fiyatını gönderebiliyor
//   request.body.price = 50; // kampanya fiyatından düşük
// Doğru: checkout GarageSaleService'ten campaignPrice'ı alıp kullanıyor
//   const { campaignPrice } = await garageSaleService.processOrder(...);
//   order.unitPrice = campaignPrice; // bayi girdisini hiç kullanma
```

**3.3 Smart Cap uygulanabilirlik analizi (Sorun #9):**

```
ekosistem.md notu: "Ekosistem bazlı Smart Cap eksik"

Şunları kontrol et:

1. SmartCap %25 neye göre?
   □ Anlık istek > EcosystemProduct.stock × 0.25 ?
   □ Anlık istek > (GarageSale.maxTotalQty - soldQty) × 0.25 ?
   → Garaj Günü aktifken hangisi kullanılıyor?

2. Normal Watchover vs Garaj Günü kota:
   □ maxOrderQtyPerDealer → Watchover kontrolü
   □ GarageSale.maxQtyPerDealer → Garaj Günü dealer kota kontrolü
   Bu ikisi birbirinden bağımsız olmalı — hangisi daha kısıtlayıcı?
   Kodu oku: ikisi de kontrol ediliyor mu yoksa sadece biri mi?

3. SmartCap %25 hesabı:
   □ Garaj Günü'nde: (maxTotalQty - soldQty) × 0.25 — DOĞRU
   □ Normal stok için: EcosystemProduct.stock × 0.25 — DOĞRU
   □ hangisi kullanılıyor?
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Sprint 2 implementasyon durumu tablosu:**

Sprint 2 planında şunların implement edilmesi öngörüldü. Her birini koddan doğrula:

| Görev | Planlanan Dosya | Implement Durumu | Boş mu? |
|---|---|---|---|
| EcosystemOrder schema | ecosystemOrder.schema.ts | ? | ? |
| GarageSale schema | garageSale.schema.ts | ? | ? |
| WatchoverService | watchover.service.ts | ? | ? |
| GarageSaleService | garage-sale.service.ts | ? | ? |
| GarageSaleScheduler | garage-sale.scheduler.ts | ? | ? |
| checkout.service.ts GarageSale entegrasyonu | checkout.service.ts | ? | ? |
| dealer.controller.ts GarageSale endpoint'leri | dealer.controller.ts | ? | ? |

**4.2 Dead code tespiti:**

```bash
grep -rn "GarageSale\|EcosystemOrder\|watchover\|WatchoverService\|garageSale\|soldQty\|SmartCap\|SMART_CAP\|DEALER_QUOTA" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\." \
  | awk -F: '{print $1}' | sort | uniq -c | sort -rn | head -20
```

Hangi dosyalar gerçekten bu modeli kullanıyor? Sadece import edip kullanmayan var mı?

**4.3 campaignPrice hesap fonksiyonu duplicate:**

campaignPrice hesabı (`originalPrice × (1 - discountRate/100)`) birden fazla yerde yapılıyor mu?

```bash
grep -rn "discountRate\|campaignPrice\|campaign.*price\|1.*discount\|discount.*rate" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts"
```

Her occurrence için: aynı hesap mı? Decimal128 mı float mı? Tek yere extract gerekiyor mu?

**4.4 EcosystemOrder index yeterliliği:**

Mevcut index: `{ dealerId: 1, productId: 1 }`

```
Watchover aggregate için gerekli sorgular:
  { dealerId, productId, status: { $in: ['PENDING', 'CONFIRMED'] } }
  → Mevcut index bunu karşılıyor mu? (status eksik)
  → Compound index önerisi: { dealerId: 1, productId: 1, status: 1 }

GarageSale dealer kota için:
  { garageSaleId, dealerId, status: { $in: ['PENDING', 'CONFIRMED'] } }
  → Index önerisi: { garageSaleId: 1, dealerId: 1, status: 1 }

İki ayrı aggregate için iki ayrı compound index gerekiyor mu?
```

**4.5 `ProductVisibility` modeli analizi:**

Bu model ne için kullanılıyor?

```bash
grep -rn "ProductVisibility" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts"
```

- `EcosystemProduct.visibleTo` field'ıyla overlap var mı?
- Dead model mi, aktif kullanımda mı?
- Ayrı koleksiyona gerek var mı, EcosystemProduct içinde embedded olabilir mi?

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/vendor/path/to/file.ts:satır`
**Tespit:** [Ne buldun]
**Risk:** KRİTİK / YÜKSEK / ORTA / DÜŞÜK
**Sorun:** [Neden sorun — tek cümle]

**Düzeltme:**
```typescript
// Tam, çalışır, copy-paste edilebilir kod
```

**Cascade etkisi:** [Bu değişiklik başka neyi etkiler]
```

---

## Önceliklendirme

1. **KRİTİK** — `soldQty` atomic değilse (find+update), Watchover aggregate session'sız (phantom read), campaignPrice override bayi tarafından yapılabiliyorsa (fiyat manipülasyonu)
2. **YÜKSEK** — SmartCap havuz stoğu hesabı yanlış kaynak (Sorun #9), Watchover ve GarageSale dealer kota ikisi birlikte kontrol edilmiyorsa, kampanya çift kapatma (scheduler + sipariş aynı anda)
3. **ORTA** — campaignPrice Decimal128 yerine float, EcosystemOrder index eksikleri, ProductVisibility dead model
4. **DÜŞÜK** — Dead code, scheduler @Cron yerine BullMQ, duplicate hesap fonksiyonu

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **Smart Cap %25 eşiği** — iş kararı, değiştirme
- **Watchover kota mantığı (maxOrderQtyPerDealer)** — iş kararı
- **Kampanya parametrelerinin fabrika tarafından belirlenmesi** — iş kararı
- **GarageSale status enum değerleri** — frontend bağımlı
- **Sprint 2 planının kapsamı** — sadece neyin implement edilip edilmediğini raporla, plan değiştirme

---

## Son Not

Garage Sale sisteminin üç sessiz başarısızlık noktası var:

`soldQty` non-atomic — Popüler bir kampanyada 50 bayi aynı anda teklif verdiğinde, her biri mevcut stoğu görür, her biri kendi isteğini ekler. Sonuç: 100 ürünlük kampanyada 150 sipariş kabul edildi. Restoran siparişleri karşılayamıyor, fabrika şikayet alıyor.

Watchover aggregate session'sız — Aynı bayi iki sekmeden aynı anda sipariş verirse, her iki aggregate da "bu bayi hiç almadı" görür, her ikisi de kota kontrolünden geçer. Bayi limitinin iki katı alabilir.

campaignPrice bayi tarafından override edilebiliyorsa — Bayi `body.price = 1` göndererek 1 TL'ye ürün satın alabilir. Kampanya fiyatı her zaman server-side GarageSaleService'ten gelmelidir.

Bu üçü önce raporla.
