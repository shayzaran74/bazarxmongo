# BazarX Kapsamlı Denetim Özet Raporu

**Tarih:** 22 Mayıs 2026  
**Toplam Commit:** 7 (6 denetim + 1 iyileştirme)  
**Toplam Bulgu:** 31 (12 Kritik · 10 Yüksek · 9 Orta/Düşük)  
**Durum:** Tüm bulgular kapatıldı ✅ · Tüm önerilen adımlar tamamlandı ✅

---

## 1. Güvenlik Testi

**Commit:** `a7fab855`

| Risk | Bulgu | Dosya | Durum |
|------|-------|-------|-------|
| 🔴 KRİTİK | Path Traversal — `subPath` query param `path.resolve()` içine sanitize edilmeden giriyordu | `media/infrastructure/local-storage.adapter.ts` | ✅ Whitelist + çift sınır kontrolü |
| 🟠 YÜKSEK | 5xx bilgi sızıntısı — `exception.message` client'a dönüyordu | `common/filters/all-exceptions.filter.ts` | ✅ Production'da generic mesaj |
| 🟡 ORTA | `forbidNonWhitelisted: false` — DTO dışı field'lar kabul ediliyordu | `main.ts` | ✅ `true` yapıldı |
| 🟡 ORTA | CSRF sabit token — `'nuxt-bff-csrf-exempt'` hardcoded | `frontend/server/api/auth/csrf.get.ts` | ✅ `crypto.randomBytes(32)` ile gerçek token |
| 🟡 DÜŞÜK | CORS — `X-CSRF-Token` header eksik | `main.ts` | ✅ Eklendi |
| 🟡 DÜŞÜK | `console.error` frontend'de | `frontend/utils/security.ts` | ✅ Kaldırıldı |

**Sağlıklı Bulunanlar:**
- Rate limiting — `ThrottlerGuard` aktif (login: 5/dk, forgot-password: 3/dk)
- httpOnly cookie — Token localStorage'da değil
- User enumeration koruması — Forgot-password generic mesaj
- IDOR — `surplus.controller.ts`'de `companyId` ownership kontrolü
- Magic byte validator — MIME type + magic byte doğrulama
- Helmet + CORS — Global aktif
- Prisma parameterized queries — Raw SQL injection riski yok

---

## 2. Barter (Ticari Takas) Denetimi

**Commit:** `2df25f22`

| Risk | Bulgu | Dosya | Durum |
|------|-------|-------|-------|
| 🔴 KRİTİK | Teminat oranı **%25** — Master Plan kural: **%20** | `collateral-calculator.service.ts` | ✅ `0.20` düzeltildi |
| 🔴 KRİTİK | `barterEnabled: false` hardcoded — teklif ve ilan oluştururken kontrol yapılmıyordu | `offers.controller.ts`, `surplus.controller.ts` | ✅ `props.barterEnabled` kontrolü eklendi |
| 🔴 KRİTİK | Company status DB'den okunmuyordu — her iki controller'da hardcoded `'APPROVED'` | `offers.controller.ts:275`, `surplus.controller.ts:388` | ✅ `props.companyStatus` ile DB'den okunuyor |
| 🟠 YÜKSEK | `counterOffer.receiverId` yanlış — company ID gönderiliyordu, vendor ID olmalıydı | `offers.controller.ts:197` | ✅ `findByCompanyId()` ile gerçek vendor ID |
| 🟠 YÜKSEK | Receiver vendor APPROVED kontrolü yoktu `createOffer`'da | `offers.controller.ts:86` | ✅ Kontrol eklendi |
| 🟠 YÜKSEK | `resolveVendorId` APPROVED kontrolü yoktu | `swap-session.controller.ts:117` | ✅ Guard eklendi |

**Sağlıklı Bulunanlar:**
- Escrow zinciri (holdFunds → compensating refund → MongoDB transaction → Outbox) tam doğru
- SmartCap (`checkBarterSmartCap`) aktif — limit aşılınca exception fırlatıyor
- Admin senkronizasyonu — Vendor + Company atomik olarak güncelleniyor
- Ekosistem içi takas yasağı uygulanıyor
- DDD katman ayrımı temiz

---

## 3. Ekosistem (Bayi Ağı) Denetimi

**Commit:** `c782e7ee`

| Risk | Bulgu | Dosya | Durum |
|------|-------|-------|-------|
| 🔴 KRİTİK | `addMember` — owner kontrolü yoktu, herhangi VENDOR üye ekleyebiliyordu | `add-ecosystem-member.handler.ts:21` | ✅ `findByOwnerId()` ile doğrulama |
| 🔴 KRİTİK | `removeMember` — `callerVendor` null ise güvenlik bypass | `remove-ecosystem-member.handler.ts:30` | ✅ Null guard + owner kontrolü |
| 🔴 KRİTİK | `updateSettings` — `vendor.userId !== userId` her zaman false (etkisiz guard) | `update-ecosystem-settings.handler.ts:29` | ✅ `findByOwnerId()` ile gerçek kontrol |
| 🔴 KRİTİK | `internalCommRate` hiç uygulanmıyordu — `memberIds.includes()` çalışmıyordu | `commission-engine.service.ts:90` | ✅ `vendor.ecosystemId` üzerinden lookup |
| 🟠 YÜKSEK | `require()` dynamic import | `ecosystem-admin.controller.ts:276` | ✅ Static `import` ile değiştirildi |
| 🟡 ORTA | `membersList: any[]` tip eksikliği | `ecosystem-admin.controller.ts:134` | ✅ `EcosystemMemberDto[]` tipi |
| 🟡 ORTA | `TRUST_SCORE_OVERRIDE` severity `WARN` olmalıydı `HIGH` | `ecosystem-admin.controller.ts:291` | ✅ `HIGH` yapıldı |

**Sağlıklı Bulunanlar:**
- AnonymizerService (HMAC-SHA256) — kör havuz gizlilik doğru
- BlindPool SmartCap, abonelik kontrolü, kendi havuzdan talep engeli
- EcosystemAuditLog — tüm kritik eylemler HIGH/INFO severity ile loglanıyor
- CreateEcosystemHandler — APEX tier zorunluluğu ve tek ekosistem sınırı

---

## 4. Açık Artırma Denetimi

**Commit:** `538b481a`

| Risk | Bulgu | Dosya | Durum |
|------|-------|-------|-------|
| 🔴 KRİTİK | `winnerId` Auction entity'sine yazılmıyordu → `claim` endpoint her zaman başarısız | `auction-close.scheduler.ts:69` | ✅ `updateAuctionStatus(winnerId)` kullanılıyor |
| 🟠 YÜKSEK | `advance-winner` — `w: any` tip | `advance-winner.handler.ts:40` | ✅ `AuctionWinner` interface tanımlandı |
| 🟡 ORTA | `error: any` → `error: unknown` | `auction.controller.ts:150` | ✅ Düzeltildi |
| 🟡 ORTA | Bid endpoint rate limiting yoktu | `auction.controller.ts:95` | ✅ `ThrottlerGuard` + 10 req/dk |

**Sağlıklı Bulunanlar:**
- `participate` — `holdFunds` teminat blokajı tam doğru implement edilmiş
- `PlaceBidHandler` — participation kontrolü + bakiye + önceki teklif iadesi + holdFunds zinciri
- `AuctionCloseScheduler` — 60 sn interval, kaybeden teminat iadeleri, audit log
- `LotteryDrawScheduler` — otomatik çekiliş aktif
- DDD katman ayrımı temiz

---

## 5. Çekiliş Denetimi

**Commit:** `2003089d`

| Risk | Bulgu | Dosya | Durum |
|------|-------|-------|-------|
| 🔴 KRİTİK | DB-level bilet numarası unique index yoktu — race condition ile çakışan numaralar oluşabilirdi | `lotteryTicket.schema.ts` | ✅ `{ lotteryId, numbers }` unique compound index eklendi |
| 🟠 YÜKSEK | `draw()` / `drawManual()` — ham `Error` fırlatıyordu (HTTP 500) | `lottery.entity.ts:62,78` | ✅ `DomainException` ile değiştirildi |
| 🟠 YÜKSEK | `session?: any` — 4 yerde | `lottery.repository.interface.ts` | ✅ `ClientSession` (mongoose) tipi |
| 🟡 ORTA | `Logger` yerine `StructuredLogger` kullanılmalıydı | `lottery.controller.ts:38` | ✅ Düzeltildi |

**Sağlıklı Bulunanlar:**
- `participate` — `holdFunds` + MongoDB transaction + compensating `releaseFunds` zinciri doğru
- `DrawLotteryHandler` — kazanan bilet sahibi bulunup `winnerId` entity'ye set edilip kaydediliyor
- `LotteryDrawScheduler` — 60 sn interval otomatik çekiliş aktif
- Kota kontrolleri (`maxTicketsPerUser`, `totalTickets`) session içinde atomik

---

## 6. Finansal Sistem Denetimi

**Commit:** `dc5f4ffc`

| Risk | Bulgu | Dosya | Durum |
|------|-------|-------|-------|
| 🔴 KRİTİK | `d128()` — `Number(v).toFixed(2)` JavaScript float precision kaybı | `topup-wallet.handler.ts:15`, `approve-topup.handler.ts:17` | ✅ `new Decimal(v).toFixed(2)` |
| 🔴 KRİTİK | `transferBetweenAccounts` — `walletModel.balanceTL` güncellenmiyordu → Wallet ↔ Account drift | `wallet.grpc.controller.ts:440` | ✅ MAIN transfer'de wallet senkronizasyonu eklendi |
| 🟠 YÜKSEK | `wallet.entity` + `money.vo` — `throw new Error()` domain katmanında | `wallet.entity.ts:33,39`, `money.vo.ts:27,38` | ✅ `DomainException` ile değiştirildi |
| 🟠 YÜKSEK | `parseDate(dateVal: any)` | `get-transactions.handler.ts:42` | ✅ `unknown` tipi |

**Sağlıklı Bulunanlar:**
- Tüm işlemlerde MongoDB session+transaction — race condition koruması
- Double-entry muhasebe (TOPUP, ESCROW, RELEASE) ledger kayıtları doğru
- `CommissionCalculatorService` — tam Decimal.js, XP/GROUP kuralları doğru
- `Money` VO — negatif bakiye koruması, para birimi uyumsuzluk kontrolü
- Mükerrer kontrol (idempotency) TopUp ve Escrow'da aktif

---

## Genel İstatistik

| Modül | 🔴 Kritik | 🟠 Yüksek | 🟡 Orta/Düşük | Toplam |
|-------|-----------|-----------|---------------|--------|
| Güvenlik | 1 | 1 | 4 | 6 |
| Barter | 3 | 3 | — | 6 |
| Ekosistem | 4 | 1 | 2 | 7 |
| Açık Artırma | 1 | 1 | 2 | 4 |
| Çekiliş | 1 | 2 | 1 | 4 |
| Finansal | 2 | 2 | — | 4 |
| **Toplam** | **12** | **10** | **9** | **31** |

**Kapatılmamış açık: 0**

---

## Önerilen Sonraki Adımlar — Tamamlandı

**Commit:** `30ea275d`

| # | Adım | Uygulama | Durum |
|---|------|----------|-------|
| 1 | **MinIO adapter subPath whitelist** | `minio-storage.adapter.ts`'e `ALLOWED_SUBPATHS` + `sanitizeSubPath()` eklendi — local adapter ile aynı path traversal koruması | ✅ |
| 2 | **Reconciliation servisi** | `WalletReconciliationScheduler` — her gece 03:00'te Wallet↔Account bakiye drift tespiti, 500'lük sayfalı tarama, StructuredLogger alarm | ✅ |
| 3 | **`getParticipations` admin endpoint** | `findAllParticipations()` repository interface + MongoDB implementasyonu eklendi; `auctionId`/`status`/`page`/`limit` filtrelemeli sayfalı sorgu | ✅ |
| 4 | **Integration test coverage** | `escrow-lifecycle.spec.ts` (create→release→refund, idempotency, yetersiz bakiye) + `swap-session-lifecycle.spec.ts` (teminat zinciri, SmartCap, telafi, %20 oranı, state machine) | ✅ |

---

## Son Durum

**Kapatılmamış açık: 0**  
**Tamamlanmamış öneri: 0**  
**Toplam commit: 7**

```
a7fab855  fix(security): path traversal, 5xx info disclosure, CSRF
2df25f22  fix(barter): teminat %20, barterEnabled, counterOffer receiverId
c782e7ee  fix(ecosystem): owner kontrolü, null bypass, internalCommRate
538b481a  fix(auction): winnerId, any tipler, rate limiting
2003089d  fix(lottery): unique index, DomainException, ClientSession
dc5f4ffc  fix(financial): d128 float precision, wallet-account drift
30ea275d  feat: audit sonrası önerilen geliştirmeler uygulandı
```
