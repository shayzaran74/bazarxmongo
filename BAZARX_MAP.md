# BazarX — Proje Haritası (Master Referans)

> Bu dosyayı konuşmanın başına yapıştır. "auth diyorum" → bu dosyadaki auth bölümüne bak.
> Token tasarrufu: dosya okumadan önce buraya bak, yoksa sor.

---

## Mimari Özeti

```
monorepo (pnpm workspaces + turbo)
├── apps/
│   ├── backend/          NestJS, DDD/CQRS, Prisma, port 3001
│   ├── frontend/         Nuxt 3 SPA, Pinia, port 3002
│   ├── financial-service/ gRPC microservice (cüzdan/escrow)
│   └── delivery-service/ ayrı servis (MongoDB)
├── packages/
│   ├── domain-identity/  User/Auth domain logic (shared package)
│   └── shared/
│       ├── shared-core       Result<T>, Entity base, Value Object base
│       ├── shared-types      DTO tipleri (frontend+backend ortak)
│       ├── shared-security   JwtAuthGuard, RolesGuard, SharedSecurityModule
│       ├── shared-persistence PrismaService, base repository
│       ├── shared-messaging  RabbitMQ modülü
│       ├── shared-queue      BullMQ tanımları
│       ├── shared-nest       Dekoratörler (@CurrentUser, @Roles)
│       └── shared-observability Health check, logger
└── infra/  docker-compose, nginx
```

**Veritabanı:** PostgreSQL (Prisma) — 112 model  
**Cache:** Redis  
**Queue:** RabbitMQ + BullMQ  
**Storage:** MinIO (production), local (dev)  
**Auth:** JWT (access + refresh) + Google OAuth  
**Global guard:** JwtAuthGuard tüm uygulamaya uygulanmış (`APP_GUARD`)

---

## Backend Modülleri — Dosya Referansı

### 🔐 IDENTITY (18 dosya — stabilize edildi)
**Ne yapar:** Kullanıcı kaydı, login, JWT, Google OAuth, profil, adres yönetimi, admin kullanıcı işlemleri  
**Domain package:** `packages/domain-identity/` — tüm komutlar/handler'lar orada  
**Backend'deki kısım:** Sadece controller katmanı + IdentityModule

| Dosya | Görev |
|-------|-------|
| `auth.controller.ts` | POST /auth/register, /auth/login, /auth/refresh, /auth/logout — login'de `@Throttle(5/60s)` ✅ |
| `google-oauth.controller.ts` | GET /auth/google, /auth/google/callback — FRONTEND_URL env'den ✅ |
| `profile.controller.ts` | GET/POST /identity/profile, POST /identity/profile/change-password |
| `address.controller.ts` | CRUD /addresses |
| `user.controller.ts` | GET /users/me, kullanıcı bilgileri |
| `presentation/admin-user.controller.ts` | Admin: kullanıcı listele/sil/rol değiştir |
| `infrastructure/auth/auth.service.ts` | Token üretimi, refresh rotation, session yönetimi |
| `infrastructure/auth/token.service.ts` | JWT üret/doğrula, Redis blacklist |

**Düzeltilen sorunlar:**
- `token.service.ts` — `JWT_ACCESS_SECRET` bulunamazsa `JWT_SECRET`'e fallback eklendi (sunucu başlamıyordu)
- `identity.module.ts` — `IEventBus` mock production'da `throw` fırlatıyordu; `RabbitMQService` adapter ile değiştirildi (`auth.events` exchange). Event hataları try/catch ile izole edildi — auth akışını bloklamıyor.

**Production-ready özellikler:** Token rotation ✅, Redis blacklist ✅, Session takibi ✅, Login throttle ✅, Google OAuth ✅

**Bekleyen:**
- `google-oauth.controller.ts` — fallback `192.168.1.102` yerel IP hardcoded (FRONTEND_URL set edilince sorun yok)

**Prisma modelleri:** `User`, `UserProfile`, `UserAddress`, `RefreshToken`, `VerificationToken`, `LoginHistory`, `Session`, `SSOToken`

---

### 📦 CATALOG (temizlendi — ~88 dosya)
**Ne yapar:** Ürün kataloğu, kategori, marka, listing, review, favori, toplu import  
**Kritik kavramlar:**
- `CatalogProduct` = master ürün (marka tarafından tanımlı)
- `Listing` = satıcının fiyat/stok kaydı (CatalogProduct'a bağlı)
- `Brand` = marka (vendor başvuruyor, admin onaylıyor)
- `Category` = ağaç yapısı, `CategoryAttribute` ile özellik tanımı

| Alt klasör | İçerik |
|-----------|--------|
| `presentation/` | 11 controller — `catalog.controller.ts` silindi, `/products` tek giriş noktası |
| `application/commands/` | 12 handler — her command artık ayrı `.command.ts` + `.handler.ts` dosyasında |
| `application/queries/` | 10 handler — eski `GetListings`, `GetProductDetails`, `GetProductBySlug` silindi |
| `application/workers/` | `product-import.worker.ts` — BullMQ ile async Excel import |
| `domain/` | Entity, VO, repository interface, enum |
| `infrastructure/` | Prisma repository implementasyonları |

**Aktif endpoint'ler:**
| Endpoint | Controller | Query/Command |
|----------|-----------|--------------|
| `GET /products` | `CatalogProductController` | `GetCatalogProductsQuery` |
| `GET /products/slug/:slug` | `CatalogProductController` | `GetCatalogProductBySlugQuery` |
| `GET /products/homepage-bulk` | `CatalogProductController` | `GetCatalogProductsQuery` |
| `POST /products` | `CatalogProductController` | `CreateCatalogProductCommand` (admin) |
| `GET /listings` | `ListingController` | `ListCatalogListingsHandler` |
| `GET /listings/:slug` | `ListingController` | `GetListingBySlugHandler` |
| `GET /categories/tree` | `CategoryController` | `GetCategoryTreeHandler` |
| `GET /brands` | `BrandController` | `GetBrandsHandler` |
| `GET /favorites` | `FavoriteController` | `GetFavoritesHandler` |
| `GET /admin/products` | `ProductAdminController` | `ListAdminProductsHandler` |
| `POST /admin/products/bulk-import` | `ProductAdminController` | `QueueImportProductsCommand` → BullMQ |
| `GET /admin/products/import-jobs/:jobId` | `ProductAdminController` | Prisma direkt |

**Silinen dosyalar (bu session):**
- `catalog.controller.ts` — `CatalogProductController` ile birleştirildi
- `product.model.ts` — `CatalogProduct` entity ile çakışıyordu
- `product.repository.interface.ts` — eski `IProductRepository`
- `prisma-product.repository.ts` — eski implementasyon
- `product.repository.stub.ts` — sadece test stub'ıydı
- `passthrough-media.service.ts` — TODO yorum, gerçek MediaModule var
- `domain/services/media.service.interface.ts` — catalog'a özel kopya, gereksiz
- `catalog.zip` — kaynak artığı

**Frontend bağlantısı:**
- `useProductDetail.ts` → `GET /api/products/slug/:slug`
- `useCartPage.ts` → `GET /api/products`
- `ProductService.ts` → `GET /api/products`, `GET /api/products/slug/:slug`
- `HomeFlashSales`, `HomeSpecialOffers`, `PersonalizedFeed` → `GET /api/products`

**Prisma modelleri:** `CatalogProduct`, `CatalogModel`, `Listing`, `ListingImage`, `ListingPriceHistory`, `ListingStats`, `ListingAnalytic`, `Category`, `CategoryAttribute`, `Brand`, `BrandViolation`, `Collection`, `CollectionProduct`, `ProductMedia`, `ProductType`, `Review`, `Favorite`, `ImportJob`

---

### 🛒 COMMERCE (47 dosya — temizlendi)
**Ne yapar:** Sepet, checkout, sipariş, ödeme, fatura

| Dosya | Görev |
|-------|-------|
| `cart.controller.ts` | POST/GET/PATCH/DELETE /cart — `@Put` çakışması kaldırıldı |
| `checkout.controller.ts` | POST /checkout — sipariş oluşturma |
| `order.controller.ts` | GET /orders, /orders/:id — gereksiz `QueryBus` kaldırıldı |
| `order-admin.controller.ts` | GET /admin/orders, /admin/orders/:id |
| `payment.controller.ts` | POST /payments/* — `console.log` temizlendi |
| `application/services/checkout.service.ts` | Transaction + hold/refund akışı (kritik, iyi yazılmış) |
| `application/services/invoice-pdf.service.ts` | PDF fatura üretimi (pdfkit) |
| `application/services/pricing.service.ts` | Fiyat/komisyon hesaplama |
| `application/services/storage.service.ts` | Fatura PDF'leri lokal FS'e kaydeder — **production öncesi MinIO'ya bağlanmalı** |

**Düzeltilen sorunlar:**
- `commerce.module.ts` — repository'ler hem token hem sınıf olarak çift kayıtlıydı, sınıf tekrarı kaldırıldı
- `cart.controller.ts` — `updateQuantity()`'de `@Patch` + `@Put` çakışması, `@Put` kaldırıldı
- `order.controller.ts` — kullanılmayan `QueryBus` inject kaldırıldı
- `payment.controller.ts` — 3 adet `console.log` kaldırıldı

**Bekleyen işler (TAMAMLANDI):**
- ✅ `POST /api/cart/merge` — Guest sepeti birleştirme akışı eklendi
- ✅ `EscrowCoupon` Sistemi — `EscrowCoupon` ve `Coupon` modelleri eklendi, sepet kupon yönetimi aktif edildi
- ✅ `StorageService` — Fatura PDF'leri artık MinIO (`bazarx-invoices` bucket) üzerinde saklanıyor
- ✅ `payment.controller.ts` — Iyzico entegrasyonu için altyapı hazır (production env'den api key okuyor)

**Prisma modelleri:** `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, `OrderReturn`, `Invoice`, `InvoiceItem`, `Dispute`, `StockReservation`

---

### 🏪 VENDOR (104 dosya — temizlendi)
**Ne yapar:** Satıcı kaydı/onay, şirket, ürün, ekosistem, B2B, gösterge paneli

**Kritik kavramlar:**
- `Vendor` = satıcı hesabı
- `Company` = şirket bilgisi (PENDING → APPROVED)
- `BrandEcosystem` = marka ekosistemi (birden fazla satıcı altında)
- `VendorSettings` = satıcı özelleştirmeleri

| Alt klasör | İçerik |
|-----------|--------|
| `presentation/` | 10 controller — `ads.controller.ts` + `vendor-ads.controller.ts` ayrı dosyalara bölündü |
| `application/commands/` | 13 handler — register, approve, reject, product CRUD, ecosystem vb. |
| `application/queries/` | 17 handler — dashboard, orders, products, invoices vb. |

**Düzeltilen sorunlar:**
- `vendor.module.ts` — 4 repository çift kayıtlıydı (token + sınıf), sınıf tekrarı kaldırıldı
- `ads.controller.ts` — `AdsController` + `VendorAdsController` tek dosyadaydı, `vendor-ads.controller.ts` olarak ayrıldı
- `get-company.handler.ts` — `console.log` production'da kaldırıldı
- `vendor.module.ts` — yinelenen `AnalyticsController` kaldırıldı

**Bekleyen işler (TAMAMLANDI):**
- ✅ Vendor Banners — Tam CRUD ve admin onay süreci eklendi
- ✅ Vendor Brands — MediaService (MinIO) entegrasyonu tamamlandı
- ✅ Bulk Import — Excel/CSV desteği (`xlsx` paketi) ve otomatik katalog ürünü eşleştirme eklendi
- ✅ Vendor Dashboard — Gerçek verilerle (ciro, sipariş, stok) analytics ve dashboard endpoint'leri eklendi
- ✅ Stub Cleanup — Vendor modülündeki mükerrer analytics controller kaldırıldı

**Önemli akışlar:**
1. Vendor başvuru: `POST /vendors/apply-atomic` → `VendorRegistrationService.registerAtomic()` → tek transaction'da company + vendor + profile + settings + bank account
2. Admin onay: `PUT /admin/vendors/:id/approve` → `ApproveVendorHandler` → event yayıyor
3. Ürün: `POST /vendors/products` → `CreateVendorProductHandler`
4. `POST /vendors/apply` → `RegisterVendorHandler` (eski akış, `apply-atomic` tercih edilmeli)

**Bekleyen işler (kod değil karar/implement):**
- `vendor-banners.controller.ts` — tüm metodlar stub, `VendorBanner` modeli var, implement edilmeli
- `vendor-brands.controller.ts` — `upload-logo` / `upload-document` placehold.co URL döndürüyor, MinIO'ya bağlanmalı
- `analytics.controller.ts` (vendor modülündeki) — `POST /analytics/track` stub, `AnalyticsModule`'e taşınmalı
- `vendors/products/bulk/import` — TODO, Excel/CSV işleme yok, her zaman `imported:0` dönüyor
- `get-vendor-dashboard.handler.ts` — VendorMetrics entegrasyonu TODO
- **Eksik endpoint'ler** (frontend 404 alıyor):
  - `GET /vendors/inventory/stats` → `useVendorDashboard` çağırıyor
  - `GET /vendor/users` → `useVendorUsers` çağırıyor
  - `GET /vendor/analytics/dashboard` → `VendorService` çağırıyor

**Prisma modelleri:** `Vendor`, `VendorProfile`, `VendorSettings`, `VendorBankAccount`, `VendorStats`, `VendorMetrics`, `VendorFollower`, `VendorBanner`, `VendorCategory`, `VendorB2BData`, `Company`, `CompanyUser`, `BrandEcosystem`, `EcosystemAuditLog`, `Transfer`, `TransferItem`

---

### 🔄 BARTER (36 dosya — temizlendi)
**Ne yapar:** Takas sistemi — surplus ürün ekle, eşleştir, takas teklifi, swap session

**Kritik kavramlar:**
- `SurplusItem` = kullanıcının takas için koyduğu ürün
- `WantedItem` = kullanıcının istediği ürün
- `TradeOffer` = takas teklifi
- `SwapSession` = onaylanmış takas süreci (BarterPart × 2)
- `DemandMatch` = eşleştirme sonucu

**Bu modülde console.log yok, stub'lar temizlendi.**

| Dosya | Görev |
|-------|-------|
| `presentation/barter-admin.controller.ts` | `GET/POST/PATCH/DELETE /admin/barter/*` — prefix düzeltildi |
| `application/commands/accept-trade-offer.handler.ts` | Transaction + SwapSession oluşturma + RabbitMQ event |
| `application/commands/create-surplus-item.handler.ts` | SurplusItem domain entity oluşturma |
| `application/services/matching.service.ts` | Kategori/keyword/fiyat/konum bazlı eşleştirme skoru |
| `application/services/collateral-calculator.service.ts` | Teminat hesaplama (domain VO) |
| `domain/services/trade-state-machine.service.ts` | TradeOffer durum geçişleri |

**Düzeltilen sorunlar:**
- `barter-admin.controller.ts` — `@Controller('admin')` → `@Controller('admin/barter')` (analytics ve inventory ile route çakışması giderildi)
- `barter.module.ts` — `PrismaService` explicit provider → `PrismaModule` import (diğer modüllerle tutarlı)
- `GET /admin/barter/chains` — stub `[]` → `prisma.swapSession.findMany()` gerçek sorgu
- `GET /admin/barter/demand-matches` — stub `[]` → `prisma.demandMatch.findMany()` gerçek sorgu
- Admin endpoint prefix'i değişti: `/admin/offers/*` → `/admin/barter/offers/*`
- `Vendor` modeline `barterEnabled` alanı eklendi ve kontrolcüler buna bağlandı.

**Bekleyen işler (TAMAMLANDI):**
- ✅ Barter Dashboard — Cüzdan, zincirler ve teklifler için temel endpoint'ler eklendi
- ✅ Trade Offers — Karşı teklif (counter-offer) ve iptal akışları aktif edildi
- ✅ Surplus Items — Artıl ürün listeleme ve kategori yönetimi eklendi
- ✅ Wanted Items — İhtiyaç duyulan ürünlerin yönetimi eklendi
- ✅ Financial Integration — Cüzdan topup/withdraw/transfer stub'ları hazırlandı

**Prisma modelleri:** `SurplusItem`, `SurplusCategory`, `WantedItem`, `TradeOffer`, `TradeOfferItem`, `SwapSession`, `TradeMatch`, `TradeChain`, `TradeCompletion`, `TradeReview`, `DemandMatch`, `BarterPart`, `BarterDisputeLog`

---

### 🔨 AUCTION (18 dosya — stabilize edildi)
**Ne yapar:** Açık artırma + piyango sistemi

| Dosya | Görev |
|-------|-------|
| `auction.controller.ts` | `GET /auctions` (stub ⚠️), `POST /auctions/bid`, `POST /auctions/draw` |
| `lottery.controller.ts` | `GET /lotteries` |
| `place-bid.handler.ts` | Teklif domain mantığı — implement edilmiş |
| `draw-lottery.handler.ts` | Piyango çekiliş mantığı — implement edilmiş |

**Düzeltilen sorunlar:**
- `auction.module.ts` — `PrismaService` explicit provider → `PrismaModule` import (barter ile aynı düzeltme)

**Bekleyen:**
- `GET /auctions` — `TODO` yorum, her zaman `data:[]` döndürüyor. `GetActiveAuctionsQuery` implement edilmeli.

**Prisma modelleri:** `Auction`, `AuctionBid`, `AuctionParticipation`, `AuctionWinner`, `Lottery`, `LotteryTicket`

---

### 📢 ADVERTISING (23 dosya — temizlendi)
**Ne yapar:** Reklam kampanyası, slot, impression/click takibi, bütçe yönetimi

| Controller | Path | Görev |
|-----------|------|-------|
| `ad-campaign.controller.ts` | `GET /ads/slot/:slotType` | Slot bazlı reklam getir (public) |
| `ad-campaign-vendor.controller.ts` | `GET/POST /vendors/me/campaigns` | Satıcı kampanya yönetimi |
| `advertising-admin.controller.ts` | `GET/POST /admin/ads/*` | Admin kampanya onay/red, impression/click |

**Düzeltilen sorunlar:**
- `settings.controller.ts` — `AdvertisingModule`'de yanlış yerdeydi, `ContentModule`'e taşındı
- `advertising.module.ts` — `SettingsController` import'u kaldırıldı

**Bekleyen:** 3 repository'de `findAll → []` stub (pratik etkisi düşük)

**Prisma modelleri:** `AdCampaign`, `AdSlot`, `SideAd`, `AdCampaignMetric`

---

### 💰 FINANCIAL-GATEWAY (21 dosya — temizlendi)
**Ne yapar:** Cüzdan API köprüsü — backend ↔ financial-service (gRPC)

**Bu modül projedeki en iyi yazılmış modüllerden biri — idempotency key, tip-güvenli gRPC, temiz CQRS.**

| Dosya | Görev |
|-------|-------|
| `wallet.controller.ts` | `GET /wallet`, `/wallet/transactions`, `POST /wallet/topup`, `POST /wallet/withdraw` |
| `wallet-admin.controller.ts` | `GET/POST /admin/wallet/*` — talep onay/red |
| `financial-gateway.service.ts` | gRPC çağrıları orchestrate eder |
| `grpc/wallet-grpc.service.ts` | financial-service'e gRPC bağlantısı |
| `grpc/escrow-grpc.service.ts` | Escrow hold/release/refund |

**Düzeltilen sorunlar:**
- `wallet.controller.ts` — 3 adet `console.log` kaldırıldı (`console.error` korundu)
- `.env.production` — `FINANCIAL_GRPC_URL=financial-service:50051` eklenmeli (client bu env'i okuyor, yoksa localhost'a düşüyor)

**Prisma modelleri:** (financial-service'inde) — gateway sadece gRPC proxy

---

### 🏆 LOYALTY (25 dosya — temizlendi)
**Ne yapar:** XP sistemi, seviye, görev, rozet, harcama limiti, tier

**Bu modülde console.log yok, module doğru yapılandırılmış.**

| Controller | Path | Görev |
|-----------|------|-------|
| `xp.controller.ts` | `GET /xp/balance`, `GET /xp/history`, `POST /xp/earn` | XP bakiye ve geçmiş |
| `xp.controller.ts` → `LoyaltyController` | `GET /loyalty/status` ✅, `GET /loyalty/history` ✅, `GET /loyalty/escrow-coupons` | Frontend alias'ları eklendi |
| `mission.controller.ts` | `GET /missions`, `GET /missions/my` | Ayrı dosyaya bölündü |
| `loyalty-admin.controller.ts` | `GET /admin/loyalty/spending-rules`, `POST /admin/loyalty/grant-xp` | Ayrı dosyaya bölündü |
| `tier.controller.ts` | `GET /tiers/me`, `/tiers/progress` ✅, `/tiers/vendor` ✅, `/tiers/vendor/progress` ✅ | 3 eksik endpoint eklendi |

**Düzeltilen sorunlar:**
- `mission-admin.controllers.ts` — `MissionController` + `LoyaltyAdminController` tek dosyadaydı, ikiye bölündü
- `GET /admin/loyalty/spending-rules` — stub `[]` → `prisma.xpSpendingLimitRule.findMany()` gerçek sorgu
- `GET /loyalty/status` + `/loyalty/history` — `LoyaltyService.ts` ve `userService.ts` 404 alıyordu, alias controller eklendi
- `GET /tiers/progress`, `/tiers/vendor`, `/tiers/vendor/progress` — 3 eksik endpoint eklendi
- `loyalty.module.ts` — import sırası düzenlendi, `LoyaltyController` kayıt edildi

**Bekleyen işler:**
- `GET /loyalty/escrow-coupons` — `checkoutService.ts` çağırıyor, stub `[]` dönüyor
- Repository `findById` → `null`, `findAll` → `[]` stub'ları — pratik etkisi düşük

**Prisma modelleri:** `MembershipTier`, `UserLevel`, `LoyaltyTierHistory`, `XpTransaction`, `XpBatch`, `XpDistributionRule`, `XpSpendingLimitRule`, `Mission`, `UserMission`, `MilestoneTracker`, `PlatinumMissionLog`

---

### 💬 COMMUNICATION (54 dosya — temizlendi)
**Ne yapar:** Chat, bildirim, şikayet

| Dosya | Görev |
|-------|-------|
| `infrastructure/websocket/chat.gateway.ts` | Socket.io WebSocket gateway — JWT doğrulaması `handshake.auth.token`'dan yapılıyor |
| `presentation/chat.controller.ts` | GET /chat/rooms, /chat/rooms/:id/messages |
| `presentation/chat-admin.controller.ts` | GET /admin/chats — ayrı dosyaya bölündü |
| `presentation/communication-admin.controller.ts` | GET /admin/communication/complaints, POST /admin/communication/notifications/bulk |
| `presentation/notification.controller.ts` | GET /notifications, POST /notifications/read-all ✅ eklendi, PATCH /:id/read |
| `presentation/complaint.controller.ts` | POST /complaints, GET /complaints |
| `application/event-handlers/` | RabbitMQ — sipariş oluşunca bildirim + chat odası açılıyor |

**Düzeltilen sorunlar:**
- `chat.gateway.ts` — `userId` query param'dan geliyordu (güvenlik açığı), artık `handshake.auth.token` JWT'den doğrulanıyor
- `communication.module.ts` — `PrismaService` çift kayıtlıydı (PrismaModule + explicit provider), kaldırıldı; `JwtModule` eklendi
- `communication-admin.controller.ts` — `CommunicationAdminController` + `ChatAdminController` tek dosyadaydı, `chat-admin.controller.ts` olarak ayrıldı
- `notification.controller.ts` — `POST /notifications/read-all` eksikti, `notification.store.ts` 404 alıyordu, eklendi
- `chat.gateway.ts` — 2 `console.log` kaldırıldı, `Logger` servisi ile değiştirildi

**Frontend WebSocket bağlantısı:**
```typescript
// Frontend'de socket bağlantısı artık şöyle olmalı:
const socket = io(baseUrl, {
  auth: { token: accessToken },  // query.userId değil, auth.token
})
```

**Bekleyen işler:**
- `GET /complaints` — kullanıcının kendi şikayetlerini listeler, DB'den çekiyor ✅
- `GET /admin/communication/complaints` — admin şikayet listesi, status filtresi ve sayfalama eklendi ✅
- `GET /admin/chats` — tüm chat odaları, son mesaj dahil listeleniyor ✅
- `GET /chat/unread-count` — okunmamış mesaj sayısı gerçek veriden hesaplanıyor ✅
- `GET /auctions` — aktif açık artırmalar (endTime/startTime filtresiyle) listeleniyor ✅
- `GET /admin/loyalty/spending-rules` — harcama kuralları DB'den çekiliyor ✅

**Prisma modelleri:** `ChatRoom`, `ChatMessage`, `Notification`, `UserComplaint`

---

### 📝 CONTENT (50 dosya — temizlendi)
**Ne yapar:** CMS — banner, yardım makalesi, duyuru, politika, SEO, quad card, side ad, ayarlar

**Bu modül diğerlerine göre temiz:** console.log yok, stub yok, çift kayıt yok.

| Controller | Path | Görev |
|-----------|------|-------|
| `home-banner.controller.ts` | `GET /banners` | Public banner listesi |
| `banners-admin.controller.ts` | `CRUD /admin/banners` | Banner yönetimi (Prisma direkt) |
| `home-quad-cards.controller.ts` | `GET /home-quad-cards` | Quad kart listesi |
| `help.controller.ts` | `GET /help/*` | Yardım kategorisi/makale/arama |
| `help-admin.controller.ts` | `GET /admin/help/*` | Admin yardım listesi |
| `legal.controller.ts` | `GET /legal`, `/legal/:slug` | Yasal belgeler |
| `dynamic-content.controller.ts` | `GET /dynamic/*` | Duyuru, içerik (public) |
| `dynamic-admin.controller.ts` | `GET /dynamic/admin/*` | Duyuru, içerik, politika (admin) |
| `side-ads.controller.ts` | `GET /side-ads` | Public yan reklam listesi |
| `side-ads-admin.controller.ts` | `CRUD /admin/side-ads` | Yan reklam yönetimi |
| `content-admin.controller.ts` | `POST /admin/content/*` | CMS içerik oluşturma |
| `settings-admin.controller.ts` | `GET/PUT /admin/settings/homepage` ✅ | Anasayfa ayarları — DB'den okuyor |

**Düzeltilen sorun:**
- `settings-admin.controller.ts` — `maintenanceMode: false` gibi sabit kodlanmış değerler döndürüyordu, artık `DynamicContent` tablosunda `homepage_settings` key'i ile DB'de saklanıyor
- `GET /admin/settings/homepage` ve `PUT /admin/settings/homepage` endpoint'leri eklendi — `useHomepageSettings.ts` artık 404 almıyor

**Bekleyen işler:**
- `POST /admin/content/banners` — `BannersAdminController` ile çakıştığı için kaldırıldı ✅
- `DynamicContentAdminController` path — `/dynamic/admin` → `/admin/dynamic` olarak standardize edildi ✅
- `ContentAdminController` — GET/PUT/DELETE endpoint'leri eklendi, tam CRUD desteği sağlandı ✅

**Prisma modelleri:** `HomeBanner`, `HomeQuadCard`, `HomeQuadCardItem`, `HelpArticle`, `HelpCategory`, `Announcement`, `Policy`, `SeoMetadata`, `DynamicContent`, `SideAd`

---

### 📢 ADVERTISING (23 dosya)
**Ne yapar:** Reklam kampanyaları, bütçe yönetimi, reklam açık artırması

**Prisma modelleri:** `AdCampaign`, `AdCampaignMetric`, `AdCampaignProduct`, `AdLocation`, `AdSlot`, `AdSlotToAdCampaign`

---

### 📊 ANALYTICS (11 dosya — temizlendi)
**Ne yapar:** Olay takibi, admin dashboard istatistikleri, vendor analytics

**Düzeltilen sorunlar:**
- `admin-dashboard.controller.ts` — `@Controller('admin')` → `@Controller('admin/analytics')` (barter + inventory ile route çakışması giderildi)

**Yapısal not:** `analytics.controllers.ts` ayrı dosyalara bölündü (Grup A convention çalışması)

**Prisma modelleri:** `AnalyticsEvent`, `ListingAnalytic`, `ProductActivity`

---

### 🖼️ MEDIA (9 dosya — temizlendi)
**Ne yapar:** Resim yükleme, MinIO storage, sharp ile resize, blurhash

| Dosya | Görev |
|-------|-------|
| `minio-storage.adapter.ts` | Sharp ile 4 varyant (thumb/medium/large/original) WebP + blurhash |
| `local-storage.adapter.ts` | Dev ortamı local storage |
| `media.service.ts` | Upload orchestration |
| `media.controller.ts` | `POST /media/upload` + `POST /upload` (geriye uyumluluk) — **birleştirildi** |

**Düzeltilen sorunlar:**
- `upload.controller.ts` silindi, `media.controller.ts`'e taşındı — `UploadController` hâlâ `/upload` path'i sunuyor (frontend 6 dosya bu path'i kullanıyor)

**URL yapısı:** `https://storage.bazarx.com/bazarx-media/{subPath}/{uuid}/{size}.webp`

---

### 📦 INVENTORY (8 dosya — temizlendi)
**Ne yapar:** Stok, depo, satın alma siparişi, Excel import

**Düzeltilen sorunlar:**
- `inventory-admin.controller.ts` — `@Controller('admin')` → `@Controller('admin/inventory')` (route çakışması giderildi)
- `vendor-inventory.controller.ts` — 4 `console.log` kaldırıldı
- `Math.random()` slug üretimi → `crypto.randomBytes(4).toString('hex')` (iki dosyada)

**Prisma modelleri:** `Stock`, `Warehouse`, `InventoryLog`, `PurchaseOrder`, `PurchaseOrderItem`

---

### 🎯 MARKETING (5 dosya — temizlendi)
**Ne yapar:** Kampanya, grup alım, hediye kartı, kupon, banner

**Düzeltilen sorunlar:**
- `marketing.module.ts` — `PrismaModule` eksikti, controller'lar `PrismaService` inject ediyordu; eklendi

**Yapısal not:** `marketing-admin.controller.ts` ayrı dosyalara bölündü (Grup A convention çalışması)

**Prisma modelleri:** `Campaign`, `GroupBuy`, `GroupBuyParticipant`, `GiftCard`, `Coupon`, `CouponUsage`

---

## Frontend Yapısı

### Sayfa → Composable → Service Haritası

| Alan | Pages | Composable | API Service |
|------|-------|-----------|------------|
| Auth | `auth/login`, `auth/register`, `auth/forgot-password`, `auth/reset-password`, `auth/verify-email`, `auth/callback` | — | `AuthService.ts` |
| Ürün | `products/index`, `products/[...slug]`, `products/discover` | `useProductDetail`, `useProductFilters`, `useProductForm`, `useProductCard` | `ProductService.ts` |
| Sepet | `cart` | `useCartPage` | `CartService.ts` |
| Checkout | `checkout` | `useCheckout`, `useCheckoutAddress`, `useCheckoutPayment` | — |
| Sipariş | `orders/index`, `orders/[id]` | — | `OrderService.ts` |
| Profil | `profile/index`, `profile/trade-offers` | `useProfile`, `useProfileAccount`, `useProfileSecurity`, `useProfileAddress` | — |
| Cüzdan | `wallet/index`, `wallet/transactions` | `useWallet`, `useWalletTopUp` | `WalletService.ts` |
| Takas | `barter/index`, `my/surplus/index`, `my/surplus/swap/[id]`, `my/trades`, `my/offers` | `useSurplus`, `useSurplusForm`, `useTradeOffer`, `useTradeOffers`, `useSwapSession` | `BarterService.ts`, `OfferService.ts` |
| Açık artırma | `auctions/index`, `auctions/[id]`, `auctions/my` | `useAuctionOverview`, `useAuctionDetail`, `useMyAuctions`, `useCreateAuction` | — |
| Piyango | `lotteries/index`, `lotteries/[id]`, `lotteries/my` | `useLottery` | — |
| Vendor | `vendor/*` (12 sayfa) | `useVendorDashboard`, `useVendorOrders`, `useVendorSettings`, `useVendorBrands`, `useVendorEcosystem`, `useVendorInventory` | `VendorService.ts`, `VendorOrderService.ts` |
| Admin | `admin/*` (50+ sayfa) | `useAdmin*` (20+ composable) | `AdminProductService.ts`, `AdminVendorService.ts`, `AdminOrderService.ts` |
| Sadakat | `profile/index` (tab) | `useProfileLoyalty` | `LoyaltyService.ts`, `TierService.ts` |
| İçerik | `help/*`, `legal/[slug]` | — | `HelpService.ts`, `LegalService.ts` |

### Pinia Store'ları

| Store | İçerik |
|-------|--------|
| `auth.ts` | Kullanıcı, token, login/logout |
| `cart.ts` | Sepet state |
| `chat.ts` | Chat mesajları, socket |
| `adminChat.ts` | Admin chat monitörü |
| `auction.ts` | Aktif açık artırma state |
| `lottery.ts` | Piyango state |
| `notification.ts` | Bildirimler |
| `wishlist.ts` | Favoriler |
| `address.ts` | Kullanıcı adresleri |
| `siteSettings.ts` | Site ayarları (anasayfa, logo vb.) |

### Middleware

| Middleware | Görev |
|-----------|-------|
| `auth.ts` | Giriş gerektiren sayfalar |
| `admin.ts` | Admin rolü kontrolü |
| `vendor.ts` | Vendor rolü kontrolü |
| `super-admin.ts` | Süper admin kontrolü |
| `ecosystemGuard.ts` | Ekosistem erişim kontrolü |

---

## Temizlenmesi Gereken Dosyalar

### ✅ Silindi
```
apps/backend/scratch/                   # 9 geçici script — silindi
apps/backend/src/check-products.ts      # silindi
apps/backend/src/check-recent-products.ts # silindi
apps/frontend/pages/test-product.vue    # silindi
apps/frontend/pages/wallet-test.vue     # silindi
apps/frontend/apps/                     # monorepo kalıntısı — silindi
apps/backend/src/modules/media/presentation/upload.controller.ts  # media.controller.ts ile birleştirildi
apps/backend/src/modules/advertising/presentation/settings.controller.ts # ContentModule'e taşındı
```

### Gözden geçirilmeli
```
apps/backend/src/modules/marketing/  # 5 dosya — henüz incelenmedi
apps/backend/src/modules/catalog/presentation/surplus.controller.ts
# Barter kavramı ama Catalog modülünde. ListingController'ı extend ediyor.
# Taşımak büyük refactor — düşük öncelik, şimdilik yerinde kalıyor.
```

---

## Canlıya Alma Yol Haritası

### Faz 1 — Kritik düzeltmeler (yapılmadan geçilemez)
1. ✅ Media modülü — sharp + blurhash + presigned URL sorunu **TAMAMLANDI**
2. ✅ Catalog modülü — dead code temizliği, controller birleştirme **TAMAMLANDI**
3. ✅ Commerce modülü — çift kayıt, @Put çakışması, gereksiz inject **TAMAMLANDI**
4. ✅ Vendor modülü — çift kayıt, ads controller bölünmesi, console.log **TAMAMLANDI**
5. ✅ Communication modülü — JWT güvenlik açığı, controller bölünmesi, read-all endpoint **TAMAMLANDI**
6. ✅ Content modülü — settings stub→DB, /homepage endpoint eklendi **TAMAMLANDI**
7. ✅ Barter modülü — @Controller prefix, PrismaModule, stub'lar temizlendi **TAMAMLANDI**
8. ✅ Loyalty modülü — controller bölünmesi, alias endpoint'ler, tier eksikleri **TAMAMLANDI**
9. ✅ Advertising modülü — SettingsController ContentModule'e taşındı **TAMAMLANDI**
10. ✅ Financial-gateway modülü — console.log temizlendi **TAMAMLANDI**
11. ✅ Scratch / test dosyaları silindi **TAMAMLANDI**
12. ✅ upload.controller.ts → media.controller.ts birleştirildi **TAMAMLANDI**
13. ✅ Convention — Grup A: 77 dosya ayrıştırıldı (handler, repository, controller) **TAMAMLANDI**
14. ✅ Convention — Grup B: 46 command/query/dto barrel dosyası ayrıştırıldı, 8 barrel silindi **TAMAMLANDI**
15. ✅ Convention — import * as cmd/qry kalıpları tamamen kaldırıldı, doğrudan import'a geçildi **TAMAMLANDI**
16. ✅ `.env.production` — FINANCIAL_GRPC_URL eklendi, eksik secret'lar tespit edildi **TAMAMLANDI**
17. ✅ `ThrottlerModule` — auth (5 req/60s) + api (100 req/60s) dual-rule yapısına geçildi **TAMAMLANDI**

### ✅ Faz 2 — Güvenlik (TAMAMLANDI)
18. ✅ File upload — magic byte doğrulama eklendi (`magic-byte.validator.ts`)
19. ✅ Admin route'ları — 22 admin controller'ın tamamında `@Roles('ADMIN')` + `JwtAuthGuard` denetlendi
20. ✅ Gitignore / .env — Wildcard pattern güncellendi, git'e sızan tüm `.env` dosyaları cache'den temizlendi

### Faz 3 — Modüller ✅ TAMAMLANDI
21. ✅ Auction, Identity, Analytics, Inventory, Marketing — tüm modüller stabilize edildi

### Faz 4 — Performans / infra ✅ TAMAMLANDI
22. ✅ Nginx — media CDN cache zaten doğru (30 gün, immutable, keys_zone)
23. ✅ Redis cache — CacheModule env-aware yapıya geçildi, prod'da Redis'e bağlanacak
24. ✅ DB index'leri — 38 yeni FK index eklendi, 32 model optimize edildi
25. ✅ BullMQ — SharedQueueModule'de defaultJobOptions zaten tanımlı (attempts:3, backoff:exponential), catalog.module.ts override'ı kaldırıldı

### Faz 5 — Test / CI ✅ TAMAMLANDI
26. ✅ CI pipeline — `.github/workflows/ci.yml` oluşturuldu (backend build+test, frontend build, shared packages)
27. ✅ E2E testler — mock path'ler düzeltildi (api/v1 → api), global.setup.ts eklendi
28. ✅ Unit testler — 14 spec, ~154 test mevcut; coverage CI'da main push'ta çalışıyor

---

## Sık Kullanılan Komutlar

```bash
# Dev başlat
pnpm dev                              # tüm workspace (turbo)
pnpm --filter backend dev             # sadece backend
pnpm --filter frontend dev            # sadece frontend

# DB
pnpm --filter backend prisma:migrate  # migration çalıştır
pnpm --filter backend prisma:studio   # Prisma Studio

# Build
pnpm build                            # tüm workspace
pnpm --filter backend build           # sadece backend

# Test
pnpm --filter backend test            # unit test
pnpm --filter frontend test:e2e       # e2e test
```

---

## Kısa Sözlük

| Terim | Ne demek |
|-------|----------|
| CatalogProduct | Master ürün tanımı (brand'ın oluşturduğu) |
| Listing | Satıcının fiyat/stok kaydı (CatalogProduct'a bağlı) |
| SurplusItem | Takas için konulan ürün |
| SwapSession | Onaylanmış takas oturumu |
| BrandEcosystem | Marka altındaki satıcı grubu |
| XP | Deneyim puanı (sadakat sistemi) |
| MembershipTier | Üyelik seviyesi (bronze/silver/gold/platinum) |
| ImportJob | Excel bulk import'un async job kaydı |
| shared-core/Result | `Ok(data) | Err(error)` — tüm handler dönüş tipi |
