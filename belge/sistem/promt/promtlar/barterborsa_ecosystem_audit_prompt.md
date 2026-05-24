# BarterBorsa — Ekosistem Modülü Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. BarterBorsa ekosistem modülünü vendor modülü içine gömdün — ayrı modül açmadın. `ekosistem.md` dosyasında kendi notlarını bıraktın: 9 açık sorun kayıtlı, hangilerinin kritik olduğunu biliyorsun. Şimdi geri dönüp sistemi hem mevcut `ekosistem.md` notlarına hem de koda bakarak değerlendiriyorsun. Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Modülün yeri:** Ekosistem kodu `apps/backend/src/modules/vendor/` içinde yaşıyor — ayrı bir `barterborsa/` veya `ecosystem/` modülü yok.

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (number yasak)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)
- Business logic: domain entity'de

**İlgili dosyalar:**

```
apps/backend/src/modules/vendor/
  domain/
    entities/brand-ecosystem.entity.ts      ✅ AggregateRoot
    events/ecosystem-created.event.ts       ✅ tanımlı ama consumer yok
  application/
    commands/
      create-ecosystem.{command,handler}.ts
      add-ecosystem-member.{command,handler}.ts
      remove-ecosystem-member.{command,handler}.ts
      update-ecosystem-settings.{command,handler}.ts
    queries/
      get-my-ecosystem.{query,handler}.ts
      get-ecosystem-dashboard.{query,handler}.ts
      get-ecosystem-audit-logs.{query,handler}.ts
  infrastructure/persistence/
    schemas/
      brandEcosystem.schema.ts
      ecosystemAuditLog.schema.ts
    repositories/
      mongo-brand-ecosystem.repository.ts
      mongo-ecosystem-audit-log.repository.ts
  presentation/
    ecosystem.controller.ts
    ecosystem-admin.controller.ts
  middleware/
    01.ecosystem-guard.global.ts
    ecosystemGuard.ts
```

**Mongoose modelleri (vendor.module.ts'de kayıtlı):**  
`Vendor`, `VendorProfile`, `VendorSettings`, `VendorB2BData`, `Company`, `CompanyUser`, `BrandEcosystem`, `EcosystemMembership`, `EcosystemAuditLog`

**Frontend (incele ama dokunma):**  
`composables/useAdminEcosystems.ts` (79 satır, tüm tipler `any`)  
`composables/useVendorEcosystem.ts` (105 satır)  
`components/admin/ecosystems/` (5 bileşen)  
`components/vendor/ecosystem/` (4 bileşen)  
`components/product/form/ProductFormEcosystem.vue` (209 satır)

---

## BarterBorsa İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Aktörler ve Roller

```
Fabrika:
  - Zorunlu olarak APEX tier vendor olmalı
  - Bir vendor yalnızca bir ekosistem kurabilir (tekil)
  - Kendi bayilerini ekosisteme kaydeder
  - Ürünleri yalnızca kendi ekosistemine yükler
  - Bayi hareketlerini izler (Watchtower)
  - MAP (minimum advertised price) fiyat politikası uygular

Bayi:
  - Fabrika tarafından sisteme davet edilir — kendisi kayıt olamaz
  - Bir bayi aynı anda yalnızca bir fabrikanın ekosistemine dahil olabilir
  - Kendi tier'ı başlangıçta CORE, yükseltme fabrika onayına tabi
  - İnternet satış yetkisi varsa tek tıkla BazarX'e yayın yapabilir
  - Ekosistem içinde diğer bayilerle takas yapamaz (§4.5)
```

### Ürün Görünürlük Parametreleri (§4.2)

```typescript
// Listing'e eklenen ekosistem alanları:
visibleTo: 'ALL_DEALERS' | 'SELECTED_DEALERS' | 'NONE'
selectedDealerIds: Types.ObjectId[]   // visibleTo === 'SELECTED_DEALERS' ise
availableFrom?: Date
availableTo?: Date
allowOnlineResale: boolean            // Bayi BazarX'e yayın yapabilir mi?
minMarketPrice?: Types.Decimal128     // MAP (minimum advertised price)
maxOrderQtyPerDealer: number          // Zorunlu, null olamaz
ecosystemId: Types.ObjectId
```

### Watchover (Kota) Mekanizması (§4.3)

```
Sipariş anında:
  SELECT SUM(quantity) FROM ecosystem_orders
    WHERE dealerId = ? AND productId = ? AND status IN ('PENDING','CONFIRMED')
  IF toplamGeçmişAdet + yeniAdet > maxOrderQtyPerDealer
    → DEALER_QUOTA_EXCEEDED (reddedilir)

Smart Cap:
  yeniAdet > havuzStoku * 0.25
  → SMART_CAP_EXCEEDED (tek siparişte %25'ten fazla alınamaz)

Her iki kontrol atomic olmalı — race condition yoksa stok tutarsızlığı oluşur
```

### Garaj Günü (§4.4)

```
Fabrika parametreler belirler:
  discountRate, maxTotalQty, maxQtyPerDealer, startsAt, endsAt

Stok tüketimi atomic ($inc — race condition önlemi):
  GarageSale.soldQty atomically increments
  soldQty >= maxTotalQty → otomatik EXHAUSTED (yeni sipariş reddedilir)
```

### Blind Pool (Kör Havuz)

```
BrandEcosystem.isBlindPool = true (default)

Bayiler birbirinin kimliğini GÖRMEZ:
  get-ecosystem-dashboard response'unda → vendorId maskelenmeli
  TradeOffer response'unda → karşı taraf anonim olmalı
  Listing'de → diğer bayilerin sipariş bilgileri gizlenmeli

Fabrika (owner) → tüm bayileri ve bilgilerini HER ZAMAN görür
(isBlindPool fabrika için geçerli değil — sadece bayiler arası)
```

### Ekosistem İçi Takas Yasağı (§4.5)

```
Aynı ekosistemin bayileri birbirleriyle takas yapamaz.
offers.controller.ts'de kontrol:
  TradeOffer oluşturulmadan önce:
  IF initiator.ecosystemId === receiver.ecosystemId
    → BARTER_NOT_ALLOWED_IN_ECOSYSTEM
```

### MAP (Minimum Advertised Price) ve BazarX Yayın

```
Bayi allowOnlineResale=true olan ürünü BazarX'e tek tıkla yayınlayabilir.
Yayın anında ve sonrasında:
  listing.price < listing.minMarketPrice
  → Fabrika Watchtower'da görmeli (uyarı)
  → Yayın otomatik durdurulabilir (politika seçeneği)
```

### internalCommRate

```
BrandEcosystem.internalCommRate (Decimal128, default 4.0, range 1-20)
Ekosistem içi siparişlerde standart komisyon yerine bu oran kullanılır.
→ checkout.service.ts'de commisssion hesabında dikkate alınmalı
→ Şu an DB'de var ama hiçbir hesaplamada KULLANILMIYOR (Sorun #4)
```

---

## Bilinen Açık Sorunlar (ekosistem.md §AÇIK SORUNLAR tablosu)

Bu 9 sorun belgelenmiş. Her birinin gerçek kodda durumunu doğrula:

| # | Sorun | Belgelenmiş Etki |
|---|---|---|
| 1 | `create-ecosystem.handler.ts` — Entity.create() kullanılmıyor, doğrudan repo.create() | EcosystemCreatedEvent hiç fire edilmiyor |
| 2 | `ecosystem-created.event.ts` — consumer/listener yok | RabbitMQ veya in-process handler eksik |
| 3 | Repository'ler — interface yok, concrete class inject ediliyor | DDD ihlali, test zorluğu |
| 4 | `internalCommRate` — DB'de var ama hesaplamalarda uygulanmıyor | Ekosistem içi komisyon indirimi çalışmıyor |
| 5 | Blind Pool — isBlindPool flag var ama response'larda kimlik gizlenmiyor | Kör havuz gizliliği uygulanmıyor |
| 6 | Ekosistem içi takas yasağı — §4.5 kontrolünün varlığı doğrulanmamış | BARTER_NOT_ALLOWED_IN_ECOSYSTEM kontrolü var mı? |
| 7 | `useAdminEcosystems.ts` — tüm tipler any | Frontend type safety |
| 8 | Vendor ekosistem yönetim sayfası — composable var, page yok | Frontend navigasyonu eksik |
| 9 | Smart Cap — watchtower.service var ama ekosistem bazlı limit kontrolü eksik | %25 cap uygulanmıyor |

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Entity bypass denetimi (Sorun #1 doğrulama):**

- `create-ecosystem.handler.ts` gerçekten `BrandEcosystem.create()` yerine `repo.create()` mu çağırıyor?
- `BrandEcosystem.create()` factory metodu ne döndürüyor? `EcosystemCreatedEvent` domain events listesine ekliyor mu?
- Handler `entity.domainEvents` alıp `eventBus.publishAll()` çağırıyor mu? Hiç yoksa domain event akışı bütünüyle kopuk.
- Diğer handler'lar (`add-member`, `remove-member`, `update-settings`) entity metodlarını kullanıyor mu yoksa hepsi doğrudan repo mu?

**1.2 EcosystemCreatedEvent consumer (Sorun #2 doğrulama):**

- `ecosystem-created.event.ts` — `@EventsHandler(EcosystemCreatedEvent)` decorator'lı bir class var mı? Nerede?
- `vendor.module.ts`'de bu handler providers listesinde mi?
- Event fire edilmese bile, consumer olsaydı ne yapması gerekirdi? (RabbitMQ event publish? Bildirim? Audit?)

**1.3 Repository interface eksikliği (Sorun #3 doğrulama):**

- `IBrandEcosystemRepository` veya `IEcosystemRepository` adında bir interface var mı?
- `MongoBrandEcosystemRepository` handler'lara nasıl inject ediliyor — token string mi, concrete class mı?
- Interface yoksa test nasıl yazılıyor? Mock nasıl yapılıyor?
- `IVendorRepository` gibi bir pattern var mı projede? Varsa neden ekosistem repository'sine uygulanmadı?

**1.4 Modül sınır analizi:**

- Ekosistem kodu `vendor.module.ts`'de yaşıyor. Bu modülün kaç handler'ı, kaç schema'sı, kaç controller'ı var?
- Vendor modülü kaç satır? Ekosistem kodu kaç satır oranını oluşturuyor?
- Ayrı `ecosystem.module.ts` yaratılması gerekiyor mu? Eğer gerekiyorsa migration planını çiz (hangi dosya nereye taşınır).
- `ecosystem-admin.controller.ts` şu an `vendor.module.ts`'de mi? Neden `ecosystem.module.ts`'de değil?

**1.5 Middleware güvenlik denetimi:**

- `01.ecosystem-guard.global.ts` `/barterborsa` rotaları için APEX tier kontrolü yapıyor. Bu middleware her endpoint'i kapsıyor mu?
- `ecosystem.controller.ts`'de APEX tier olmayan bir vendor `/ecosystem/create` endpoint'ini çağırırsa ne oluyor? Handler'da da kontrol var mı, sadece middleware'de mi?
- `ecosystemGuard.ts` `/surplus` rotaları için dış erişim engelliyor — bu doğru yer mi? Catalog modülünün işi değil mi?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Backend ekosistem kodunu tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts" \
  | grep -E "ecosystem|Ecosystem|brandEcosystem|BrandEcosystem|EcosystemAudit" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Frontend composable'larda tara (Sorun #7):

```bash
grep -rn ": any\|as any\|<any>" \
  apps/frontend/composables/useAdminEcosystems.ts \
  apps/frontend/composables/useVendorEcosystem.ts
```

**Adım 3:** Her bulgu için tablo:

| Lokasyon | Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|---|
| backend | get-ecosystem-dashboard.handler.ts | ? | `member: any` | YÜKSEK | `EcosystemMemberView` |
| frontend | useAdminEcosystems.ts | ? | `data: any` | ORTA | `AdminEcosystemDto` |

Risk seviyeleri:
- `KRİTİK`: `internalCommRate` veya `minMarketPrice` Decimal128 yerine number — para hesabı yanlışlaşır
- `YÜKSEK`: Dashboard response `any` — blind pool maskeleme yapılamaz tip güvensiz
- `ORTA`: DTO `any` — validation atlanıyor, yanlış veri DB'ye yazılabilir
- `DÜŞÜK`: Frontend display, cascade riski yok

**Adım 4:** `get-ecosystem-dashboard.handler.ts` response shape'i tipli mi?

Bu handler her üye için şu alanları döndürüyor:
`vendorId, vendorName, tier, trustScore, trustLevel, violationCount, isFrozen, activeListings, recentTradeCount, lastActivityAt`

Bu shape typed mı, yoksa `Record<string, any>` mi? Doğru tip:

```typescript
interface EcosystemMemberView {
  vendorId: string;
  vendorName: string;      // isBlindPool=true ise maskelenmeli: 'VENDOR-****'
  tier: 'CORE' | 'PRIME' | 'ELITE' | 'APEX';
  trustScore: number;
  trustLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT';
  violationCount: number;
  isFrozen: boolean;
  activeListings: number;
  recentTradeCount: number;
  lastActivityAt: Date | null;
}

interface EcosystemDashboardResponse {
  ecosystem: BrandEcosystemDto;
  members: EcosystemMemberView[];    // isBlindPool durumuna göre maskelenir
  summary: {
    avgTrustScore: number;
    frozenCount: number;
    totalActiveItems: number;
    totalTradesLast30: number;
  };
  isOwner: boolean;
}
```

**Adım 5:** `internalCommRate` tip dönüşüm noktaları:

`internalCommRate` `Decimal128` olarak saklanıyor. Eğer herhangi bir yerde komisyon hesabı yapılıyorsa:

```typescript
// Kötü:
const rate = ecosystem.internalCommRate; // Decimal128 olarak gelir
const commission = amount * rate;        // Decimal128 * Decimal128 = hata

// Doğru:
const rateFloat = parseFloat(ecosystem.internalCommRate.toString()) / 100;
const commission = Decimal128.fromString(
  (parseFloat(amount.toString()) * rateFloat).toFixed(2)
);
```

Bu dönüşüm doğru yapılıyor mu? (Eğer `internalCommRate` hiç kullanılmıyorsa bunu da raporla.)

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — visibleTo dallanması:**
```typescript
// Kötü — listing query'sinde:
if (listing.visibleTo === 'ALL_DEALERS') {
  // herkese göster
} else if (listing.visibleTo === 'SELECTED_DEALERS') {
  // selectedDealerIds'i kontrol et
} else if (listing.visibleTo === 'NONE') {
  // gösterme
}
// → MongoDB query'ye nasıl dönüştürülür? Visibility filter utility yaz
```

**Pattern B — isBlindPool maskeleme:**
```typescript
// Muhtemel kötü pattern — dashboard handler'da:
if (ecosystem.isBlindPool && !isOwner) {
  member.vendorId = 'HIDDEN';
  member.vendorName = 'Anonim';
} else {
  // gerçek bilgileri göster
}
// Bu maskeleme gerçekten yapılıyor mu? Yoksa hiç yapılmıyor mu?
// → Mapper pattern ile nasıl ayrıştırılır? Kodu yaz
```

**Pattern C — Tier kontrolü dallanması:**
```typescript
// Middleware'de:
if (vendor.tier !== 'APEX') { throw ForbiddenException }
// Handler'da da aynı kontrol var mı? (duplicate)
// → Guard decorator ile tek noktaya nasıl çekilir?
```

**Pattern D — allowOnlineResale + minMarketPrice kombinasyonu:**
```typescript
// BazarX yayın kontrolünde:
if (!listing.allowOnlineResale) { throw ... }
if (listing.price < listing.minMarketPrice) { throw ... }
// Bu kombinasyon nerede kontrol ediliyor?
// Checkout'ta mı, controller'da mı, hiç yok mu?
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Audit log yazımında hata yutma:**
```typescript
// Kötü — her handler'da:
try {
  await this.auditLogRepo.create({ ... });
} catch (e) {
  // audit log başarısız ama ana işlem devam etti
  // → kim bilecek?
}
// Doğru: audit log başarısız olsa da ana işlemi durdurmama
// ama hatayı Logger.error ile kaydet
```

**Antipattern B — Vendor bulunamamasında generic hata:**
```typescript
// Kötü:
const vendor = await this.vendorRepo.findById(userId);
if (!vendor) throw new Error('vendor not found'); // stack trace kaybı

// Doğru:
if (!vendor) throw new NotFoundException({
  code: 'VENDOR_NOT_FOUND',
  userId,
});
```

**Antipattern C — İki ayrı kontrol arasında race condition:**
```typescript
// add-ecosystem-member.handler.ts'de:
const existing = await vendorRepo.findById(memberVendorId);
if (existing.ecosystemId) { throw ConflictException }
// Sonra:
await vendorRepo.update(memberVendorId, { ecosystemId });
// → İki eş zamanlı istek gelirse ikisi de "ecosystemId yok" görür
// → Atomic findOneAndUpdate ile nasıl çözülür? Kodu yaz
```

**3.3 Sorun #4 — internalCommRate uygulanmıyor (iş kuralı sızıntısı):**

```
Bu sızıntının tam anatomisini çıkar:

1. checkout.service.ts'de komisyon nerede hesaplanıyor?
2. Listing'in ecosystemId'si var mı kontrol ediliyor mu?
3. Varsa BrandEcosystem.internalCommRate alınıyor mu?
4. Alınmıyorsa: hangi satırda bu branch eksik?

Eksik branch kodu:
```typescript
// checkout.service.ts'e eklenmesi gereken:
let commissionRate = standardPlatformRate; // default
if (listing.ecosystemId) {
  const ecosystem = await this.ecosystemRepo.findById(
    listing.ecosystemId.toString()
  );
  if (ecosystem?.internalCommRate) {
    commissionRate = parseFloat(ecosystem.internalCommRate.toString()) / 100;
  }
}
```

**3.4 Sorun #5 — Blind Pool kimlik gizleme eksikliği:**

```
Hangi response'larda bayi kimliği görünüyor ama gizlenmesi gerekiyor?

1. GET /ecosystem/:id/dashboard → her üyenin vendorId + vendorName'i
   → isBlindPool=true ve !isOwner → maskelenmeli

2. GET /surplus (trade pool) → SurplusItem'ın sahibi
   → Kör havuz içindeki ürünlerde sahip kimliği gizlenmeli

3. GET /offers/:id → TradeOffer'da counterpart bilgisi
   → Ekosistem içinde bayi görünmemeli

Her endpoint için: mevcut durum ne, olması gereken ne?
```

**3.5 Sorun #6 — Takas yasağı kontrolü:**

```
offers.controller.ts veya create-trade-offer.handler.ts'de:

grep -n "ecosystemId\|BARTER_NOT_ALLOWED\|ecosystem.*barter\|barter.*ecosystem" \
  apps/backend/src/modules/barter/

Kontrol var mı? Varsa nasıl çalışıyor?
Yoksa tam implementasyonu yaz:
```typescript
// create-trade-offer.handler.ts'e eklenecek:
if (initiatorVendor.ecosystemId && receiverVendor.ecosystemId) {
  if (initiatorVendor.ecosystemId.equals(receiverVendor.ecosystemId)) {
    throw new ForbiddenException({
      code: 'BARTER_NOT_ALLOWED_IN_ECOSYSTEM',
      ecosystemId: initiatorVendor.ecosystemId,
      message: 'Aynı fabrika ekosistemine üye bayiler birbirleriyle takas yapamaz.',
    });
  }
}
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead code tespiti:**

```bash
grep -rn "^export" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts" \
  | grep -E "Ecosystem|ecosystem|BrandEcosystem|EcosystemAudit" \
  | grep -oP '(?<=class |function |const |interface |enum )\w+' \
  | while read name; do
      refs=$(grep -rn "\b$name\b" apps/backend/src/ --include="*.ts" | wc -l)
      [ "$refs" -le 1 ] && echo "POSSIBLE DEAD: $name"
    done
```

Özellikle şunlara bak:
- `EcosystemCreatedEvent` — import eden var mı? Sadece tanımlı ama fire edilmiyor ve consume edilmiyorsa dead code değil, eksik implement.
- `EcosystemMembership` Mongoose modeli — `vendor.module.ts`'de kayıtlı mı? Herhangi bir handler kullanıyor mu?

**4.2 Duplicate tier kontrolü:**

APEX tier kontrolü kaç yerde yapılıyor?

```bash
grep -rn "APEX\|apex\|tier.*APEX\|vendor\.tier" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts"
```

- `01.ecosystem-guard.global.ts`'de mi?
- `create-ecosystem.handler.ts`'de mi?
- `ecosystem.controller.ts`'de mi?
- İkiden fazla yerdeyse: `@ApexGuard()` decorator olarak extract et — kodu yaz.

**4.3 `vendor.module.ts` şişkinlik analizi:**

- Vendor modülünde kaç tane handler var?
- Kaçı `vendor/*` ilgili, kaçı `ecosystem/*` ilgili?
- Ecosystem kodu vendor modülünden çıkarılsa module boundary nasıl kurulur?

Modül bölünme planı (implement etme — sadece planı yaz):
```
vendor.module.ts → VendorModule
ecosystem.module.ts → EcosystemModule
  imports: [VendorModule (exports: IVendorRepository)]
  exports: [EcosystemModule (exports: IBrandEcosystemRepository)]
```

**4.4 `ProductFormEcosystem.vue` (209 satır) analizi:**

Bu bileşen Master Plan §4.2 + §4.3 alanlarını içeriyor. 209 satır tek bileşen için büyük.

- Hangi bölümler ayrı component'a çıkarılabilir?
- `visibleTo` seçim grubu: ayrı `ProductVisibilitySelector.vue`
- `selectedDealerIds` listesi: ayrı `DealerPicker.vue`
- `availableFrom/To` tarih aralığı: ayrı `DateRangePicker.vue`

Her bölünme için: hangi props gerekir, nasıl emit eder?

**4.5 `useAdminEcosystems.ts` strict typing (Sorun #7):**

79 satır composable, tüm tipler `any`. Tam tip tanımlarını yaz:

```typescript
// useAdminEcosystems.ts için gerekli interface'ler:

interface AdminEcosystemMemberDto {
  vendorId: string;
  vendorName: string;
  companyName: string;
  tier: 'CORE' | 'PRIME' | 'ELITE' | 'APEX';
  trustScore: number;
  trustLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT';
  violationCount: number;
  isFrozen: boolean;
  ecosystemId: string;
}

interface AdminEcosystemDto {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  ownerId: string;
  ownerName: string;
  internalCommRate: number;   // frontend'de float — backend Decimal128'den convert edilmiş
  isBlindPool: boolean;
  members: AdminEcosystemMemberDto[];
  memberCount: number;
  activeListingCount: number;
  totalTradesLast30: number;
  auditLogCount: number;
}

interface EcosystemAuditLogDto {
  id: string;
  ecosystemId: string;
  ecosystemName: string;
  vendorId: string;
  vendorName: string;
  action: string;
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
  details: Record<string, unknown>;
  createdAt: string;
}

interface TrustScoreOverrideDto {
  vendorId: string;
  newScore: number;
  reason: string;
}
```

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/.../file.ts:satır` veya `apps/frontend/.../file.ts:satır`
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

1. **KRİTİK** — `internalCommRate` hiç uygulanmıyor (ekosistem içi komisyon çalışmıyor), takas yasağı kontrolü eksik veya bypass edilebilir, `add-ecosystem-member` race condition (iki bayi aynı anda aynı ekosisteme girebilir)
2. **YÜKSEK** — Blind Pool kimlik gizleme yapılmıyor (isBlindPool flag var ama response'da etkisiz), Entity bypass (domain event fire edilmiyor), Repository interface'leri yok
3. **ORTA** — Smart Cap ekosistem bazlı uygulanmıyor, `useAdminEcosystems.ts` tüm tipler `any`, `EcosystemCreatedEvent` consumer yok, middleware duplicate kontrol
4. **DÜŞÜK** — `ProductFormEcosystem.vue` bileşen bölünmesi, Vendor modülü şişkinliği (ecosystem ayrı modül), dead code

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **APEX tier zorunluluğu** — iş kararı, değiştirme
- **`isBlindPool: true` default'u** — iş kararı
- **`internalCommRate` range (1-20)** — iş kararı
- **`maxOrderQtyPerDealer` null olamaz kuralı** — iş kararı
- **§4.5 takas yasağı** — implement et, kuralı değiştirme
- **BrandEcosystem veya EcosystemAuditLog schema field isimleri** — frontend bağımlı
- **`01.ecosystem-guard.global.ts` "admin bypass yok" tasarımı** — kasıtlı, belgelenmiş, bozma
- **audit log severity seviyeleri** — iş kararı (INFO/WARN/HIGH/CRITICAL)
- **vendor.module.ts'den ecosystem.module.ts'e bölünme** — plan yaz, kodu implement etme (büyük refactor, ayrı sprint)

---

## Son Not

BarterBorsa modülünde beş katmanlı bir sorun var:

1. `create-ecosystem.handler.ts` entity bypass → `EcosystemCreatedEvent` hiç fire edilmiyor.
2. Consumer yok → fire edilse de kimse dinlemiyor.
3. `internalCommRate` DB'de kayıtlı ama `checkout.service.ts`'e hiç bağlanmamış → fabrika kurumsal müşterilere özel komisyon vaadi veriyor ama sistem standart oranla çalışıyor.
4. `isBlindPool` DB'de `true` ama response'larda bayi kimliği maskelenmeden dönüyor → blind pool konsepti kırık.
5. Ekosistem içi takas yasağı kontrolü `barter` modülünde var mı belli değil → bayiler isterse takas yapabilir.

Bunların tamamı iş vaatlerini karşılamayan ama sessizce başarısız olan sorunlar — çökme yok, error yok, ama iş modeli fiilen çalışmıyor. Bu beş maddeyi önce raporla.
