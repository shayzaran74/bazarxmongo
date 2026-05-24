# Vendor Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Vendor modülünü kasıtlı olarak monolitik tuttun — 104 dosya, 20 Mongoose modeli, 7 alt alan tek `vendor.module.ts` altında. Bu kararın gerekçesini biliyorsun: Vendor, Company, Ecosystem ve B2BData birbirinden ayrılması zor veri bağımlılıkları taşıyor. `registerAtomic()` bunu en iyi özetliyor: tek Mongoose session'da company + vendor + profile + settings + bank account oluşturuluyor. Şimdi bu büyük modülü hem mimari hem kalite hem de güvenlik açısından değerlendiriyorsun.

**Önemli bağlam:** Önceki audit sprint'lerinde bu modüle dışarıdan bağımlı kodlar incelendi. `barter-admin.controller.ts`'de `VendorB2BData` düzeltmesi yapıldı (Decimal128). `checkout.service.ts`'de vendor tier'ına göre komisyon hesabı var. `EcosystemMembership` unique index `{ dealerId: 1 }` ile vendor'a tek ekosistem kısıtı getiriliyor. Bunları biliyorsun.

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/vendor/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · pnpm workspaces  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (number yasak — `VendorBankAccount`, `EarlyPayment`, `Transfer` için kritik)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)
- Business logic: domain entity'de

**Mongoose modelleri (20 adet):**  
`Vendor`, `VendorProfile`, `VendorSettings`, `VendorBankAccount`, `VendorStats`, `VendorMetrics`, `VendorFollower`, `VendorBanner`, `VendorCategory`, `VendorB2BData`, `Company`, `CompanyUser`, `BrandEcosystem`, `EcosystemMembership`, `EcosystemAuditLog`, `Transfer`, `TransferItem`, `VendorScore`, `VendorViolation`, `VendorScoreHistory`

**Alt alanlar:**
```
Vendor        — satıcı hesabı, onay akışı, rol, tier
Company       — şirket bilgisi, CompanyUser ilişkisi
Ecosystem     — BrandEcosystem, EcosystemMembership (önceki audit'te incelendi)
Brand         — (barter ve catalog modülleriyle overlap var)
Banner/Ad     — VendorBanner, reklam stub'ları
EarlyPayment  — ⬜ implement edilmemiş
VendorScore   — event-driven puan sistemi
```

---

## Vendor İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Kayıt Akışı (registerAtomic)

```
POST /vendors/apply-atomic → VendorRegistrationService.registerAtomic()
  TEK Mongoose session'da:
    1. Company oluştur (status: PENDING)
    2. CompanyUser oluştur (userId → companyId bağlantısı)
    3. Vendor oluştur (status: PENDING, companyId bağlı)
    4. VendorProfile oluştur
    5. VendorSettings oluştur (default: acceptingOrders: true, holidayMode: false)
    6. VendorBankAccount oluştur (IBAN zorunlu — TR + 24 rakam)
  Herhangi bir adım başarısız → tüm session rollback
  Kayıt sonrası: admin onayı bekleniyor (PENDING)
```

### Admin Onay Akışı

```
PUT /admin/vendors/:id/approve → ApproveVendorHandler
  → Vendor.status = APPROVED
  → Company.status = APPROVED
  → User.role = 'VENDOR' (identity modülüne event veya doğrudan güncelleme)
  → Event yayıyor (ne event? nereye? RabbitMQ mı, in-process mi?)

PUT /admin/vendors/:id/reject → RejectVendorHandler
  → Vendor.status = REJECTED
  → Gerekçe zorunlu

Onay sonrası:
  Vendor listing oluşturabilir
  Vendor ürün ekleyebilir
  Vendor erken ödeme talep edebilir (⬜ implement edilmemiş)
```

### VendorScore (Satıcı Puanlama)

```
Hesaplama: event-driven (RabbitMQ)
  Sipariş tamamlandığında → zamanında kargo %35
  İade açıldığında → iade oranı %20
  Yorum geldiğinde → müşteri puanı %20
  İptal olduğunda → iptal oranı %25

Puan kademeleri:
  80-100 → İyi (normal)
  60-79  → Uyarı (bildirim)
  40-59  → Kritik (yeni ürün ekleme kısıtlanır)
  0-39   → Askıya alındı (satış durdurulur, admin incelemesi)

3 iş günü itiraz hakkı (VendorViolation.appealDeadline)
Puan Buybox skorunu doğrudan etkiler (%30 ağırlık)
```

### VendorB2BData (TicariTakas Tier)

```
b2bTier: 'CORE' | 'PRIME' | 'ELITE' | 'APEX'
barterLimitOverride: Decimal128  ← admin override
b2bCommRate: number              ← B2B komisyon oranı

Admin: PATCH /admin/barter/user/:id → VendorB2BData güncelleme
  (barter-admin audit'te düzeltildi: Decimal128 artık doğru)
```

### EarlyPayment (Erken Ödeme — IMPLEMENT EDİLMEMİŞ)

```
⬜ Stub controller: early-payment.controller.ts
⬜ Stub service:    early-payment.service.ts

İş kuralları (implement edilmeli):
  - Onaylı siparişlerin maks %80'i erken çekilebilir
  - Faiz: (vadeGünü - bugün) × günlük %0.05 (admin'den konfigüre edilebilir)
  - Minimum: 500 ₺
  - Günde 1 talep (aynı gün tekrar yapılamaz — Redis veya DB kontrolü)
  - Onay → financial-service gRPC transfer
```

### Transfer / TransferItem

```
Transfer ve TransferItem modelleri mevcut.
Bunlar ne için? Erken ödeme transferi mi, B2B transfer mi?
→ Kodu oku ve iş amacını tespit et
```

### IBAN Validasyonu

```
TR + 24 rakam (toplam 26 karakter)
VendorBankAccount.iban — format ve Luhn kontrolü yapılıyor mu?
Hem kayıt anında hem de güncelleme anında validate edilmeli
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 `registerAtomic()` gerçekten atomic mi?**

Bu servis `VendorRegistrationService` içinde. Şunları doğrula:

```
Kontrol listesi:
  □ `mongoose.startSession()` + `session.withTransaction()` kullanılıyor mu?
  □ Tüm 6 adım (company, companyUser, vendor, profile, settings, bankAccount)
    aynı session'a geçiriliyor mu?
  □ Session dışı bir çağrı var mı? (external API, Redis yazımı vb.)
  □ Kayıt başarılı ama event publish başarısız olursa ne oluyor?
    (partial commit + event loss riski)
  □ Idempotency: aynı kullanıcı iki kez kayıt olursa ne olur?
    (e-posta unique index var mı Vendor koleksiyonunda?)
```

**1.2 `ApproveVendorHandler` event yayma mekanizması:**

```
  □ Event nereye gidiyor? RabbitMQ exchange mi, NestJS EventBus mi?
  □ `User.role = 'VENDOR'` güncellemesi nerede yapılıyor?
    - Identity modülünde event consumer var mı?
    - Doğrudan User koleksiyonuna yazılıyor mu? (cross-module data access)
    - Hiç yapılmıyor mu? (User hâlâ USER rolünde kalıyor)
  □ Onay event'i başarısız olursa Vendor.status APPROVED ama User.role USER kalır →
    vendor davranışı bozulur. Compensating action var mı?
```

**1.3 `vendor.module.ts` şişkinliği:**

- Kaç handler, kaç servis, kaç controller kayıtlı?
- Ecosystem kodunun vendor modülünde yaşaması (önceki audit notu) hâlâ devam ediyor mu?
- `providers` listesinde kayıtlı ama hiç inject edilmeyen servis var mı?
- `imports` listesinde kullanılmayan modül var mı?
- Modülü makul alt modüllere bölme planı yaz (implement etme — sadece plan):

```
önerilen bölünme:
  VendorCoreModule    → Vendor, Company, Profile, Settings, BankAccount
  VendorScoreModule   → VendorScore, VendorViolation, VendorScoreHistory
  VendorContentModule → VendorBanner, VendorCategory, Ad stub'lar
  EcosystemModule     → BrandEcosystem, EcosystemMembership (önceki audit)
  TransferModule      → Transfer, TransferItem, EarlyPayment
```

**1.4 VendorBanner ve Ad stub controller'ları:**

- `4B Ecosystem, Analytics, VendorBanners, Ads stub controller'ları ✅` olarak işaretlenmiş. Bu controller'ların body'si gerçekten dolu mu yoksa stub mu?
- Stub olarak kayıtlı controller'lar `vendor.module.ts`'de provider olarak var mı? Varsa NestJS boot'ta inject hatası oluşuyor mu?
- Her stub için durum: **kaldır** (hiçbir şey yok), **koru** (routing var, `throw new NotImplementedException()`), **tamamla** (kritik path üzerinde)

**1.5 Transfer / TransferItem modeli amacı:**

- Bu iki model ne için kullanılıyor? Hangi handler yazıyor, hangi endpoint okuyor?
- Erken ödeme akışıyla bağlantısı var mı?
- `financial-service` gRPC transferleriyle overlap var mı?
- Dead model mi, yoksa aktif kullanımda mı?

**1.6 Modül bağımlılık grafiği:**

- `vendor.module.ts` dışarıya ne export ediyor?
- `commerce.module.ts` vendor'dan ne kullanıyor? (`IVendorRepository` mi, doğrudan Vendor Mongoose model mi?)
- `barter.module.ts` vendor'dan ne kullanıyor?
- Cross-module data access var mı? (Bir modülün başka modülün Mongoose model'ine doğrudan erişmesi)

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm vendor klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| vendor-registration.service.ts | ? | `companyData: any` | KRİTİK | `CreateCompanyDto` |
| approve-vendor.handler.ts | ? | `event: any` | YÜKSEK | `VendorApprovedEvent` |

Risk seviyeleri:
- `KRİTİK`: IBAN verisi `any` — banka hesabı yanlış kaydedilebilir; `barterLimitOverride` Decimal128 yerine number — finansal hesap hatası
- `YÜKSEK`: VendorScore hesabında `any` — puan yanlış hesaplanır, vendor haksız kısıtlanabilir
- `ORTA`: Request DTO `any` — validation atlanıyor
- `DÜŞÜK`: İzole scope, cascade riski yok

**Adım 3:** `VendorRegistrationService.registerAtomic()` içindeki tüm DTO'lar tipli mi?

```typescript
// Doğru tip tanımları:
interface RegisterVendorAtomicDto {
  userId: Types.ObjectId;
  company: {
    name: string;
    taxNumber: string;               // TC Vergi No: 10 rakam
    taxOffice: string;
    address: string;
    city: string;
    phone: string;
  };
  vendorType: 'COMMERCE' | 'RESTAURANT' | 'MARKET' | 'SERVICE';
  bankAccount: {
    iban: string;                    // TR + 24 rakam
    accountHolder: string;
    bankName: string;
  };
  restaurantProfile?: RestaurantProfileDto; // vendorType === 'RESTAURANT' ise
}
```

**Adım 4:** `VendorScore` event consumer'larında tip güvensizliği:

VendorScore event-driven hesaplanıyor. RabbitMQ'dan gelen event payload'ı tipli mi?

```typescript
// Doğru event tipler:
interface OrderCompletedEvent {
  orderId: string;
  vendorId: string;
  shippedAt: Date;
  deliveredAt: Date;
  promisedDeliveryAt: Date;    // SLA kontrolü için
}

interface ReturnOpenedEvent {
  orderId: string;
  vendorId: string;
  isVendorFault: boolean;      // vendor kaynaklı mı? iade %20 etkiler
  reason: string;
}

interface ReviewSubmittedEvent {
  listingId: string;
  vendorId: string;
  rating: number;              // 1-5
}
```

**Adım 5:** `VendorBankAccount.iban` validation:

```typescript
// IBAN validasyonu için Value Object:
class TurkishIban {
  private constructor(private readonly value: string) {}
  
  static create(raw: string): TurkishIban {
    const normalized = raw.replace(/\s/g, '').toUpperCase();
    const pattern = /^TR\d{24}$/;
    if (!pattern.test(normalized)) {
      throw new BadRequestException({ code: 'INVALID_IBAN_FORMAT' });
    }
    // Mod-97 Luhn check (isteğe bağlı ama önerilir)
    return new TurkishIban(normalized);
  }
  
  toString(): string { return this.value; }
}
```

Bu VO mevcut mu? Yoksa IBAN validation nerede, nasıl yapılıyor?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Vendor status dallanması:**
```typescript
// Kötü — handler veya servis'te:
if (vendor.status === 'PENDING') { ... }
else if (vendor.status === 'APPROVED') { ... }
else if (vendor.status === 'REJECTED') { ... }
else if (vendor.status === 'SUSPENDED') { ... }
// → Vendor entity'de state metodu olmalı:
// vendor.isApproved(), vendor.canListProduct(), vendor.canEarlyPay()
```

**Pattern B — VendorType dallanması:**
```typescript
// checkout.service.ts veya listing handler'ında:
if (vendor.vendorType === 'RESTAURANT') { ... }
else if (vendor.vendorType === 'COMMERCE') { ... }
// → Strategy pattern: her VendorType için ayrı behavior
```

**Pattern C — VendorScore kademe dallanması:**
```typescript
// Kötü — score service'te:
if (score >= 80) { status = 'GOOD'; }
else if (score >= 60) { status = 'WARNING'; }
else if (score >= 40) { status = 'CRITICAL'; }
else { status = 'SUSPENDED'; }
// → VENDOR_SCORE_LEVELS sabiti + scoreToStatus() fonksiyonu:
const VENDOR_SCORE_LEVELS = {
  GOOD:      { min: 80, max: 100, action: 'NONE' },
  WARNING:   { min: 60, max: 79,  action: 'NOTIFY' },
  CRITICAL:  { min: 40, max: 59,  action: 'RESTRICT_LISTING' },
  SUSPENDED: { min: 0,  max: 39,  action: 'SUSPEND_SALES' },
} as const;
```

**Pattern D — IBAN format kontrolü:**
```typescript
// Kötü — handler'da inline regex:
if (!iban.startsWith('TR')) { throw ... }
if (iban.length !== 26) { throw ... }
if (!/^\d+$/.test(iban.slice(2))) { throw ... }
// → TurkishIban Value Object'e taşı (Bölüm 2 Adım 5'teki gibi)
```

**Pattern E — EarlyPayment eligibility kontrolü (implement edilmemiş ama tasarla):**
```typescript
// Eligibility kontrol zinciri:
if (vendor.status !== 'APPROVED') { throw ... }
if (totalEligible < 500) { throw ... }            // min 500 ₺
if (todayAlreadyRequested) { throw ... }          // günde 1 talep
if (requestedAmount > totalEligible * 0.8) { throw ... } // maks %80
// → EarlyPaymentEligibilityService'e extract et
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — registerAtomic'te session rollback eksikliği:**
```typescript
// Kötü:
async registerAtomic(dto: RegisterVendorAtomicDto) {
  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      // 6 adım...
    });
    // Sonra session dışı işlem:
    await this.notificationService.send(email); // başarısız olursa?
  } catch (err) {
    // session rollback oldu ama notification kuyruğu yarım kaldı
    throw err;
  }
}
// Doğru: session-dışı yan etkileri (notification, event publish)
// withTransaction'dan SONRA, try/catch içinde ayrıca handle et
```

**Antipattern B — ApproveVendorHandler'da event-DB tutarsızlığı:**
```typescript
// Kötü:
await this.vendorRepo.update(id, { status: 'APPROVED' });
await this.eventBus.publish(new VendorApprovedEvent(id)); // başarısız olursa?
// Vendor APPROVED ama User.role hâlâ USER
// Doğru: outbox pattern veya event-last (DB → event, event başarısız → retry)
```

**Antipattern C — VendorScore event consumer'da sessiz hata:**
```typescript
// Kötü:
@RabbitSubscribe({ exchange: 'orders', routingKey: 'order.completed' })
async handleOrderCompleted(msg: any) {
  try {
    await this.scoreService.recalculate(msg.vendorId);
  } catch {
    // skor güncellenmedi ama queue'ya nack gönderilmedi
    // → aynı event bir daha gelmez → puan kalıcı olarak stale
  }
}
// Doğru: hata durumunda nack + dead-letter queue
```

**Antipattern D — IBAN değişikliğinde 24 saat bekleme kontrolü:**
```typescript
// IBAN değişikliği finansal güvenlik kuralı:
// Son IBAN değişikliğinden 24 saat geçmeden yeni IBAN kabul edilmemeli
// Bu kontrol var mı? Yoksa implement et:
const lastChange = vendor.bankAccount.ibanChangedAt;
if (lastChange && Date.now() - lastChange.getTime() < 24 * 3600 * 1000) {
  throw new BadRequestException({ code: 'IBAN_CHANGE_COOLDOWN' });
}
```

**3.3 VendorScore güvenilirlik analizi:**

```
Event-driven score hesabı çalışıyor mu? Şunları kontrol et:

1. RabbitMQ consumer'ları vendor modülünde register edilmiş mi?
   (vendor.module.ts'de MessageBroker consumer'ları var mı?)

2. Score recalculation idempotent mi?
   Aynı event iki kez gelirse skor iki kez mi azalır?
   VendorScoreHistory'de event ID kaydı var mı?

3. Score güncellemesinde VendorScore + VendorScoreHistory atomic mi?
   İkisi ayrı write ise VendorScore güncellendi ama history kayıt edilmedi riski var

4. Puan 0-39'a düşünce Vendor.status otomatik SUSPENDED oluyor mu?
   Yoksa admin manuel müdahale mi gerekiyor?
   Otomatik oluyorsa: aktif sipariş varken suspend ne yapar?
```

**3.4 Business rule sızıntısı:**

- `vendor.isApproved()` veya `vendor.canListProduct()` gibi domain metodları var mı? Yoksa `vendor.status === 'APPROVED'` kontrolü kaç handler'da tekrar ediyor?
- IBAN format validasyonu DTO'da mı, entity'de mi, her ikisinde mi?
- VendorScore threshold'ları (80/60/40) sabit mi, admin'den konfigüre edilebilir mi?
- EarlyPayment faiz oranı (%0.05/gün) nerede tutuluyor? Hard-code mu, konfigüre edilebilir mi?

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Stub controller ve servis envanteri:**

`4B Ecosystem, Analytics, VendorBanners, Ads stub controller'ları ✅` notu var. Gerçek durumu raporla:

| Controller/Servis | Body var mı? | Module'da kayıtlı mı? | Karar |
|---|---|---|---|
| VendorBannersController | ? | ? | Kaldır / Koru / Tamamla |
| AdsController (vendor) | ? | ? | Kaldır / Koru / Tamamla |
| early-payment.controller.ts | Stub | ? | `NotImplementedException` ekle |
| early-payment.service.ts | Stub | ? | Implement et / Kaldır |

**4.2 Dead model tespiti:**

20 Mongoose modeli var. Her biri için kimin yazdığını, kimin okuduğunu kontrol et:

```bash
# Her model için referans sayısı:
for model in VendorStats VendorMetrics VendorFollower Transfer TransferItem; do
  echo "=== $model ==="
  grep -rn "$model" apps/backend/src/ --include="*.ts" | grep -v schema | wc -l
done
```

Özellikle şunlara bak:
- `VendorStats` vs `VendorMetrics` — ikisi aynı şey mi?
- `VendorFollower` — takip sistemi var mı? Frontend'de gösteriliyor mu?
- `Transfer` / `TransferItem` — erken ödeme mi, B2B transfer mi, ikisi de değil mi?

**4.3 Duplicate vendor validasyonu:**

`Vendor.status === 'APPROVED'` kontrolü kaç handler'da tekrar ediyor?

```bash
grep -rn "status.*APPROVED\|APPROVED.*status\|vendor\.status\|isApproved" \
  apps/backend/src/modules/vendor/ \
  --include="*.ts"
```

Tekrar eden her kontrol için: `@VendorApprovedGuard()` decorator olarak nasıl extract edilir? Kodu yaz.

**4.4 `vendor.module.ts` provider listesi analizi:**

```bash
# vendor.module.ts'deki providers listesini bul
grep -A 200 "providers:" apps/backend/src/modules/vendor/vendor.module.ts | head -100
```

Kayıtlı provider sayısı kaç? Her provider için:
- Handler mı, servis mi, repository mi?
- Başka bir provider tarafından inject ediliyor mu?
- Hiç inject edilmiyorsa: dead provider

**4.5 `VendorB2BData` vs `VendorProfile` overlap analizi:**

`VendorB2BData` `b2bTier`, `barterLimitOverride`, `b2bCommRate` tutuyor.  
`VendorProfile` genel vendor profil bilgisi tutuyor.  
`Vendor` ana kayıt.

Bu üçü arasındaki sınır doğru mu? Özellikle:
- `b2bTier` — Vendor entity'sinde `tier` field'ı da var mı? Çakışıyor mu?
- `barterLimitOverride` — Bu neden VendorB2BData'da, TicariTakas'a özgü bir alan değil mi?
- Vendor onayı APPROVED olduğunda VendorB2BData otomatik oluşturuluyor mu? Yoksa admin manuel mi oluşturuyor?

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

1. **KRİTİK** — `registerAtomic()` partial commit + event loss (vendor kaydı tamamlansın ama User.role güncellenmez → vendor sisteme giremez), IBAN `any` tipi (banka hesabı yanlış kaydı), `ApproveVendorHandler` event-DB tutarsızlığı (retry yok)
2. **YÜKSEK** — VendorScore event consumer nack eksikliği (skor kalıcı stale kalır), Score recalculation idempotency eksikliği (aynı event iki kez gelirse çift penaltı), IBAN 24 saat cooldown kontrolü
3. **ORTA** — Vendor status dallanması domain entity'ye taşınmalı, stub controller'ların `NotImplementedException` eklemeleri, dead model tespiti (VendorStats vs VendorMetrics vs VendorFollower)
4. **DÜŞÜK** — Vendor modülü bölünme planı (implement etme), VendorB2BData sınır analizi, dead provider temizliği

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **`registerAtomic()` transaction yaklaşımı** — doğru karar, atomikliği bozmadan iyileştir
- **VendorScore ağırlıkları (%35/%25/%20/%20)** — iş kararı
- **VendorScore threshold'ları (80/60/40)** — iş kararı, konfigüre edilebilir yap ama değiştirme
- **EarlyPayment faiz oranı (%0.05/gün)** — iş kararı, konfigüre edilebilir yap ama değiştirme
- **`VendorType` enum değerleri** — delivery ve GO modülleri bağımlı
- **`b2bTier` enum değerleri (CORE/PRIME/ELITE/APEX)** — ecosystem ve barter modülleri bağımlı
- **EcosystemMembership unique index `{ dealerId: 1 }`** — önceki audit kararı, bozma
- **vendor.module.ts'i gerçekten alt modüllere böl** — sadece plan yaz (büyük refactor, ayrı sprint)
- **VendorBanner ve Ad stub controller'larını implement et** — bu sprint değil

---

## Son Not

Vendor modülü sistemin merkez düğümü. Kimlik servisi (identity), ticaret servisi (commerce), takas (barter), ekosistem (barterborsa) hepsi vendor'a bağımlı. Bu modüldeki bir hata zincir etkiyle yayılır:

`registerAtomic()` partial commit → User.role güncellenmez → vendor paneline giremez → müşteri desteğine döner.

`ApproveVendorHandler` event'i kaybolur → vendor APPROVED ama hiç bildirim alamaz, sistemi kullanamaz — bunu kimse fark etmez.

VendorScore event consumer nack göndermez → sipariş tamamlandı event'i işlenmedi → puan güncellenmedi → vendor haksız yere SUSPENDED kademe'ye geçer — itiraz süreci başlar.

Bu üçü önce. Geri kalanı sonra.
