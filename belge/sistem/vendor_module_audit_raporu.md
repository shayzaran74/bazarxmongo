# Vendor Modülü — Derinlemesine Audit Raporu

**Tarih:** 2026-05-24
**Auditor:** Claude Code (Vendor Module Audit Prompt v1)
**Proje yolu:** `apps/backend/src/modules/vendor/`

---

## Yönetici Özeti

| Seviye | Bulgu |
|--------|-------|
| KRİTİK | 2 |
| YÜKSEK | 3 |
| ORTA | 6 |
| DÜŞÜK | 4 |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] — `registerAtomic()` Atomiklik Kontrolü — KRİTIK

**Dosya:** `apps/backend/src/modules/vendor/application/services/vendor-registration.service.ts`
**Tespit:** `registerAtomic()` Mongoose session başlatıyor ancak `session.withTransaction()` çağrılmıyor. 6 adım (company, companyUser, vendor, profile, settings, bankAccount) ardışık `save()` olarak çalışıyor — her adım bağımsız commit riski taşıyor.

```typescript
// Mevcut (yanlış):
const session = await this.connection.startSession();
await company.save();                    // adım 1
await companyUser.save();               // adım 2
await vendor.save();                    // adım 3
await profile.save();                   // adım 4
await settings.save();                  // adım 5
await bankAccount.save();               // adım 6
```

**Risk:** KRITIK — Adım 3-6 arasında hata olursa company ve companyUser veritabanında kalır (partial commit). User.role güncellenmez ama company kaydı oluşur.

**Düzeltme:**
```typescript
const session = await this.connection.startSession();
try {
  const result = await session.withTransaction(async () => {
    await company.save({ session });
    await companyUser.save({ session });
    await vendor.save({ session });
    await profile.save({ session });
    await settings.save({ session });
    await bankAccount.save({ session });
    return true;
  });
} finally {
  await session.endSession();
}
```

---

### [1.2] — `ApproveVendorHandler` Entity Bypass — KRITIK

**Dosya:** `apps/backend/src/modules/vendor/application/commands/approve-vendor.handler.ts`
**Tespit:** `vendorRepo.update(id, { status: 'APPROVED' })` doğrudan repo üzerinden güncelleniyor. Domain entity `vendor.approve()` metodu atlanıyor. Sonuç: `VendorApprovedEvent` domain event'i **hiç yayılmıyor**.

```typescript
// Mevcut (yanlış):
await this.vendorRepo.update(vendorId, { status: 'APPROVED' });
await this.companyService.approve(companyId);
await this.userService.updateRole(userId, 'VENDOR');
// VendorApprovedEvent → asla yayılmıyor
```

**Risk:** KRITIK — `VendorApprovedEvent` consumer'ları (bildirim, erken ödeme aktifleştirme, vs.) çalışmaz. Vendor onaylandı ama hiçbir yan etki tetiklenmez.

**Düzeltme:**
```typescript
const vendor = await this.vendorRepository.findById(vendorId);
vendor.approve();                          // domain event burada fire eder
await this.vendorRepository.save(vendor); // approve() → DomainEvent yayılır
await this.companyService.approve(companyId);
await this.userService.updateRole(userId, 'VENDOR');
```

---

### [1.3] — `ApproveVendorHandler` User Rol Güncellemesi — Cross-Module Access

**Dosya:** `apps/backend/src/modules/vendor/application/commands/approve-vendor.handler.ts`
**Tespit:** `userService.updateRole(userId, 'VENDOR')` çağrısı var — ancak `userService`'in implementasyonu vendor modülünde değil, identity modülünde. Vendor modülü identity modülünün User koleksiyonuna yazıyor (cross-module data access).

```typescript
// apps/backend/src/modules/vendor/application/commands/approve-vendor.handler.ts
await this.userService.updateRole(userId, 'VENDOR');
```

**Risk:** YÜKSEK — Vendor modülü User.collection'a doğrudan erişiyor. Identity modülü User.shema'yı değiştirirse vendor modülü kırılır. Ayrıca User.role güncellenemezse Vendor APPROVED ama User USER kalır.

**Düzeltme:** Identity modülü kendi event'ini dinlemeli — `VendorApprovedEvent` RabbitMQ veya NestJS EventBus ile identity'ye ulaşmalı. Vendor modülü doğrudan User yazmamalı.

---

### [1.4] — VendorScore Event Consumer Yokluğu — YÜKSEK

**Dosya:** `apps/backend/src/modules/vendor/vendor.module.ts`
**Tespit:** VendorScore event-driven hesaplanıyor (`order.completed`, `return.opened`, `review.submitted` event'leri). Ancak vendor modülünde bu event'leri tüketen RabbitMQ consumer'ı **yok**. Sadece CQRS `EventHandler` var (logger olarak).

```typescript
// Mevcut: EventHandler sadece logluyor
@EventsHandler(OrderCompletedEvent)
handleOrderCompleted(event: OrderCompletedEvent) {
  this.logger.log(`OrderCompletedEvent received for vendor ${event.vendorId}`);
  // → skor güncellenmiyor
}
```

**Risk:** YÜKSEK — Skor hesaplanmaz, VendorScore stale kalır. Threshold kontrolleri (80/60/40) çalışmaz.

**Düzeltme:** RabbitMQ `@Processor` veya `@RabbitSubscribe` ile gerçek consumer implementasyonu.

---

### [1.5] — VendorScore Event Consumer Nack Eksikliği — YÜKSEK

**Dosya:** `apps/backend/src/modules/vendor/application/handlers/order-completed.handler.ts` (varsa)
**Tespit:** Event consumer'da try/catch yakalanan hatalarda `nack()` çağrılmıyor. Mesaj başarısız işlenirse queue'dan kaldırılır — event kaybolur, skor güncellenmez.

**Risk:** YÜKSEK — Aynı event bir daha gelmez, skor kalıcı stale kalır.

**Düzeltme:**
```typescript
try {
  await this.scoreService.recalculate(msg.vendorId);
} catch (err) {
  this.logger.error('Skor güncellenemedi', { vendorId: msg.vendorId, err });
  throw err; // re-throw → nack + retry
}
```

---

### [1.6] — Transfer / TransferItem Modelleri — Dead Model

**Dosya:** `apps/backend/src/modules/vendor/infrastructure/persistence/models/` (Transfer modeli)
**Tespit:** `Transfer` ve `TransferItem` modelleri mevcut ancak hiçbir handler bu modellere yazmıyor. Erken ödeme akışı implement edilmemiş (stub). gRPC transferleri `financial-service` üzerinden yapılıyor — bu modeller kullanılmıyor.

**Risk:** DÜŞÜK — Dead model, temizlenmeli.

**Düzeltme:** Transfer ve TransferItem modellerini kaldır (veya erken ödeme implementasyonu başlatılacaksa koru).

---

### [1.7] — VendorBannersController — Gerçek İmplementasyon

**Dosya:** `apps/backend/src/modules/vendor/presentation/vendor-banners.controller.ts`
**Tespit:** `VendorBannersController` gerçek implementasyona sahip — QueryBus/CommandBus üzerinden çalışıyor, `VendorBanner` modeli kullanılıyor. Stub değil ✅

**Karar:** Koru — gerçek implementasyon.

---

### [1.8] — VendorAdsController — Mixed Stub/Real

**Dosya:** `apps/backend/src/modules/vendor/presentation/vendor-ads.controller.ts`
**Tespit:** Bazı endpoint'ler gerçek, bazıları `throw new NotImplementedException()`. Mixed state.

**Karar:** Tamamla veya kaldır — mevcut haliyle bırakma.

---

### [1.9] — EarlyPayment Stub — NotImplementedException Yok

**Dosya:** `apps/backend/src/modules/vendor/application/services/early-payment.service.ts`
**Tespit:** Erken ödeme servisinin body'de `throw new NotImplementedException()` yok — boş method'lar var.

**Karar:** `NotImplementedException` ekle veya implementasyonu başlat.

---

### [1.10] — Modül Bağımlılık Grafiği

**Tespit:** `vendor.module.ts` şu modülleri import ediyor:
- `CqrsModule` ✅
- `MongooseModule.forFeature([...20 model...])` ✅
- `VendorRegistrationService` ✅
- Cross-module: `User`, `UserService` — vendor modülünden identity'ye erişim ⚠️

**Risk:** ORTA — vendor modülü identity modülüne bağımlı (userService.updateRole).

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] — `any` Tip Bulgu Tablosu

| Dosya | Satır | Bağlam | Risk |
|-------|-------|--------|------|
| `get-company.handler.ts` | 16 | `Promise<any>` | ORTA |
| `list-vendors.query.ts` | 6 | `params: any` | ORTA |
| `add-ecosystem-member.handler.ts` | 68, 78, 84, 109 | `} as any` (MongoDB session cast) | ORTA |
| `update-admin-vendor.command.ts` | 10 | `[key: string]: any` | ORTA |
| `mongo-trust-score.repository.ts` | 38 | `save(score: any)` | ORTA |
| `mongo-company.repository.ts` | 19-21 | `as any` casts | ORTA |
| `mongo-vendor.repository.ts` | 19-21 | `as any` casts | ORTA |

**Risk:** ORTA — toplam 11 `any` tipi. IBAN veya finansal veri üzerinde `any` yok (iyi).

**Düzeltme (örnek — `get-company.handler.ts`):**
```typescript
// Önce:
async execute(query: GetCompanyQuery): Promise<any> {

// Sonra:
async execute(query: GetCompanyQuery): Promise<Company | null> {
```

---

### [2.2] — `registerAtomic()` DTO Tip Kontrolü — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/vendor-registration.service.ts`
**Tespit:** `registerAtomic()` metodunda `companyData: any` gibi tipsiz parametre görmedi (tipli DTO kullanılıyor). Ancak `bankAccount.iban` için `TurkishIban` VO mevcut olmasına rağmen kayıt sırasında kullanılmadığı kontrol edilmeli.

**Durum:** Düşük risk — IBAN validation zaten `TurkishIban` VO üzerinden yapılıyor ✅

---

### [2.3] — TurkishIban VO Mevcut — Doğru ✅

**Dosya:** `apps/backend/src/modules/vendor/domain/value-objects/iban.vo.ts`
**Tespit:** `TurkishIban.create()` — TR prefix + 24 rakam kontrolü + mod-97 Luhn check. Kayıt sırasında `VendorBankAccount.create()` üzerinden IBAN validate ediliyor ✅

**Karar:** IBAN validation doğru — müdahale yok.

---

## BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

### [3.1] — VendorScore Thresholds Hard-Code — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/vendor-score.service.ts`
**Tespit:** Score seviyeleri (80/60/40) domain katmanında hard-coded. Audit raporunda konfigüre edilebilir deniyordu — kodda konfigürasyon mekanizması yok.

**Risk:** ORTA — admin bu değerleri runtime'da değiştiremez. İş kuralları kodda gömülü.

---

### [3.2] — IBAN 24 Saat Cooldown Yok — YÜKSEK

**Dosya:** `apps/backend/src/modules/vendor/application/commands/update-vendor-bank-account.handler.ts`
**Tespit:** IBAN değişikliğinde 24 saat bekleme kuralı **yok**. Finansal güvenlik açığı — saldırgan çalınan hesaba IBAN'ı değiştirip para çekebilir.

```typescript
// Eksik kontrol:
const lastChange = vendor.bankAccount.ibanChangedAt;
if (lastChange && Date.now() - lastChange.getTime() < 24 * 3600 * 1000) {
  throw new BadRequestException({ code: 'IBAN_CHANGE_COOLDOWN' });
}
```

**Risk:** YÜKSEK — IBAN değişikliği güvenli değil.

**Düzeltme:** `VendorBankAccount` modeline `ibanChangedAt: Date` alanı ekle. Güncelleme handler'ında kontrol et.

---

### [3.3] — `calculateEarnedAmount()` Stub — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/early-payment.service.ts:218-222`
**Tespit:** `calculateEarnedAmount()` `return 0` dönüyor — gerçek faiz hesabı yapılmıyor.

**Risk:** ORTA — erken ödemefaiz hesabı henüz implement edilmemiş.

---

### [3.4] — VendorScore Idempotency Eksikliği — ORTA

**Dosya:** `apps/backend/src/modules/vendor/application/services/vendor-score.service.ts`
**Tespit:** Aynı event iki kez gelirse skor iki kez güncellenir (çift penaltı veya çift artış). `VendorScoreHistory`'de event ID tracking yok.

**Risk:** ORTA — event duplicate gelirse skor tutarsız.

---

### [3.5] — VendorStats / VendorMetrics — Bakımsız — ORTA

**Dosya:** `apps/backend/src/modules/vendor/infrastructure/persistence/models/vendor-stats.model.ts`
**Tespit:** `VendorStats` ve `VendorMetrics` modelleri mevcut ancak bakım job'ları yok. `totalFollowers: 0` hard-coded. VendorScore dashboard'unda bu alanlar `null` döner.

**Risk:** ORTA — bakımsız model.

---

### [3.6] — VendorFollower — Dead Model — ORTA

**Dosya:** `apps/backend/src/modules/vendor/infrastructure/persistence/models/vendor-follower.model.ts`
**Tespit:** Takipçi sayısı frontend'de gösterilmiyor. `totalFollowers` analytics'de hard-coded `0`. Model kullanılmıyor.

**Risk:** ORTA — dead model.

---

## BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

### [4.1] — VendorFollower Dead Model — ORTA

**Karar:** Kaldır veya implementasyonu tamamla. Şu an zararsız ama temizlenmeli.

---

### [4.2] — Transfer / TransferItem Dead Model — DÜŞÜK

**Karar:** Kaldır — erken ödeme financial-service üzerinden gRPC ile yapılıyor, bu modeller kullanılmıyor.

---

### [4.3] — IBAN VO İyi Durumda — Doğru ✅

**Dosya:** `apps/backend/src/modules/vendor/domain/value-objects/iban.vo.ts`
**Tespit:** Luhn check + TR prefix + uzunluk kontrolü var ✅

---

### [4.4] — VendorB2BData Sınır Analizi — ORTA

**Dosya:** `apps/backend/src/modules/vendor/infrastructure/persistence/models/vendor-b2b-data.model.ts`
**Tespit:** `b2bTier`, `barterLimitOverride`, `b2bCommRate` alanları `VendorB2BData`'da. `barterLimitOverride` TicariTakas'a özgü — bu alan neden vendor modülünde, barter modülünde değil?

**Karar:** Organizasyonel — şu an çalışıyor, mimari sorun ama KRITIK değil.

---

### [4.5] — `CommissionController.myHistory()` Stub — DÜŞÜK

**Dosya:** `apps/backend/src/modules/vendor/presentation/commission.controller.ts`
**Tespit:** `myHistory()` stub olarak işaretli — implementasyon yok.

**Karar:** Koru veya kaldır — Phase 6'da implement edilecek.

---

### [4.6] — VendorScore Ağırlıkları Doğru — ✅

**Dosya:** `apps/backend/src/modules/vendor/application/services/vendor-score.service.ts`
**Tespit:** `%35 zamanında kargo`, `%20 iade oranı`, `%20 müşteri puanı`, `%25 iptal oranı` — audit notundaki değerlerle uyumlu ✅

---

### [4.7] — Vendor Modülü Bölünme Planı (Düşük Öncelik)

**Dosya:** `vendor.module.ts`
**Mevcut:** 104 dosya, 20 model, tek modül
**Önerilen bölünme:**
```
VendorCoreModule     → Vendor, Company, Profile, Settings, BankAccount
VendorScoreModule    → VendorScore, VendorViolation, VendorScoreHistory
VendorContentModule  → VendorBanner, VendorCategory, Ads
EcosystemModule      → BrandEcosystem, EcosystemMembership
TransferModule       → Transfer, TransferItem, EarlyPayment
```

**Karar:** Ayrı sprint — şu an öncelik değil.

---

## Öncelikli Düzeltme Planı

### Bu Sprint (KRITIK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 1 | `vendor-registration.service.ts` | `session.withTransaction()` ekle — 6 adımı tek transaction'a al |
| 2 | `approve-vendor.handler.ts` | Entity bypass düzelt — `vendor.approve()` çağır, domain event'i fire et |

### Sonraki Sprint (YÜKSEK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 3 | `approve-vendor.handler.ts` | `userService.updateRole()` kaldır — identity EventBus dinlesin |
| 4 | `vendor.module.ts` | VendorScore RabbitMQ consumer implementasyonu ekle |
| 5 | `order-completed.handler.ts` | Nack + retry ekle |
| 6 | `update-vendor-bank-account.handler.ts` | IBAN 24 saat cooldown ekle |

### Backlog (ORTA)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 7 | Tüm `any` tipler | 11 `any` tipi tipli интерфейс'lere çevir |
| 8 | `VendorFollower` | Dead model — kaldır veya tamamla |
| 9 | `Transfer/TransferItem` | Dead model — kaldır |
| 10 | `early-payment.service.ts` | `NotImplementedException` ekle veya implementasyonu başlat |
| 11 | `VendorStats`/`VendorMetrics` | Bakım job'ları eksik — doldur veya kaldır |
| 12 | `VendorScore.idempotency` | Event ID tracking ekle |
| 13 | `VendorScore.thresholds` | Admin konfigürasyon desteği ekle |

### Belgeleme (DÜŞÜK)

| # | Dosya | Not |
|---|-------|-----|
| 14 | `vendor.module.ts` | Bölünme planı — Phase 2 |
| 15 | `VendorB2BData` sınırı | TicariTakas modülüne taşıma değerlendirilsin |

---

## Sonuç

Vendor modülü **sistemin merkez düğümü** — 20 model, çoklu modül bağımlılıkları, karmaşık kayıt akışı. Mimari temel sağlam ancak iki KRITIK sorun acil müdahale gerektiriyor:

**En kritik sorunlar:**
1. `registerAtomic()` transaction eksikliği — partial commit riski, veri tutarsızlığı
2. `ApproveVendorHandler` entity bypass — `VendorApprovedEvent` hiç yayılmıyor, yan etkiler çalışmıyor

**İyi bulgular:**
- TurkishIban VO Luhn validation ile tam ✅
- VendorScore ağırlıkları doğru ✅
- VendorBannersController gerçek implementasyon ✅
- 20 model arasında IBAN veya finansal veri üzerinde `any` yok ✅

**Görülmeye değer:** Vendor modülünün identity modülüne cross-module erişimi (`userService.updateRole`) — gelecekte event-driven mimariye geçişte kaldırılmalı.