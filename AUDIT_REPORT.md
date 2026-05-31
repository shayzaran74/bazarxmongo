# BazarX — Denetim & Düzeltme Raporu

**Tarih:** 2026-05-30 / 2026-05-31
**Branch:** `feat/barter-commission-and-audit-fixes` (remote: `origin` = `bazarxmongo`)
**Commit sayısı:** 14
**Test durumu:** Otomatik test yazılmadı — **manuel test** edilecek.

> Bu rapor, `/audit` ile yapılan denetimler (Ekosistem, Ticari Takas, Admin/Vendor İzolasyon, BazarXGO) + B2B takas komisyon motoru + BazarXGO yemek-teslimat dikeyinin özetidir.

---

## 0. Commit Özeti

| Commit | Tip | Konu |
|--------|-----|------|
| `04fba53e` | fix(ecosystem) | Üyelik tek kaynağı, denetim logu, komisyon karşı-taraf doğrulaması |
| `8270f9ca` | fix(barter) | Firma onay duvarı: Company statüsü `APPROVED` + backfill + gerçek kontrol |
| `da016e5f` | feat(barter) | B2B takas komisyon motoru (Faz 1–3c) |
| `1cede24d` | refactor(barter) | createOffer/counterOffer → CommandHandler + getVendorWithCompany DRY |
| `93aee4ab` | docs | Denetim & düzeltme raporu (bu dosya) |
| `8d5186dd` | docs | Admin/Vendor izolasyon denetimi bölümü |
| `b0acf7f9` | feat(bazarxgo) | Backend yemek-teslimat dikeyi (takipsizdi) + ödeme settlement + kupon doğrulama + admin RBAC + şemalar |
| `1acc31ed` | chore(bazarxgo-mobile) | Mobil uygulama versiyon kontrolüne alındı (DENETLENMEDİ) |
| `6cde48d1` | feat(bazarxgo) | Sipariş iptal+refund endpoint'i, restoran payout hesabı, kupon kullanım limiti |
| `b25d8811` | docs | BazarXGO iptal/payout/kupon-limit ek düzeltmeleri |
| `cf7c8e3b` | fix(financial) | **Faz 1.5:** `HoldFundsRequest` proto'suna `sellerId=7` → capture doğru hesaba (BazarXGO + barter komisyon) |
| `a360af25` | feat(bazarxgo) | **Faz 2:** escrow `reason` → GO'da B2B komisyon kesilmez; `GoCommissionService`; restoran `ownerUserId`; hakediş hesabı persist |
| `afc6a7ab` | feat(bazarxgo) | **Faz 3:** `TransferBetweenUsers` gRPC + `GoPayoutScheduler` batch hakediş (platform→restoran) |

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

## 6. BazarXGO (Yemek-Teslimat) Modülü — Denetim & Düzeltme — `modules/bazarxgo`

> Modül app.module'a wire'lı (canlı) ama git'te tamamen takipsizdi (~34 backend dosya + 4 şema). Denetlendi, kritik bulgular düzeltildi, version control'e alındı (`b0acf7f9`). Mobil app ayrı, denetlenmeden alındı (`1acc31ed`).

### 🔴 Ödeme settlement (DÜZELTİLDİ)
- **Bulgu:** `place-order` `holdFunds` ile müşteri parasını bloke ediyor ama modülde **hiç** `releaseFunds`/`refundFunds` yoktu → teslimatta restoran ödenmiyor, iptalde iade yok, **müşteri parası kalıcı bloke**.
- **Çözüm:** `sellerId = BAZARXGO_PLATFORM_ACCOUNT_ID` ile capture edilebilir blokaj; yeni `GoOrderSettlementService` (DELIVERED→capture, CANCELLED→refund); `advance-status` + scheduler wiring; `settlementStatus` alanı (HELD/CAPTURED/REFUNDED, idempotent).

### 🟠 Kupon doğrulama bypass (DÜZELTİLDİ)
- **Bulgu:** `place-order` kuponu yalnızca `findByCode` ile uyguluyordu — `isActive`/minOrder/case kontrolü yoktu (yalnızca ayrı `validate-coupon`'da) → inaktif/süresi geçmiş kupon geçebiliyordu.
- **Çözüm:** place-order'a `toUpperCase` + `isActive` + kupona özel `minOrderAmount` doğrulaması eklendi (validate-coupon ile parite).

### ➕ Ek düzeltmeler (`6cde48d1`)
- **Sipariş iptali:** `POST /go/orders/:id/cancel` + `CancelGoOrderHandler` (sahiplik + entity.cancel + refund). Dormant refund yolu artık tetiklenebilir.
- **Restoran payout:** `IGoRestaurant.payoutAccountId`; capture hedefi `payoutAccountId ?? PLATFORM`.
- **Kupon limiti:** `usageLimit`/`usageCount` + `incrementUsage`; place-order & validate-coupon limit kontrolü.

### 💰 Hakediş Mimarisi — `bazarxgoplan.md` uygulandı (Faz 1.5 / 2 / 3)
> Detaylı tasarım + kararlar `bazarxgoplan.md`'de. Mimari: **Seçenek B** (platform tek hold → batch payout). Seçenek A (çift hold) negatif-hold + otomatik çift-komisyon + orderId-unique nedeniyle elendi.

- **🔴 Faz 1.5 (`cf7c8e3b`) — proto `sellerId` bug'ı:** `HoldFundsRequest`'te `sellerId` tanımsızdı → gRPC wire'da düşürüyor → tüm hold'lar `sellerId=''` → capture boş hesaba. **BazarXGO + barter komisyon ikisini birden bozuyordu.** Her iki proto'ya `sellerId=7` eklendi.
- **Faz 2 (`a360af25`):** escrow'a `reason` taşındı; `release-escrow` `GO_ORDER`'da otomatik B2B tier komisyonu **kesmiyor** (platform tutarın tamamını alır). `GoCommissionService` (`subtotal × GO_COMMISSION_RATE=0.15`, kupon platform-finanse → taban yalın subtotal). `GoRestaurant.ownerUserId/goCommissionRate`; place-order'da `restaurantPayoutAmount`/`platformFeeAmount` persist; teslimatta `payoutStatus=PENDING`.
- **Faz 3 (`afc6a7ab`):** yeni `TransferBetweenUsers` gRPC primitifi (user→user, idempotent); `GoPayoutScheduler` (günlük 04:00, `GO_PAYOUT_DISPUTE_WINDOW_DAYS=3` geçmiş, CAPTURED+PENDING siparişlerde platform→restoran transfer → `payoutStatus=PAID`).
- **Faz 4 (kapsam dışı):** gerçek kurye dispatch + `deliveryFee` kurye dağıtımı.

### ✅ İyi olanlar
Fiyatlama tamamen Decimal.js (float yok) · RBAC (admin RolesGuard'a çevrildi, order auth'lu, public read'ler `@Public`) · 0 `any`, 0 `console` · DDD katmanları temiz · audit log · domain state machine.

---

## 7. Kalan İşler

### 7.1 Deploy Ön-Koşulları (yayına almadan önce ZORUNLU)
- [ ] Branch'i `main`'e al (sunucu `main` pull ediyor; değişiklikler şu an **`main`'de değil**).
- [ ] `shared-persistence` + `financial-service` + `backend` **build/restart** (proto `sellerId`/`TransferBetweenUsers` + escrow/GO şemaları değişti).
- [ ] **Company backfill migration `run()`** çalıştır — yoksa eski onaylı firmalar takas yapamaz.

### 7.2 Komisyonu Aktifleştirmeden Önce
- [x] ~~`releaseFunds(sellerId=PLATFORM)` → platforma capture~~ — `cf7c8e3b` (Faz 1.5) ile proto `sellerId` eklendi; capture artık doğru hesaba gider.
- [x] ~~`BARTER_COMMISSION_PLATFORM_ACCOUNT_ID` / `BAZARXGO_PLATFORM_ACCOUNT_ID` tanımla~~ — admin cüzdan ID'si ile `.env`'lere eklendi (kullanıcı).
- [ ] `BARTER_COMMISSION_HOLD_ENABLED=true` (test ortamında doğrulandıktan sonra).

### 7.3 Henüz Yapılmadı
- [x] ~~BazarXGO: sipariş iptal+refund endpoint'i, restoran payout alanı, kupon kullanım limiti~~ → `6cde48d1`.
- [x] ~~BazarXGO hakediş mimarisi (proto fix + komisyon ayrımı + batch payout)~~ → `cf7c8e3b`/`a360af25`/`afc6a7ab` (bazarxgoplan.md Faz 1.5/2/3).
- [x] ~~`wallet-admin` approve/reject audit-log~~ — DOĞRULANDI: `ProcessWalletRequestHandler`/`ProcessWithdrawalHandler` zaten `TOPUP_*`/`WITHDRAWAL_*` log'luyor (controller delege ediyor).
- [ ] **BazarXGO restoran onboarding:** restoran `ownerUserId`/`payoutAccountId` DEĞERLERİNİ doldur (alan hazır; boşsa hakediş PENDING birikir, para kaybolmaz). Restoran cüzdanları mevcut olmalı.
- [ ] **BazarXGO mobil app denetlenmeli** (`apps/bazarxgo-mobile`, ~95 dosya — sadece version control'e alındı).
- [ ] **Faz 3c frontend UI** (Nuxt): accept ekranında `xpToApply` girişi + nakit/XP önizlemesi (`POST /commission/preview` kullanılabilir).
- [ ] **BazarXGO Faz 4:** gerçek kurye dispatch + `deliveryFee` kurye dağıtımı.
- [ ] **Otomatik testler** (manuel test edilecek — talep edilmedi).
- [ ] Ekosistem `getAuditLogs` display fallback'i hâlâ `Vendor.ecosystemId` kullanıyor (Sprint 2'de alan silinince ele alınmalı).
- [ ] Frontend (Nuxt) admin rotalarının `auth-admin` middleware koruması teyidi.
- [ ] `StructuredLogger` borcu (proje-geneli karar). Admin controller DDD borcu: **content/settings** çözüldü (bkz. §9); diğer modüller bekliyor.

---

## 8. Manuel Test Kontrol Listesi (öneri)

**BazarXGO:**
- [ ] Sipariş ver → müşteriden `total` bloke edilir (`settlementStatus=HELD`).
- [ ] Sipariş DELIVERED'a ulaşınca → blokaj platforma capture (`CAPTURED`); fon bloke kalmaz.
- [ ] İnaktif/süresi geçmiş kupon place-order'da reddedilmeli; kupona özel minOrder altı reddedilmeli.

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

---

## 9. Content / System Settings Modülü — Denetim & Düzeltme — `modules/content`

> `/audit content` denetimi. Public (`settings.controller.ts`) + admin (`settings-admin.controller.ts`) ayar uçları incelendi; 3 fazda düzeltildi. **Davranış public uçta birebir korundu**, admin uçta yalnızca additive iyileştirmeler yapıldı.

### Bulgular & Düzeltmeler

| # | Bulgu | Düzeltme | Önem |
|---|-------|----------|------|
| 1 | **Defaults drift**: `HOMEPAGE_DEFAULTS` ve `BAZARX_GO_DEFAULTS` public/admin controller'larda farklıydı (örn. `siteName: 'BazarX'` vs `''`; admin'de kupon/kategori dizileri tanımsız) → DB boşken ön yüz ile panel uyuşmuyordu | **Tek kaynak** `settings.defaults.ts`. `HOMEPAGE_DISPLAY_DEFAULTS` (ortak görsel) + `HOMEPAGE_ADMIN_DEFAULTS` (= ortak + `autoApprove*`/`shippingTiers`). `BAZARX_GO_DEFAULTS` tek sabit (diziler dahil) | 🔴 Kritik |
| 2 | `BazarxGoCouponDto.icon?: any` (Zero-Tolerance ihlali) | `@IsOptional() @IsString() icon?: string` | 🔴 Type Safety |
| 3 | **DDD ihlali**: her iki controller presentation katmanında doğrudan `Model<ISystemSetting>` + `Connection` enjekte ediyordu (kardeş feature'lar CQRS+Repository kullanırken) | `ISystemSettingRepository` soyutlaması + `MongoSystemSettingRepository`; okuma/yazma+audit mantığı **Query/Command handler'lara** taşındı; controller yalnızca bus'a delege eder | 🟠 Yüksek |
| 4 | `ecosystem` query param validasyonsuz (keyfi key okuma) | `EcosystemQueryDto` + `@IsIn(['bazarx','ticaritakas'])` whitelist (public + admin) | 🟡 Orta |
| 5 | Lokal `AuthenticatedUser` interface controller'da tekrar tanımlıydı | Paylaşılan **`@barterborsa/shared-nest` → `AuthenticatedUser`** tipi oluşturuldu ve import edildi | 🟡 Orta |
| 6 | `ShippingTierDto`'da `max > min` cross-field kontrolü yoktu | Custom `@IsGreaterThan('min')` doğrulayıcısı | 🟡 Düşük |

### Yeni / dokunulan dosyalar
**Yeni (application/settings):** `settings.defaults.ts`, `settings.dtos.ts`, `settings.queries.ts`, `settings.commands.ts`, `settings-query.handlers.ts`, `settings-command.handlers.ts`
**Yeni (domain/infra):** `domain/repositories/system-setting.repository.interface.ts`, `infrastructure/persistence/mongo-system-setting.repository.ts`
**Yeni (shared):** `packages/shared/shared-nest/src/types/authenticated-user.ts` (+ `index.ts` export)
**Değişen:** `presentation/settings.controller.ts`, `presentation/settings-admin.controller.ts`, `content.module.ts`

### Doğrulama
- `tsc --noEmit` (backend): yeni/değişen dosyalarda **0 hata, 0 `any`**. (Tek hata `bazarxgo/mongo-go-order.repository.ts`'te — **bu denetimden önce mevcut**, takipsiz WIP modülü, bu işle ilgisiz.)
- Public `/settings/homepage` ve `/settings/bazarx-go` yanıt şekli birebir korundu; admin uçta defaults artık tutarlı (additive).

### Uygulanmadı (proje-geneli karar)
- `StructuredLogger` migrasyonu — sınıf kod tabanında yok (§1 ile aynı durum). Operasyonel loglama eklenmedi; audit logging (AuditLogService) zaten mevcut ve handler'lara taşındı.

### Ek: `AuthenticatedUser` tipi tüm backend'de tekilleştirildi ✅
- Tüm backend controller'larındaki **63 lokal `AuthenticatedUser` tanımı** (64 kopya; `return.controller.ts`'te 2) kaldırılıp paylaşılan `@barterborsa/shared-nest → AuthenticatedUser` import'una çevrildi.
- Tüm lokal tanımlar paylaşılan tipin **subset**'iydi (ekstra alan yok) ve hiçbir dosya tipi başka bir controller'dan import etmiyordu → davranış riski yok.
- Doğrulama: `tsc --noEmit` (backend) **0 hata**.
