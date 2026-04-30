# BazarX - Claude Code Guide

## 🚀 Project Overview
BazarX is a commercial barter/trading platform built with a modern monorepo architecture.
- **Core Strategy:** Domain-Driven Design (DDD), CQRS, and Event-Driven Architecture.
- **Backend:** NestJS 10, Fastify, Prisma (PostgreSQL), Mongoose (MongoDB).
- **Frontend:** Nuxt 3, Vue 3, TailwindCSS.

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
- **Type Safety:** `any` is strictly forbidden. Use interfaces/types.
- **Logging:** No `console.log`. Use `StructuredLogger` from `@barterborsa/shared-observability`.
- **Language:** Code comments and explanations must be in **Turkish**.
- **Imports:** Use `@barterborsa/` prefix for monorepo packages.

## 📜 Architecture Stabilization History
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
- **CommissionCalculatorService (financial-service):** Master Plan §3.2 — CORE %12/PRIME %10/ELITE %8/APEX %6. Grup içi oranlar eklendi. XP indirimi eklendi. "İki indirim bir arada yok" kuralı. `calculateSimple` geriye dönük uyum. ✅
- **CommissionEngineService (backend):** Tam hesaplama — tier lookup, isGroupTransaction, xpToApply, CommissionBreakdown döndürür. ✅
- **CommissionController:** `POST /commission/preview` — satın alım öncesi ön hesaplama. ✅
- **AdvanceLaunchPartnerPhaseHandler:** PHASE_1→2→3 geçişi, Faz 2 için 60 menü taahhüt kontrolü. ✅
- **DistributeFreeMenuHandler:** Taahhütten bedava QR dağıtımı, kalan limit kontrolü. ✅
- **GetLaunchPartnersHandler:** Faz/şehir filtreli admin liste + progress % hesabı. ✅
- **RestaurantAdminController:** `GET|POST /launch-partners`, `PATCH /advance-phase`, `POST /distribute`. ✅

### Master Plan v4.3 — Faz 2 (Nisan 2026)
- **MenuModule:** `PurchaseMenuHandler` (%8+KDV+QR), `ActivateOneFreeHandler` (1+1), `RedeemMenuHandler` (restoran QR), `CreateRestaurant/Menu`. ✅
- **BrowseRestaurantsHandler:** Şehir/kategori/arama filtreli, launchPartner flag. ✅
- **GetRestaurantDetailHandler:** Tüm menüler + fiyat breakdown. ✅
- **GetMyPurchasesHandler:** Aktif QR'lar + 1+1 durumu. ✅
- **MenuUsageTrackerService:** Aylık 2× aidat kredi takibi, deduct, assert. ✅
- **QrGeneratorService:** MENU-/FREE- prefix QR üretimi. ✅
- **Frontend:** `pages/menu/index.vue`, `pages/menu/[id].vue`, `pages/menu/my-menus.vue`, `pages/partner/menu-redeem.vue`. ✅
- **API:** `GET /menu/restaurants`, `GET /menu/restaurants/:id`, `GET /menu/my-purchases`, `POST /menu/purchase/:menuId`, `POST /menu/activate-one-free/:id`, `POST /menu/redeem`. ✅

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

## 🕹️ Custom Commands
- `/audit`: General module technical audit.
- `/product-expert`: Deep dive into products and bulk import.
- `/admin-audit`: Admin dashboard security and system settings audit.
- `/vendor-audit`: Vendor dashboard isolation and store audit.
- `/commerce-audit`: Transactional flow and stock safety audit.
