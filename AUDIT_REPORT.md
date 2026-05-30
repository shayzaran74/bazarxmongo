# BazarX — Denetim & Düzeltme Raporu

**Tarih:** 2026-05-30 / 2026-05-31
**Branch:** `feat/barter-commission-and-audit-fixes` (remote: `origin` = `bazarxmongo`)
**Commit sayısı:** 5 (+ BazarXGO admin RBAC düzeltmesi: çalışma ağacında, henüz commit'lenmedi)
**Test durumu:** Otomatik test yazılmadı — **manuel test** edilecek.

> Bu rapor, `/audit` ile yapılan üç modül denetimi (Ekosistem + Ticari Takas + Admin/Vendor İzolasyon) ve devamında geliştirilen B2B takas komisyon motorunun özetidir.

---

## 0. Commit Özeti

| Commit | Tip | Konu |
|--------|-----|------|
| `04fba53e` | fix(ecosystem) | Üyelik tek kaynağı, denetim logu, komisyon karşı-taraf doğrulaması |
| `8270f9ca` | fix(barter) | Firma onay duvarı: Company statüsü `APPROVED` + backfill + gerçek kontrol |
| `da016e5f` | feat(barter) | B2B takas komisyon motoru (Faz 1–3c) |
| `1cede24d` | refactor(barter) | createOffer/counterOffer → CommandHandler + getVendorWithCompany DRY |
| `93aee4ab` | docs | Denetim & düzeltme raporu (bu dosya) |
| _(uncommitted)_ | fix(bazarxgo) | Admin RBAC standardize: RolesGuard + `@Roles` + `SUPERADMIN`→`SUPER_ADMIN`. **Not:** bazarxgo modülünün tamamı (~27 dosya) henüz git'te takipsiz WIP; fix dosyada uygulanmış durumda, modül commit'lenince dahil olacak |

---

## 1. Ekosistem (Bayi Ağı) Modülü — `modules/vendor`

### Bulgular & Düzeltmeler

| # | Bulgu | Düzeltme | Önem |
|---|-------|----------|------|
| 1 | **Üyelik split-brain**: üyelik 3 ayrı yerde tutuluyordu (`EcosystemMembership` koleksiyonu, `Vendor.ecosystemId`, `ecosystem.memberIds`) ve senkron değildi | Tek doğruluk kaynağı = **`EcosystemMembership`**. Dashboard, komisyon motoru ve admin controller artık legacy alanlar yerine membership repo'sunu okur | 🔴 Kritik |
| 2 | `MEMBER_ADDED/REMOVED/REACTIVATED` generic AuditLog'a yazılıyordu (ekosistem denetim ekranı bunları görmüyordu) | Artık **`EcosystemAuditLog`**'a `severity` ile yazılır (ölü `auditLogRepo` injection kullanıldı) | 🔴 Yüksek |
| 3 | Komisyon `internalCommRate` tek tarafın ekosistemine bakıp uygulanıyordu | `counterpartyVendorId` + `resolveSharedEcosystemId` → indirim **yalnızca iki taraf aynı ekosistemdeyse** | 🟠 Yüksek |
| 4 | `isBlindPool ?? false` (gizlilik fail-open) | Fail-safe **`?? true`** | 🟠 Orta |
| 5 | `setCommissionRate` domain invariant'ı atlanıyordu | `BrandEcosystem.assertValidCommissionRate` (1–20) statik invariant | 🟠 Orta |
| 6 | Audit-log PK `Date.now()+Math.random()` | `randomUUID()` | 🟡 Düşük |

### Dokunulan dosyalar
`get-ecosystem-dashboard.handler.ts`, `commission-engine.service.ts`, `ecosystem-admin.controller.ts`, `add/remove/update-ecosystem-(member|settings).handler.ts`, `brand-ecosystem.entity.ts`, `mongo-ecosystem-audit-log.repository.ts`

### Uygulanmadı (proje-geneli karar gerektiriyor)
- `StructuredLogger` migrasyonu — bu sınıf kod tabanında **yok**; 174 dosya NestJS `Logger` kullanıyor.
- Ekosistem admin controller'ın DDD ihlali (presentation'da Mongoose + ağır aggregation).

---

## 2. Ticari Takas (Barter) — Firma Onay Duvarı — `modules/barter` + `modules/vendor`

### Bulgular & Düzeltmeler

| # | Bulgu | Düzeltme | Önem |
|---|-------|----------|------|
| 1 | **`ApproveVendorHandler` enum-dışı `'VERIFIED'` yazıyordu** (CompanyStatus = PENDING/APPROVED/REJECTED/SUSPENDED) | `'APPROVED'` (handler + domain `Company.verify()`) | 🔴 Kritik |
| 2 | Barter `getVendorWithCompany` firma statüsünü **hiç kontrol etmiyordu** (sabit `'APPROVED'` döndürüyordu) | Company dökümanı yüklenip `status === 'APPROVED'` doğrulanıyor; createOffer alıcı firmayı da kontrol eder | 🟠 Yüksek |
| 3 | Geçmiş `'VERIFIED'` kayıtları yeni duvara takılacak | **Backfill migration** `2026-05-30-company-verified-to-approved-backfill.ts` (manuel `run()`) | ⚠️ Deploy |
| 4 | 2× `any` (swap-session repo dönüşü, surplus companyMap) | `SwapSessionWithRelations` / `Map<string, ICompany>` | 🟠 Orta |

### Dokunulan dosyalar
`approve-vendor.handler.ts`, `company.entity.ts`, `surplus.controller.ts`, `mongo-swap-session.repository.ts`, yeni migration

---

## 3. B2B Takas Komisyon Motoru (Yeni Özellik) — `modules/barter`

> Master Plan §3/§6. Tamamlanan takastan komisyon tahsilatı. **Tümü `BARTER_COMMISSION_HOLD_ENABLED` bayrağı arkasında — default KAPALI (additive, mevcut akışı değiştirmez).**

### Faz 1 — Hesaplama + Blokaj (HELD)
- accept anında her taraf **aldığı değer (mal + aldığı nakit)** üzerinden kendi tier oranıyla komisyon hesaplanır.
- Komisyon, `sellerId = PLATFORM` ile ayrı **HELD** blokaj olarak alınır (saga telafili).
- `SwapSession` şema + entity + mapper'a komisyon alanları eklendi; `requestedValue` artık persist edilir.

### Faz 2 — Capture / Refund
- Yeni **`CommissionSettlementService`**: tam tamamlanmada `releaseFunds` ile komisyon **PLATFORM'a capture**; iptal/timeout/BUYER_WINS'te **refund**.
- Wiring: `swap-session.scheduler` (auto-release + timeout), `resolve-dispute.handler`, `barter-admin` release.
- `commissionStatus` HELD guard → **idempotent** (çift capture/refund yok).
- `markFirstTransaction` her iki vendor için.

### Faz 3a — Grup Oranı
- Taraflar ortak ekosistemdeyse (**fabrika ↔ bayi**) `internalCommRate` (grup oranı) uygulanır.

### Faz 3b — Kısmi Orantı
- **İSTENMEDİ.** Kabul edilen model: "en son teslimatta komisyon kesilir, kalan teminat bloğu çözülür" → Faz 2'nin davranışı. Arabulucu sonrası hatalı taraftan **tam komisyon** alınır.
- Teknik not: tek hold'da kısmi capture zaten mümkün değil (`transferBetweenAccounts` yalnızca aynı kullanıcının hesap-tipleri arası; platform→vendor transferi yok).

### Faz 3c — Opt-in XP İndirimi
- accept body'sinde `xpToApply` — **yalnızca isteği yapan tarafa** uygulanır.
- §3 guard: XP + grup oranı **aynı işlemde olamaz**.
- XP hatası (yetersiz/ilk işlem) accept'te yüzeye çıkar + teminat geri alınır.
- XP, capture anında `decrementXp` ile **gerçekten düşülür** (sadece capture'da; iptal/timeout'ta düşülmez).

### Domain
- `SwapSession.captureCommission()/refundCommission()` (HELD invariant).
- **Kritik:** mapper `toPersistence` komisyon alanlarını **yazmaz** → scheduler/dispute'taki `save()` çağrıları komisyon statüsünü ezmez (komisyon persist'i hedefli `updateOne` ile).

### Dokunulan/yeni dosyalar
`swapSession.schema.ts`, `accept-trade-offer.(command|handler).ts`, **`commission-settlement.service.ts`** (yeni), `swap-session.scheduler.ts`, `resolve-dispute.handler.ts`, `barter-admin.controller.ts`, `barter.module.ts`, `swap-session.entity.ts`, `swap-session.mapper.ts`, `commission-engine.service.ts`

---

## 4. DDD Refactor — `modules/barter/presentation`

| İş | Sonuç |
|----|-------|
| `createOffer` (~180 satır) | **`CreateTradeOfferCommand/Handler`**'a taşındı; controller delege eder |
| `counterOffer` (~130 satır) | **`CounterTradeOfferCommand/Handler`**'a taşındı (dönüş ham entity olarak korundu) |
| `getVendorWithCompany` (2 kopya) | **`BarterVendorGuardService`**'e çıkarıldı (DRY); iki controller delege eder |

Davranış **bire bir** korundu. Yeni dosyalar: `barter-vendor-guard.service.ts`, `create-trade-offer.(command|handler).ts`, `counter-trade-offer.(command|handler).ts`.

---

## 5. Admin Dashboard & Vendor İzolasyon Denetimi — `modules/*`

> 36 admin controller + vendor-scoped controller'lar (catalog/commerce/inventory/vendor) denetlendi.

### RBAC
- ✅ **36 admin controller'ın 35'i** standart deseni kullanıyor: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN','SUPER_ADMIN')`.
- 🔴 **`bazarxgo-admin.controller.ts`** elle `assertAdmin` kullanıyordu → 3 sorun: (a) `'SUPERADMIN'` typo (kanonik `'SUPER_ADMIN'`) → gerçek SUPER_ADMIN erişemiyordu, (b) `throw new Error` = 500 (403 değil), (c) kırılgan per-metot desen. **DÜZELTİLDİ** (standart guard'a çevrildi). Not: bazarxgo modülü baştan sona takipsiz WIP olduğundan fix ayrı commit'lenmedi; modül commit'lendiğinde düzeltilmiş hâliyle girecek.

### System Settings
- ✅ `settings-admin`: `class-validator` DTO'ları + her `@Put`'ta `AuditLogService.log`.

### User & Vendor Management
- ✅ `ApproveVendorHandler`: durum-makinesi guard'lı + AuditLog.
- 🟡 `wallet-admin` (topup/withdrawal approve/reject): controller'da AuditLog görünmüyor — downstream financial-service loglaması **doğrulanmalı**.

### Analytics
- ✅ `admin-dashboard` rol-korumalı; ağır aggregation/loop yok (servise delege).

### Vendor Veri İzolasyonu (Multi-Tenancy) — ✅ tutarlı ve doğru
- `catalog/update-listing` & `delete-listing`: `listing.vendorId !== vendor.id → Forbidden` (admin bypass).
- `commerce/ship-order-item`: `vendor.id !== order.vendorId → Forbidden`.
- `inventory`: tüm sorgular token'dan gelen `vendor.id` ile scope'lu (`findOne({id, vendorId})`).
- Vendor controller'larında `vendorId` token'dan (`CurrentUser`) alınıyor; body/query'den okuyan 2 yer güvenli (public banner + ekosistem üye-çıkarma).

### Dokunulan dosyalar
`bazarxgo-admin.controller.ts` (RBAC fix — commit bekliyor)

---

## 6. Kalan İşler

### 6.1 Deploy Ön-Koşulları (yayına almadan önce ZORUNLU)
- [ ] Branch'i `main`'e al (sunucu `main` pull ediyor; değişiklikler şu an **`main`'de değil**).
- [ ] `shared-persistence` paketini **build et** (SwapSession şeması değişti; dist'ten derleniyorsa).
- [ ] **Company backfill migration `run()`** çalıştır — yoksa eski onaylı firmalar takas yapamaz.

### 6.2 Komisyonu Aktifleştirmeden Önce
- [ ] `BARTER_COMMISSION_PLATFORM_ACCOUNT_ID` tanımla (geçerli platform cüzdanı).
- [ ] `releaseFunds(sellerId=PLATFORM)` → platforma capture davranışını **financial-service'te teyit et** (varsayıma dayanıyor).
- [ ] `BARTER_COMMISSION_HOLD_ENABLED=true` (test ortamında doğrulandıktan sonra).

### 6.3 Henüz Yapılmadı
- [ ] **BazarXGO modülünü commit'le** — modül baştan sona takipsiz WIP (~27 dosya); admin RBAC fix'i diskte hazır, modül commit'lenince dahil olur.
- [ ] `wallet-admin` topup/withdrawal approve/reject **audit-log doğrulaması** (downstream'de var mı?).
- [ ] **Faz 3c frontend UI** (Nuxt): accept ekranında `xpToApply` girişi + nakit/XP önizlemesi (`POST /commission/preview` kullanılabilir).
- [ ] **Otomatik testler** (manuel test edilecek — talep edilmedi).
- [ ] Ekosistem `getAuditLogs` display fallback'i hâlâ `Vendor.ecosystemId` kullanıyor (Sprint 2'de alan silinince ele alınmalı).
- [ ] Frontend (Nuxt) admin rotalarının `auth-admin` middleware koruması teyidi.
- [ ] `StructuredLogger` ve admin controller DDD borcu (proje-geneli kararlar).

---

## 7. Manuel Test Kontrol Listesi (öneri)

**Admin RBAC:**
- [ ] BazarXGO admin endpoint'lerine ADMIN ve SUPER_ADMIN erişebilmeli; normal vendor/müşteri **403** almalı.

**Firma onay duvarı:**
- [ ] Onaysız firmaya sahip vendor → surplus/teklif oluşturamamalı.
- [ ] Admin vendor onaylayınca Company `APPROVED` olmalı (eski `VERIFIED` kalmamalı → backfill).

**Komisyon (flag açıkken, test ortamı):**
- [ ] Teklif kabul → her iki taraftan teminat + komisyon HELD blokajı.
- [ ] Takas tamamlanınca → komisyon PLATFORM'a, teminat sahibine iade.
- [ ] İptal/timeout → komisyon + teminat iade.
- [ ] Grup (fabrika↔bayi) takasında grup oranı uygulanıyor mu.
- [ ] XP opt-in: bakiye düşüyor mu; grup oranıyla birlikte reddediliyor mu; ilk işlemde reddediliyor mu.

**Refactor (regresyon):**
- [ ] createOffer / counterOffer eskisiyle aynı yanıt/davranış.
- [ ] Ekosistem içi iki bayi takas yapamamalı (BARTER_NOT_ALLOWED_IN_ECOSYSTEM).
