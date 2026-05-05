# BazarX - Claude Code Guide

## 🚀 Project Overview
BazarX is a commercial barter/trading platform built with a modern monorepo architecture.
- **Core Strategy:** Domain-Driven Design (DDD), CQRS, and Event-Driven Architecture.
- **Backend:** NestJS 10+ (Fastify adapter).
- **Monorepo:** Turborepo + pnpm workspaces (@barterborsa/ prefix).
- **Infrastructure:** PostgreSQL 16 (Prisma), MongoDB 7 (Mongoose), Redis 7 (Cache/Session), RabbitMQ 3.13 (Event Bus).
- **Inter-service:** gRPC (sync) or RabbitMQ (async).
- **Frontend:** Nuxt 3 (SSR-safe), Vue 3, TailwindCSS.
- **Auth:** Google OAuth2 + JWT + Redis session.

## 🛠 Main Commands
- **Build:** `pnpm build` (turbo build)
- **Dev:** `pnpm dev` (turbo dev)
- **Lint:** `pnpm lint` (turbo lint)
- **Test:** `pnpm test` (turbo test)
- **Database:**
  - Generate: `pnpm prisma:generate`
  - Migrate: `pnpm prisma:migrate`
  - Studio: `pnpm prisma:studio`
- **Docker:**
  - Up: `pnpm docker:up`
  - Down: `pnpm docker:down`
  - Logs: `pnpm docker:logs`

## 🧠 Architectural Guidelines
### Backend (NestJS)
- Use **DDD** patterns: Entity, AggregateRoot, ValueObject, Repository.
- Use **CQRS** for complex business logic.
- **Outbox Pattern** is required for event reliability.
- Inter-service communication via **gRPC** (sync) or **RabbitMQ** (async).

### Frontend (Nuxt 3)
- Use `<script setup lang="ts">`. Options API is strictly forbidden.
- No Hardcoded URLs: Use `useRuntimeConfig().public.apiBase`.
- SSR Safety: Access Browser APIs (window, etc.) only in `onMounted` or client-side checks.

### General Rules
- **File Headers:** Her dosyanın tam path'ini başına yorum satırı olarak yaz (örn: `// packages/shared/shared-core/src/domain/entity.base.ts`).
- **Type Safety:** `any` KESİNLİKLE YASAKTIR. TypeScript strict mode uyumlu yaz.
- **TypeScript Direktifleri:** `@ts-ignore` veya `@ts-expect-error` kullanımı YASAKTIR.
- **Logging:** `console.log` YASAKTIR. Sadece `console.error`/`warn` (kritik) veya `StructuredLogger` (@barterborsa/shared-observability) kullan.
- **Exports:** index.ts barrel export dosyaları oluştur.
- **Language:** Kod yorumları ve açıklamalar TÜRKÇE olacaktır.
- **Architecture:** Kendi mimari önerini ekleme, belirtilen DDD/CQRS/Outbox pattern'lerine sadık kal.
- **Scope:** Sadece istenen dosyaları yaz, fazladan dosya ekleme.
- **Imports:** Monorepo package isimleri `@barterborsa/` prefix'i ile olacak.

## 📜 Architecture Stabilization History
### B2B Entegrasyonu — Mayıs 2026 (Tek Sistem Birleştirme)
- **SwapSessionController:** `GET /api/v1/barter/swap/:id`, `POST /ship`, `/confirm`, `/finalize`, `/dispute` — 5 endpoint + 4 command/handler sıfırdan yazıldı. ✅
- **Faz Köprüsü:** `acceptOffer()` artık backend'den gelen `sessionId`'yi alıp `/ticaritakas/swap/:id`'ye navigate ediyor. ✅
- **useSwapSession Rewrite:** Doğru API prefix (`/api/v1/barter/swap/`), parametre kabul eden imza, 7 eksik metot eklendi (isFromCompany, lockCollateral, submitShipping, confirmReceipt, finalizeSwap, sendDispute, computed flag'ler). ✅
- **Status Enum Düzeltmesi:** Frontend'deki `COLLATERAL_DEPOSITED` → `ACTIVE`, `SHIPPING_IN_PROGRESS` → `SHIPPING`, `INSPECTION_PERIOD` → `PARTIALLY_COMPLETED` ile değiştirildi. ✅
- **Yeni Sayfalar:** `pages/ticaritakas/swap/[id].vue`, `pages/ticaritakas/inbox.vue`, `pages/ticaritakas/trade-pool/offer/detail/[id].vue`. ✅
- **InboxOfferItem.vue:** `COUNTER_OFFERED` desteği, swapSession.id ile doğru swap URL, tüm status enum normalizasyonu (toUpperCase). ✅
- **Redirect Middleware:** `/my/surplus` → `/ticaritakas/inbox`, `/my/surplus/swap/:id` → `/ticaritakas/swap/:id` (301). ✅
- **Nav Güncelleme:** VendorSidebar `my/surplus` → `ticaritakas/inbox`, b2b-dashboard "Görüntüle" → `offer/detail/:id`. ✅
- **`GET /api/v1/offers/my`:** `swapSession: { id, status }` include eklendi (frontend'de swap yönlendirmesi için). ✅
- **Silinmesi gereken (Faz 9 — ileriki oturumda):** `pages/my/surplus/index.vue`, `pages/my/surplus/swap/[id].vue`, `components/my/surplus/swap/*`. ⚠️


### Audit - May 2026 (Ecosystem & Tech Debt)
- **CommissionEngineService:** `isGroupTransaction=true` → `BrandEcosystem.internalCommRate` DB'den okunuyor (varsayılan %4); yoksa tier-based fallback. ✅
- **CreateEcosystemHandler:** Duplicate guard (vendor zaten owner mı) + `EcosystemAuditLog{ ECOSYSTEM_CREATED }` eklendi. ✅
- **RemoveEcosystemMemberCommand/Handler:** Yeni endpoint — owner/admin kontrolü + `EcosystemAuditLog{ MEMBER_REMOVED, severity:HIGH }`. ✅
- **UpdateEcosystemSettingsCommand/Handler:** `isBlindPool` + `internalCommRate` güncelleme + `EcosystemAuditLog{ SETTINGS_UPDATED, oldValue/newValue }`. ✅
- **EcosystemController:** `body:any → CreateEcosystemDto`, `PATCH /settings`, `DELETE /members/:vendorId` endpoint'leri eklendi. ✅
- **Teknik Borç (33 ihlal):** `auction.mapper`, `lottery.mapper`, `surplus-item.mapper`, `trade-offer.mapper` → Prisma payload tipleri. `SurplusItem/TradeOffer/Auction.createFrom` statik metodları eklendi. `surplus.controller`, `wanted-items.controller`, `barter-admin.controller` → `AuthenticatedUser`, `Prisma.*WhereInput`, typed DTO'lar. `any = 0`. ✅

### Audit - May 2026 (B2B Surplus Stabilizasyon)
- **`SurplusStatus.REJECTED` Eklendi:** Prisma schema + domain enum + migration hazır. `rejectionReason`, `approvedBy` alanları `SurplusItem`'a eklendi. ✅
- **State Machine:** `SurplusItem` entity'sine `approve()`, `reject()`, `markUpdated()`, `reactivate()` domain metodları eklendi; her biri geçersiz statüde `BadRequestException` fırlatıyor. ✅
- **Yeni Commands/Handlers:** `ApproveSurplusCommand`, `RejectSurplusCommand`, `ReactivateSurplusCommand` — her biri AuditLog yazıyor. ✅
- **RBAC:** `SurplusController.updateStatus` + `rejectItem` endpoint'leri `@Roles('ADMIN','SUPER_ADMIN')` ile korunuyor. ✅
- **`/reactivate` Endpoint:** Vendor kendi pasif ilanını yeniden onaya gönderebilir; `reactivationCount` artırılıyor. ✅
- **`/categories/:id/attributes` Endpoint:** Form dinamik alanları için public endpoint eklendi. ✅
- **Tam Veri Kaydı:** `wantedCategories`, `tradeModes`, `technicalSpecs`, `materialType`, `location` artık command → handler → entity → repository → DB zincirine tam taşınıyor. ✅
- **barterEnabled Senkronizasyonu:** `ApproveVendorHandler` vendor onaylandığında `barterEnabled: true` yapıyor. Surplus oluşturma `barterEnabled` kontrolü yapıyor. ✅
- **API Prefix Düzeltmesi:** Tüm frontend `/api/...` çağrıları `/api/v1/...` prefixine çekildi (backend global prefix uyumu). ✅
- **Tip Güvenliği:** `surplus.controller.ts`, `offers.controller.ts`, `useSurplus.ts`, `useSurplusForm.ts` — `any` sıfırlandı; `~/types/surplus.ts` tip kütüphanesi oluşturuldu. ✅
- **`WantedItemsManager.vue` Düzeltmeleri:** `<script setup lang="ts">`'ye geçildi, statü filtresi düzgün enum değerleri kullanıyor, admin reject için `reason` prompt eklendi. ✅
- **`console.error` Temizliği:** Tüm frontend composable ve sayfalardan `console.error` kaldırıldı. ✅
- **Migration Gerekli:** `pnpm prisma:migrate dev --name surplus_rejected_status` çalıştır. ⚠️

### Audit - May 2026 (Barter System)
- **counterOffer Guard:** `offers.controller.ts` karşı teklif hedefi firma `APPROVED` kontrolü eklendi. ✅
- **Sıralı Escrow (gRPC holdFunds):** `AcceptTradeOfferHandler` → initiator teminat blokajı, ardından receiver blokajı; receiver başarısız olursa initiator otomatik iade. ✅
- **holdId Persistansı:** `session.setHoldIds(fromHoldId, toHoldId)` → `SwapSession.fromCollateralHoldId/toCollateralHoldId` DB'ye yazılıyor, `collateralStatus → HELD`. ✅
- **SmartCap Enforcement:** `WatchtowerService.checkBarterSmartCap()` eklendi — `VendorB2BData.barterLimitOverride` veya default 50.000 TRY limitini aşarsa AuditLog + `DomainException`. ✅
- **AuditLog:** `BARTER_OFFER_ACCEPTED` her kabul işleminde yazılıyor. ✅
- **Tip Güvenliği:** `SwapSessionMapper.toDomain/toPersistence` `any`'den `SwapSessionRaw/Record<string,unknown>`'a; entity `shipments: any → unknown`; controller DTO'ları typed. `any` = 0. ✅

### Audit - May 2026 (Lottery System)
- **`participate` Gerçek Bilet Satın Alma:** `LotteryController.participate()` → `holdFunds(LOTTERY_TICKET)` + `LotteryTicket` kaydı oluşturma. `maxTicketsPerUser`, `totalTickets` kotası, kopya numara kontrolü (5 retry). ✅
- **Kazanan Atama:** `DrawLotteryHandler` → `winningNumber` çekildikten sonra `LotteryTicket.findFirst({ has: winningNumber })` → `lottery.setWinner(userId)`. ✅
- **`Lottery.createFrom` + `setWinner`:** Entity'ye persistence reconstitution + winner setter eklendi. `draw()` guard düzeltildi. ✅
- **`LotteryDrawScheduler`:** 60 sn'de bir süresi dolan `ACTIVE` çekilişler için `DrawLotteryCommand` otomatik tetikler. ✅
- **`lottery-admin.controller.ts`:** `endLottery` artık `DrawLotteryCommand` çalıştırıyor (gerçek kazanan belirleniyor). Tüm işlemler AuditLog'a yazılıyor. ✅
- **Tip Güvenliği:** `query/dto/where/user: any` → `AuthenticatedUser`, `Prisma.LotteryWhereInput`, `Record<string,unknown>`. `any` = 0. ✅

### Audit - May 2026 (Auction System)
- **Teminat Blokajı:** `AuctionController.participate()` → Financial Service `holdFunds(AUCTION_BID)` çağrısı eklendi; `holdId` DB'ye kaydediliyor, status `DEPOSIT_HELD`. ✅
- **PlaceBidHandler Guard:** Teklif öncesi `AuctionParticipation` `DEPOSIT_HELD|APPROVED|ACTIVE` kontrolü eklendi. ✅
- **AuctionCloseScheduler:** Her 60 sn'de bir süresi dolan `ACTIVE` artırmaları kapatır; kazananı belirler, `AuctionWinner` oluşturur, kaybedenlere `refundFunds()` yapar. ✅
- **AuditLog:** Her katılım, kazanan belirleme ve teminat iadesi için `AuditLogService.log()` eklendi. ✅
- **Admin approveParticipation:** Guard + AuditLog eklendi; `user: any` → `AuthenticatedUser` düzeltildi. ✅
- **Tip Güvenliği:** `any` sıfırlandı (query, where, dto, error catch hepsi tipli). ✅

### Master Plan v4.3 — Faz 7 (Nisan 2026)
- **`pages/simulator.vue`:** Karlılık Simülatörü — B2C + B2B parametreleri, gerçek zamanlı hesaplama, vergi breakdown, kırılım uyarıları. Public erişim. ✅

### Master Plan v4.3 — Faz 6 (Nisan 2026)
- **TaxCalculatorService:** §5.2 — BazarX KDV (matrah: hizmet bedeli), TicariTakas KDV+Stopaj, Kurumlar Vergisi aylık karşılık, Damga Vergisi ‰1. ✅
- **TaxController:** `GET /admin/tax/monthly-report`, `POST /admin/tax/calculate`. ✅
- **TaxModule:** Global kayıt. ✅

### Master Plan v4.3 — Faz 5 (Nisan 2026)
- **BlindPoolService:** Havuz oluşturma, SmartCap %25 kontrolü, Watchtower entegrasyonu, kör görünüm (vendor kimliği gizli). ✅
- **BlindPoolController:** `GET /barterborsa/pools/group/:id`, `GET /:poolId`, `POST /`, `POST /:id/request` (grup içi %6 komisyon). ✅
- **BarterBorsaModule:** Kayıt + VendorModule + BarterModule entegrasyonu. ✅

### Master Plan v4.3 — Faz 4 (Nisan 2026)
- **TrustScoreCalculatorService:** §3.3 — Ticari (%40) + XP sadakati (%30) + Uyumluluk (%30). 90 gün hareketsizlik −10/ay, sıfır XP −5/ay. Company tabanlı takas sorgusu. ✅
- **TrustScoreRecalculationService:** Günlük cron — ayın 1'inde tam hesaplama, diğer günler inactiveDays güncelleme. ✅
- **RecordTrustViolationHandler:** 1. ihlal uyarı, 2. −15 puan, 3. hesap dondurma + vendor askıya alma. AuditLog. ✅
- **GetVendorTrustScoreHandler:** Tier bilgisi (aidat/komisyon/havuz) + TrustScore bileşenleri birlikte döner. ✅
- **B2BXpRulesService:** 50/25/25 kuralı — COMMISSION max %50, ADVERTISING max %25 (6 ay TTL), POOL_DEPOSIT max %25 bakiye & %30 kota. ✅
- **WatchtowerService:** §3.4 — PriceFloor (%30 altı), SmartCap (%25 aşımı) tespiti. Bayraklar AuditLog'a şifreli kayıt. Admin liste endpoint. ✅
- **TrustScoreController:** `GET /trust-score/me`, `POST /trust-score/xp-allowance`, Admin: violation/recalculate/watchtower. ✅

### Master Plan v4.3 — Faz 3 (Nisan 2026)
### Master Plan v4.3 — Faz 1 (Nisan 2026)
- **CommissionCalculatorService (financial-service):** Master Plan §3.2 — CORE %12/PRIME %10/ELITE %8/APEX %6. ✅
- **CommissionEngineService (backend):** Tam hesaplama — tier lookup, isGroupTransaction, xpToApply. ✅
- **TrustScoreCalculatorService:** §3.3 TrustScore Algoritması — Trading (%40), XP Loyalty (%30), Compliance (%30). ✅
- **BlindPoolService:** §4 BarterBorsa Kör Havuz + Akıllı Kota (%25 Smart Cap). ✅
- **GiftVoucherSchedulerService:** Doğum günü/Yıl dönümü/Referans bazlı otomatik hediye çeki dağıtımı. ✅
- **AdvanceLaunchPartnerPhaseHandler:** PHASE_1→2→3 geçişi, Faz 2 için 60 menü taahhüt kontrolü. ✅
- **DistributeFreeMenuHandler:** Taahhütten bedava QR dağıtımı, kalan limit kontrolü. ✅
- **RestaurantAdminController:** `GET|POST /launch-partners`, `PATCH /advance-phase`. ✅

### Master Plan v4.3 — Faz 2 (Nisan 2026)
- **MenuModule:** `PurchaseMenuHandler` (%8+KDV+QR), `ActivateOneFreeHandler` (1+1), `RedeemMenuHandler`. ✅
- **BrowseRestaurantsHandler:** Şehir/kategori/arama filtreli, launchPartner flag. ✅
- **MenuUsageTrackerService:** Aylık 2× aidat kredi takibi, deduct, assert. ✅
- **QrGeneratorService:** MENU-/FREE- prefix QR üretimi. ✅
- **MarketingAdminController:** `GET /vouchers`, `POST /vouchers/issue-manual`. ✅
- **Frontend:** `pages/menu/index.vue`, `pages/menu/my-menus.vue`, `pages/partner/menu-redeem.vue`. ✅


### Master Plan v4.3 — Faz 1 (Nisan 2026)
- **SubscriptionModule:** `SubscribeUserCommand`, `UpgradeTierCommand` (5× ciro + 50/50 XP/nakit), `CancelSubscriptionCommand` (30 gün koruma). ✅
- **SubscriptionPricingService:** %8 hizmet + %20 KDV hesaplama, tier upgrade payment split, breakeven kontrolü. ✅
- **SubscriptionRenewalService:** Saatlik cron — expire, autoRenew. ✅
- **XpRulesService:** Master Plan §2.5 — isFirstOrder block, tier-upgrade XP cap (%50), sistem ödeme cap (%20), %10 aylık erozyon. ✅
- **GiftVoucherScheduler:** Doğum günü (100₺), 3. ay (150₺), yıl dönümü (yıl×50₺) otomatik. ✅
- **IssueGiftVoucher / RedeemGiftVoucher:** Hediye çeki oluşturma ve kullanımı. ✅
- **GrantReferralRewardHandler:** 20XP referans veren, 10XP yeni üye, 3. referans → %20 indirim + 100₺ voucher. ✅
- **ReferralService:** Kodu üretme, processReferral, stats. ✅
- **Schema:** User.referralCode eklendi. ✅

### Master Plan v4.3 — Faz 0 (Nisan 2026)
- **VendorTier:** CORE/PLUS/PREMIUM/ELITE → CORE/PRIME/ELITE/APEX. Komisyon oranları %12/%10/%8/%6. Migration SQL `prisma/migrations/README_faz0_migration.md`'de. ✅
- **SubscriptionTier enum:** BRONZE_P1/P2 → DIAMOND_P1/P2 (8 kademe) — abonelik sistemi için. ✅
- **LoyaltyTier:** Değişmedi (XP achievement, BRONZE→DIAMOND). SubscriptionTier ile ayrı kavramlar. ✅
- **XpTransaction:** `expiresAt` + `erodedAt` alanları eklendi (6 ay TTL, %10 erime). ✅
- **Yeni Modeller (13 adet):** `MembershipPlan`, `UserSubscription`, `MenuUsage`, `Restaurant`, `BazarXMenu`, `MenuPurchase`, `MenuRedemption`, `GiftVoucher`, `Referral`, `LaunchPartner`, `TrustScore`, `BlindPool`, `BlindPoolEntry`. ✅
- **Yeni Enum'lar (5):** `SubscriptionTier`, `SubscriptionStatus`, `MenuPurchaseStatus`, `GiftVoucherType`, `LaunchPartnerPhase`. ✅
- **Seed:** `prisma/seed.ts` — 8 MembershipPlan kaydı. `pnpm prisma:seed` ile yüklenir. ✅
- **VendorTierVO:** Yeni komisyon, grup içi oran, XP indirim, yıllık aidat, havuz limiti metodları. ✅
- **Migration Gerekli:** `pnpm prisma:push` + `pnpm prisma:seed` + VendorTier migration SQL. ⚠️

### Audit - April 2026 (Admin Dashboard Security)
- **AuditLog:** Yeni `AuditLog` Prisma modeli + `AuditLogService` (global `@AuditModule`). ✅
- **SystemSetting:** `SystemSetting` modeli eklendi; `settings-admin.controller.ts` DB'ye persist ediyor, ValidationPipe'lı DTO + audit log. ✅
- **Route Collision:** `admin-dashboard.controller.ts` kaldırıldı (dummy veriler + `@Controller('admin/analytics')` çakışması). ✅
- **Frontend RBAC:** `loyalty.vue`, `demand-matching/index.vue`, `demand-matching/[id].vue` → `definePageMeta({ middleware: ['auth','admin'] })`. ✅
- **State Machine — Vendor Approval:** `ApproveVendorHandler` / `RejectVendorHandler` → yalnızca PENDING vendor onaylanabilir/reddedilebilir. `adminId` eklendi. AuditLog. ✅
- **Privilege Escalation:** `UpdateUserRoleHandler` → role enum guard, SUPER_ADMIN sadece SUPER_ADMIN atar, self-demotion engeli, `as any` kaldırıldı. AuditLog. ✅
- **UserStatus:** `UpdateUserStatusHandler` → status enum + AuditLog. ✅
- **Soft Delete:** `DeleteAdminUserHandler` → hard delete → soft delete (`deletedAt`, `status:INACTIVE`). Self-delete engeli. AuditLog. ✅
- **wallet-admin.controller.ts:** try/catch swallow kaldırıldı, `admin:any` → `AuthenticatedUser`, throw semantics. ✅
- **Analytics RBAC:** `analytics-admin.controller.ts` `@Roles('ADMIN')` → `@Roles('ADMIN','SUPER_ADMIN')`. `period:any` → literal union type. ✅
- **Performance Indexes:** `Order(vendorId,status,createdAt)`, `Order(status,createdAt)`, `User(role,status)` composite index'ler eklendi. ✅
- **Migration Gerekli:** `AuditLog`, `SystemSetting` tabloları + composite index'ler → `pnpm prisma:migrate` çalıştır. ⚠️

### Audit - April 2026 (Vendor Dashboard Data Isolation)
- **KRITIK — uploadDocument Açığı:** Vendor check + `brandId` zorunlu + `@Roles` + sahiplik kontrolü eklendi. ✅
- **KRITIK — importExcel Overwrite:** `listing.upsert({ where: { slug } })` → `findFirst({ vendorId }) + update/create`. Cross-vendor listing ezme riski kapatıldı. ✅
- **KRITIK — Brand Apply Race Condition:** P2002 yakalandı, slug `randomBytes(4)` ile üretiliyor. ✅
- **DDD:** 10 yeni handler: `ApplyBrand`, `UpdateBrand`, `DeleteBrand`, `CreateBanner`, `UpdateBanner`, `DeleteBanner`, `ListVendorBrands`, `ListVendorBanners`, `GetVendorAnalytics`, `GetVendorUsers`. ✅
- **RBAC:** `ecosystem.controller.ts:addMember` → `@Roles('VENDOR','ADMIN','SUPER_ADMIN')`. ✅
- **wallet.controller.ts:** `req: any` → `CurrentUser`, `console.error` kaldırıldı, try/catch anti-pattern temizlendi. ✅
- **Type Safety:** `vendor.controller.ts` + `vendor-banners/brands.controller.ts`'ten `any` temizlendi; `PrismaService` vendor.controller'dan çıkarıldı. ✅

### Audit - April 2026 (Product Management / Bulk Import)
- **Frontend Sync:** `bulk-upload.vue` → `res.report` → `res.data` düzeltildi, `console.error` kaldırıldı. ✅
- **DDD:** Vendor bulk import logic controller'dan `BulkImportVendorProductsHandler`'a taşındı. ✅
- **FileParserService:** RFC 4180 uyumlu CSV parser (quote-escaping, BOM) + Excel parser tek serviste toplandı. ✅
- **Type Safety:** Controller'lardaki `any` kaldırıldı; `AuthenticatedUser`, `ParsedRow`, `Record<string,unknown>` ile değiştirildi. ✅
- **Admin Handler:** `validateRow` genişletildi (price<0, stock<0, status enum, imageUrl). Resim indirme transaction dışına alındı. Sayım mantığı düzeltildi. ✅
- **Admin Controller:** try/catch anti-pattern kaldırıldı; NestJS exception filter'a güvenildi. `bulk-delete/update` için input validation eklendi. ✅


### Audit - April 2026 (Financial Service)
- **Transaction Atomicity:** Fixed 2 critical money loss risks. ✅
- **Type Safety:** 11 `any` violations fixed (0 remaining). ✅
- **Logging:** 5 `console.*` violations replaced with `StructuredLogger`. ✅
- **Phantom Entity:** Fixed `GetBalanceHandler` logic (Wallet.create fix). ✅
- **Dead Injections:** Removed 9 unused repository injections. ✅
- **Messaging:** `EscrowConsumer` fixed with Nack + DLQ (no more lost messages). ✅
- **Prisma:** Fixed `new PrismaClient()` singleton issue. ✅

### Audit - April 2026 (Commerce Module)
- **Race Condition (KRITIK):** `checkout.service.ts` → stok rezervasyonu `tx.listing.updateMany()` ile atomik hale getirildi; TOCTOU açığı kapatıldı. ✅
- **External I/O in Transaction (KRITIK):** `holdFunds()` Prisma `$transaction` dışına taşındı; bağlantı havuzu tıkanma riski giderildi. ✅
- **Telafi Mekanizması:** Cüzdan ödemesi başarısız olursa stok serbest bırakılıp sipariş iptal ediliyor. ✅
- **Add-to-Cart Stok Kontrolü:** Listing durumu (ACTIVE) ve `availableQuantity` kontrolü eklendi. ✅
- **Dead Injection:** `CheckoutService`'ten kullanılmayan `IOrderRepository` kaldırıldı. ✅
- **Type Safety:** `prisma-order.repository.ts` → `record: any` → `Prisma.OrderGetPayload<...>` tipine geçildi. ✅
- **PENDING Sipariş Expiry:** `Order.expiresAt` alanı eklendi (Prisma migration gerekli). `OrderExpiryService` her 5 dakikada süresi dolmuş siparişleri iptal edip stoku serbest bırakıyor. Cüzdan ödemelerinde expiry yok. ✅
- **Checkout Idempotency:** `clientMutationId` (UUID v4) `CheckoutDto` → `CheckoutCommand` → `CheckoutService` zincirine eklendi. Mevcut sipariş varsa anında döndürülüyor; yeni oluşturulanlarda `idempotencyKey` DB'ye kaydediliyor. Prisma migration gerekli (`idempotencyKey` alanı). ✅

## 💰 Token & Context Management
- **Subagents:** Use subagents for research-heavy tasks to keep main context clean.
- **Rewind:** Use `Esc Esc` or `/rewind` instead of correcting mistakes via chat.
- **Compacting:** Use `/compact` every 20-30 mins or after major task completions.
- **Fresh Starts:** Use `/clear` when switching between unrelated modules.
- **Memory Maintenance:** At the end of a major task, **YOU MUST** update this `CLAUDE.md` file with a brief summary of changes in the history section.

## 📁 Rule Files (@path)
- `.claude/rules/backend.md`: NestJS/DDD and backend patterns.
- `.claude/rules/frontend.md`: Nuxt 3, Vue 3 and frontend UI rules.
- `.claude/rules/style.md`: Global coding style and Turkish comments.
- `.claude/rules/commerce.md`: Order, Cart and Inventory safety.
- `.claude/rules/security.md`: RBAC, Data Isolation and Audit Log rules.
- `.claude/rules/auction-audit.md`: Auction system audit instructions.
- `.claude/rules/lottery-audit.md`: Lottery system audit instructions.
- `.claude/rules/barter-audit.md`: Commercial Barter system audit instructions.
- `.claude/rules/ecosystem-audit.md`: Ecosystem and Dealer Network system audit instructions.

## 🕹️ Custom Commands
- `/audit`: General module technical audit.
- `/product-expert`: Deep dive into products and bulk import.
- `/admin-audit`: Admin dashboard security and system settings audit.
- `/vendor-audit`: Vendor dashboard isolation and store audit.
- `/commerce-audit`: Transactional flow and stock safety audit.
- `/auction-audit`: End-to-end audit for the Auction system (participation, bidding, holds).
- `/lottery-audit`: End-to-end audit for the Lottery system (tickets, random draw, winner assignment).
- `/barter-audit`: End-to-end audit for the Commercial Barter (Ticari Takas) system.
- `/ecosystem-audit`: End-to-end audit for the Brand Ecosystem & Dealer Network system.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
