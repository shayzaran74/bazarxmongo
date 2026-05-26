# Analytics Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Analytics modülü 11 dosya ile sistemin en küçük modüllerinden biri — ama küçük olması sorunsuz olduğu anlamına gelmiyor.

**Önemli bağlam — iki örtüşen sorun hemen göze çarpıyor:**

1. `ListingAnalytic` Mongoose modeli hem `CATALOG` modülünde hem `ANALYTICS` modülünde listeli. `ListingStats` da yalnızca Catalog listesinde görünüyor ama analytics ile overlap mı var bilinmiyor. Advertising audit'te `SideAd` çift modülü buldun — burada `ListingAnalytic` aynı riski taşıyor.

2. `4B: Ecosystem, Analytics, VendorBanners, Ads stub controller'ları ✅` notu var — Analytics controller stub olarak işaretlenmiş. "✅" tamamlandı değil, dosya oluşturuldu anlamına gelebilir.

Analytics modülü özelinde ek risk: Event tracking modüllere yayılmış. `AdCampaignMetric` advertising'de, `ListingAnalytic` catalog'da, `ProductActivity` analytics'de — bunların birbirleriyle örtüşmesi veya hiçbirinin gerçekten yazılmaması durumu tespit edilmeli.

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/analytics/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**Analytics modülünde beklenen modeller (3 adet):**
```
AnalyticsEvent    → Ham event kaydı (kim, ne yaptı, ne zaman, nerede)
ListingAnalytic   → Listing bazlı izleme (view, click, conversion) — CATALOG'da da var!
ProductActivity   → Ürün aktivite özeti (trending, arama sıralaması, stok hareketi)
```

**Catalog modülünde de listelenen:**
```
ListingAnalytic   → ⚠️ CATALOG mongoose model listesinde de var
ListingStats      → Catalog'a ait mi, analytics'e mi?
```

**Stub notu:**
`4B: Ecosystem, Analytics, VendorBanners, Ads stub controller'ları ✅`

**Advertising modülünde ayrı metrik:**
```
AdCampaignMetric  → Reklam kampanya metrikleri — analytics modülüyle overlap?
```

---

## Analytics İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Analytics Ne İzlemeli?

```
Kullanıcı davranış eventleri:
  PAGE_VIEW       → Hangi sayfa görüntülendi (listing, category, home)
  LISTING_VIEW    → Listing detay sayfası açıldı
  LISTING_CLICK   → Listing kartına tıklandı (liste sayfasından)
  SEARCH          → Arama yapıldı (query, filtreler, sonuç sayısı)
  ADD_TO_CART     → Sepete eklendi
  CHECKOUT_START  → Ödeme sayfasına geçildi
  PURCHASE        → Sipariş tamamlandı
  QR_SCAN         → QR tarandı (GO modülü)

Vendor dashboard metrikleri:
  Listing görüntülenme sayısı (son 7, 30, 90 gün)
  Tıklama oranı (CTR: click / view)
  Dönüşüm oranı (purchase / view)
  Favori eklenme sayısı
  Ortalama görüntülenme süresi (varsa)

Platform admin metrikleri:
  Günlük aktif kullanıcı (DAU)
  En çok aranan terimler
  En fazla görüntülenen kategoriler
  Dönüşüm hunisi analizi
```

### AnalyticsEvent Schema Beklentisi

```typescript
interface AnalyticsEventDocument {
  _id: Types.ObjectId;
  
  eventType: AnalyticsEventType;   // enum — any değil
  userId?: Types.ObjectId;         // anonim kullanıcı için null
  sessionId: string;               // anonim takip için
  
  // Context
  listingId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  searchQuery?: string;
  
  // Device/Location
  userAgent?: string;
  ip?: string;
  platform?: 'web' | 'mobile' | 'app';
  
  // Metadata
  metadata?: Record<string, unknown>;  // any değil
  
  createdAt: Date;
}

type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'LISTING_VIEW'
  | 'LISTING_CLICK'
  | 'SEARCH'
  | 'ADD_TO_CART'
  | 'CHECKOUT_START'
  | 'PURCHASE'
  | 'QR_SCAN'
  | 'QR_VIEW';
```

### Performans Kriterleri

```
Analytics event yazımı ana akışı yavaşlatmamalı:
  → Asenkron yazım: BullMQ queue veya fire-and-forget
  → Event başarısız olsa ana işlem durmamalı
  → Yüksek hacim: batch insert tercih edilmeli

Vendor dashboard sorguları:
  → MongoDB aggregation (index'li)
  → Sonuçlar Redis'te cache'lenmeli (TTL: 5-15 dakika)
  → Her request'te live aggregation: performans sorunu
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Analytics controller stub durumu:**

`4B stub` olarak işaretlenmiş. Gerçek durumu raporla:

| Dosya | Endpoint var mı? | Body dolu mu? | Module'da kayıtlı mı? | Karar |
|---|---|---|---|---|
| analytics.controller.ts | ? | ? | ? | Kaldır/Koru/Tamamla |
| analytics-admin.controller.ts | ? | ? | ? | Kaldır/Koru/Tamamla |

**1.2 `ListingAnalytic` çift modül sorunu:**

`ListingAnalytic` hem catalog hem analytics listesinde görünüyor.

```bash
grep -rn "ListingAnalytic\|ListingAnalyticSchema" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\."
```

- Kaç farklı `*.schema.ts` dosyasında tanımlı?
- Kaç modülde `MongooseModule.forFeature()` ile kayıtlı?
- `ListingStats` (sadece catalog listesinde) ile `ListingAnalytic` farkı ne?
  - `ListingStats`: genel istatistik (favori, view sayısı snapshot)
  - `ListingAnalytic`: zaman serisi event kaydı
  - Bu ayrım kodda var mı?
- Doğru ownership: analytics modülü sahip olsun, catalog import etsin
- Yanlış yapı: her iki modül bağımsız şema tanımlıyor → çakışan koleksiyon

**1.3 `ProductActivity` vs `ListingAnalytic` overlap:**

```bash
grep -rn "ProductActivity\|productActivity" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|schema\|module"
```

- `ProductActivity` nerede yazılıyor? Hangi event tetikliyor?
- `ListingAnalytic` ile veri alanları örtüşüyor mu?
- İkisi birbirinin yerine mi kullanılıyor?

**1.4 `AdCampaignMetric` (advertising) vs `AnalyticsEvent` (analytics) overlap:**

```
AdCampaignMetric:   kampanya impressions + clicks
AnalyticsEvent:     listing view + click

Çakışma senaryosu:
  Kullanıcı öne çıkan (FEATURED) bir listing'e tıkladı.
  → AnalyticsEvent: LISTING_CLICK yazıldı mı?
  → AdCampaignMetric: clicks artırıldı mı?
  → Her ikisi de mi? Sadece biri mi? Hiçbiri mi?
```

**1.5 Event yazım mekanizması:**

```
Kontrol listesi:
  □ AnalyticsEvent nerede yazılıyor?
    - Her listing view'da doğrudan DB'ye mi? (yüksek hacimde bottleneck)
    - BullMQ queue'ya mı? (asenkron — önerilen)
    - Fire-and-forget: ana akış etkilenmiyor mu?
  □ Batch insert: birden fazla event aynı anda insert edilebiliyor mu?
  □ Yüksek hacim: 1000 eş zamanlı kullanıcı → 1000 event/sn → MongoDB insert kapasitesi?
```

**1.6 Modül bağımlılık grafiği:**

- `analytics.module.ts` hangi modüllere bağımlı?
- Catalog modülü analytics'e bağımlı mı (listing view için)?
- Commerce modülü analytics'e bağımlı mı (purchase event için)?
- Event tracking cross-cutting concern — ayrı bir interceptor veya decorator mi?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm analytics klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/analytics/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| analytics.service.ts | ? | `event: any` | YÜKSEK | `AnalyticsEventDto` |
| track-event.handler.ts | ? | `metadata: any` | ORTA | `Record<string, unknown>` |

Risk seviyeleri:
- `YÜKSEK`: `eventType` `any` → bilinmeyen event tipi yazılır, sorgular bozulur
- `ORTA`: `metadata` `any` → serbest alan, tip kontrolü yok ama crash riski düşük
- `DÜŞÜK`: Response shape, display-only

**Adım 3:** `AnalyticsEvent.eventType` enum mı, string mi?

```typescript
// Kötü:
eventType: string;  // "listing_view" veya "LISTING_VIEW" veya "ListingView" — tutarsız

// Doğru:
eventType: AnalyticsEventType; // enum, tip güvenli

// Kontrol: tüm event yazım noktalarında aynı string mi kullanılıyor?
grep -rn "eventType.*:\|'LISTING_VIEW'\|\"listing_view\"\|'page_view'\|\"PAGE_VIEW\"" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\."
```

**Adım 4:** `metadata` field tipi:

```typescript
// Kötü:
metadata: any;

// Doğru — tip güvenli ama esnek:
metadata?: Record<string, unknown>;

// Daha iyi — discriminated union:
type AnalyticsMetadata =
  | { eventType: 'LISTING_VIEW'; referrer: string; timeOnPage?: number }
  | { eventType: 'SEARCH'; query: string; filters: string[]; resultCount: number }
  | { eventType: 'PURCHASE'; orderId: string; totalAmount: string };
```

**Adım 5:** Vendor dashboard aggregation dönüş tipi:

```typescript
// Aggregation sonuçlarının doğru tipleri:
interface ListingAnalyticsDto {
  listingId: string;
  period: '7d' | '30d' | '90d';
  totalViews: number;
  totalClicks: number;
  ctr: number;              // clicks / views
  conversionRate: number;   // purchases / views
  favoritesAdded: number;
}

interface VendorAnalyticsDashboard {
  period: string;
  listings: ListingAnalyticsDto[];
  topListing: ListingAnalyticsDto;
  totalRevenue: string;    // Decimal128.toString()
  summary: {
    totalOrders: number;
    avgOrderValue: string;
    repeatCustomerRate: number;
  };
}
```

Bu tipler tanımlı mı?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — eventType dallanması:**
```typescript
// Kötü — track handler'da:
if (dto.eventType === 'LISTING_VIEW') {
  await ListingAnalytic.updateOne({ ... }, { $inc: { views: 1 } });
} else if (dto.eventType === 'LISTING_CLICK') {
  await ListingAnalytic.updateOne({ ... }, { $inc: { clicks: 1 } });
} else if (dto.eventType === 'PURCHASE') {
  await ListingAnalytic.updateOne({ ... }, { $inc: { conversions: 1 } });
}
// → Strategy/handler pattern: her eventType kendi handler'ı
// event dispatcher:
const handlers: Record<AnalyticsEventType, IEventHandler> = {
  LISTING_VIEW: new ListingViewHandler(listingAnalyticRepo),
  LISTING_CLICK: new ListingClickHandler(listingAnalyticRepo),
  PURCHASE: new PurchaseEventHandler(listingAnalyticRepo),
};
await handlers[dto.eventType]?.handle(dto);
```

**Pattern B — platform dallanması:**
```typescript
// Kötü:
if (headers['user-agent'].includes('Mobile')) { platform = 'mobile'; }
else if (headers['user-agent'].includes('App')) { platform = 'app'; }
else { platform = 'web'; }
// → UserAgentParser utility:
function detectPlatform(userAgent: string): 'web' | 'mobile' | 'app' {
  if (/BazarXApp/.test(userAgent)) return 'app';
  if (/Mobile/.test(userAgent)) return 'mobile';
  return 'web';
}
```

**Pattern C — aggregation period dallanması:**
```typescript
// Kötü:
if (period === '7d') {
  startDate = subDays(new Date(), 7);
} else if (period === '30d') {
  startDate = subDays(new Date(), 30);
} else if (period === '90d') {
  startDate = subDays(new Date(), 90);
}
// → Period map:
const PERIOD_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
const startDate = subDays(new Date(), PERIOD_DAYS[period] ?? 30);
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Ana akışı bloke eden event yazımı:**
```typescript
// Kötü — listing controller'da:
@Get(':id')
async getListing(@Param('id') id: string) {
  const listing = await this.queryBus.execute(new GetListingQuery(id));
  await this.analyticsService.trackEvent({ // await burada tehlikeli
    eventType: 'LISTING_VIEW',
    listingId: id,
  }); // yavaşlarsa veya fail ederse listing response gecikmesi
  return listing;
}

// Doğru — fire-and-forget:
@Get(':id')
async getListing(@Param('id') id: string) {
  const listing = await this.queryBus.execute(new GetListingQuery(id));
  // fire-and-forget: await yok, hata yutulur ama loglanır
  this.analyticsService.trackEvent({ eventType: 'LISTING_VIEW', listingId: id })
    .catch(err => this.logger.warn('Analytics track failed', err));
  return listing;
}
```

**Antipattern B — Aggregation'da index olmadan full scan:**
```typescript
// Kötü — index yoksa:
await AnalyticsEvent.aggregate([
  { $match: { vendorId: new Types.ObjectId(vendorId), createdAt: { $gte: startDate } } },
  { $group: { _id: '$listingId', views: { $sum: 1 } } }
]);
// { vendorId, createdAt } compound index olmadan full scan
// → Index öneri: { vendorId: 1, createdAt: -1, eventType: 1 }
```

**Antipattern C — Redis cache olmadan live aggregation:**
```typescript
// Kötü — her vendor dashboard request'inde:
const result = await AnalyticsEvent.aggregate([...bigPipeline]);
// 1000 vendor × her 5 saniyede refresh = sürekli aggregation yükü

// Doğru:
const cacheKey = `vendor:${vendorId}:analytics:${period}`;
const cached = await this.redis.get(cacheKey);
if (cached) return JSON.parse(cached);
const result = await AnalyticsEvent.aggregate([...]);
await this.redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 dk cache
return result;
```

**Antipattern D — Anonim kullanıcı tracking eksikliği:**
```typescript
// Analytics event için userId zorunlu yapılmışsa:
// → Login olmayan kullanıcıların listing view'ları kayıt edilmiyor
// → Conversion funnel analizi eksik (anonim → kayıt → satın alma)
// Doğru: sessionId ile anonim takip, userId opsiyonel
```

**3.3 Vendor analytics yetkilendirme:**

```
Vendor kendi listinglerinin analitiğini görüyor — başkasının değil.
Kontrol listesi:
  □ GET /vendors/me/analytics → sadece o vendor'ın listing ID'leri filtreleniyor mu?
  □ Admin GET /admin/analytics → tüm vendor'lar görülebiliyor mu?
  □ Vendor A, Vendor B'nin analytics endpoint'ine erişirse ne olur?
    (listingId ile doğrudan istek)
  □ Aggregation sorgusuna always vendorId filtresi ekleniyor mu?
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Üç modelin gerçek kullanım durumu:**

```bash
for model in AnalyticsEvent ListingAnalytic ProductActivity; do
  echo "=== $model yazılıyor ==="
  grep -rn "$model\.\(create\|insertMany\|updateOne\|findOneAndUpdate\|\\\$inc\)" \
    apps/backend/src/ --include="*.ts" | grep -v "schema\|module\|\.spec\." | head -5
  echo "=== $model okunuyor ==="
  grep -rn "$model\.\(find\|findOne\|aggregate\)" \
    apps/backend/src/ --include="*.ts" | grep -v "schema\|module\|\.spec\." | head -5
done
```

Her model için:
- Yazılıyor mu? (insert/update)
- Okunuyor mu? (find/aggregate)
- İkisi de yok → dead model → sil

**4.2 Stub handler envanteri:**

```bash
grep -rn "NotImplementedException\|not.*implemented\|TODO\|FIXME\|throw.*new.*Error\(''\)" \
  apps/backend/src/modules/analytics/ \
  --include="*.ts"
```

Stub olan her handler için: body'yi oku, gerçekten boş mu?

**4.3 Event kaynakları tam listesi:**

```bash
grep -rn "trackEvent\|analyticsService\|AnalyticsEvent\.\(create\|insertMany\)\|analyticsQueue\|analytics.*queue" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\." \
  | awk -F: '{print $1}' | sort | uniq
```

Hangi modüllerden analytics event yazılıyor? Tüm kaynakları listele:
- Catalog (listing view)?
- Commerce (purchase)?
- GO/menu (QR scan)?
- Search?
- Hiçbiri?

**4.4 Index analizi:**

Analytics sorgular için zorunlu index'ler var mı?

```bash
grep -rn "index\|createIndex\|Schema.*index" \
  apps/backend/src/modules/analytics/ \
  --include="*.ts"
```

Beklenen index'ler:
```javascript
// AnalyticsEvent için:
{ vendorId: 1, createdAt: -1 }           // vendor dashboard
{ listingId: 1, createdAt: -1 }          // listing bazlı rapor
{ eventType: 1, createdAt: -1 }          // event tipi bazlı
{ createdAt: 1 }                         // TTL index (eski eventler silinsin)

// ListingAnalytic için:
{ listingId: 1, date: -1 }              // günlük aggregation
```

TTL index var mı? Analytics eventlerin 90 gün sonra otomatik silinmesi performans açısından önemli.

**4.5 `analytics.module.ts` sağlık kontrolü:**

```bash
cat apps/backend/src/modules/analytics/analytics.module.ts
```

- Providers listesi: kaç handler, kaç servis?
- Imports: catalog modülü import ediliyor mu? (ListingAnalytic için)
- Exports: başka modüller analytics'ten ne kullanıyor?
- Module küçükse (11 dosya) vendor modülüne merge edilmesi daha mı mantıklı?

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/analytics/path/to/file.ts:satır`
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

1. **KRİTİK** — `ListingAnalytic` çift modül (iki modül aynı koleksiyona yazıyorsa veri tutarsızlığı), Vendor yetkilendirme eksikliği (Vendor A, Vendor B'nin analytics'ini görebilir), Ana akışı bloke eden event yazımı (listing response gecikmesi)
2. **YÜKSEK** — `eventType` string yerine enum (tutarsız event isimleri, sorgu başarısızlığı), Dead model tespiti (schema var, hiç yazılmıyor), Index eksikliği (aggregation full scan)
3. **ORTA** — Redis cache eksikliği (live aggregation yükü), Anonim tracking eksikliği, stub controller boot hatası riski
4. **DÜŞÜK** — TTL index eksikliği, eventType dallanması handler pattern'e taşınması, platform detection utility

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **Hangi eventlerin takip edileceği** — iş kararı (ürün ekibi kararı)
- **Dashboard period seçenekleri (7d/30d/90d)** — iş kararı
- **Analytics verinin GDPR/KVKK kapsamı** — hukuki konu, teknik değil
- **AdCampaignMetric** — advertising modülüne ait, analytics'e taşıma önerme
- **ClickHouse veya başka OLAP** — büyük mimari karar, MongoDB ile devam

---

## Son Not

Analytics modülünün üç temel sorusu var ve bunların yanıtı kodda:

**Herhangi bir event gerçekten yazılıyor mu?** 3 model var — `AnalyticsEvent`, `ListingAnalytic`, `ProductActivity`. Eğer hiçbiri hiçbir handler'dan yazılmıyorsa, analytics modülü boş bir şema koleksiyonudur. Bu önce öğrenilmeli.

**`ListingAnalytic` sahipliği belirsiz.** Catalog modülünde de listelenmiş. İki modül aynı koleksiyona yazıyorsa sorgu sonuçları tutarsız olur. Bir modül eksik field ile insert edebilir, diğeri farklı field bekleyebilir.

**Vendor analytics yetkilendirmesi** — Küçük bir modülde bu çok kolay atlanır. `GET /vendors/me/analytics?listingId=BASKASININ_ID` isteği gönderilirse ne döner?

Bu üçü önce raporla.
