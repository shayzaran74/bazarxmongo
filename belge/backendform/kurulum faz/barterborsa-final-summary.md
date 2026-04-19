# BarterBorsa — Backend Tamamlanmış Proje Özeti (v2.0)

> Bu dosyayı her yeni Claude konuşmasında paylaş.
> "Bu proje özetini oku ve devam edelim" de.
> Son güncelleme: Nisan 2026

---

## 1. Proje Tanımı

**BarterBorsa / BazarX** — Trendyol ölçeğinde, NestJS + Nuxt 3 tabanlı ticari takas (barter) ve e-ticaret platformu. Backend tamamlandı, frontend yeniden yazılacak.

---

## 2. Mimari Kararlar (Kesinleşmiş — Değişmeyecek)

| Karar | Seçim |
|-------|-------|
| Backend Framework | NestJS 10+ / Fastify adapter |
| Frontend Framework | Nuxt 3 / Vue 3 / Tailwind CSS / Pinia |
| Monorepo | Turborepo + pnpm workspaces |
| Package prefix | @barterborsa/* |
| Core DB | PostgreSQL 16 (Prisma ORM) |
| Document DB | MongoDB 7 (Mongoose) — delivery service |
| Cache/Session | Redis 7 |
| Event Bus | RabbitMQ 3.13 |
| Auth | Google OAuth2 + JWT (access 15dk / refresh 7gün) + Redis session |
| Financial | Hibrit — gRPC (senkron) + RabbitMQ (asenkron) |
| API Protocol | REST (public) + gRPC (inter-service) |
| DDD | Entity, AggregateRoot, ValueObject, Repository pattern |
| CQRS | NestJS CQRS — Command/Query ayrımı |
| Real-time | WebSocket (Socket.IO) — chat + kargo takibi |
| Observability | OpenTelemetry + Prometheus + Health checks |
| CI/CD | GitHub Actions (build → test → deploy) |
| Docker | Multi-stage build, non-root user, healthcheck |

---

## 3. Servis Mimarisi

```
apps/backend (NestJS + Fastify) :3001
  └── PostgreSQL (barterborsa_core)
  └── Redis (session, cache, rate limit, JWT blacklist)
  └── RabbitMQ (event bus)

apps/financial-service (NestJS + Fastify) :3004 / gRPC :50051
  └── PostgreSQL (barterborsa_financial — ayrı DB)

apps/delivery-service (NestJS + Fastify) :3005 / gRPC :50052
  └── MongoDB (barterborsa_delivery)

frontend/ (Nuxt 3) :3000
  └── BFF Proxy (server/api/v1/[...].ts) → backend :3001
```

**İletişim:**
- Frontend → BFF Proxy → Backend (cookie-to-bearer dönüşümü)
- Backend → Financial Service (gRPC senkron + RabbitMQ asenkron)
- Backend → Delivery Service (gRPC senkron + RabbitMQ asenkron)
- Tüm servisler → RabbitMQ (event-driven, outbox pattern)

---

## 4. Backend Modül Yapısı

```typescript
// apps/backend/src/app-components.ts
CORE:     [IdentityModule, FinancialGatewayModule]
MARKET:   [VendorModule, CatalogModule, InventoryModule, CommerceModule]
EXCHANGE: [BarterModule, AuctionModule]
SUPPORT:  [CommunicationModule, ContentModule, AdvertisingModule, LoyaltyModule, AnalyticsModule]
```

### 4.1 CORE Modüller

**IdentityModule** — Kullanıcı yönetimi ve kimlik doğrulama
- User, UserProfile, UserAddress, RefreshToken, Session, LoginHistory
- Google OAuth2 + JWT (access/refresh) + Redis session
- Login lockout (5 başarısız → 30dk), refresh token rotation
- RBAC: @Roles('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN')
- Endpoints: /auth/*, /users/*, /users/me/profile, /users/me/addresses

**FinancialGatewayModule** — Financial service facade (iş mantığı YOK)
- gRPC client → financial-service (bakiye, ödeme, escrow)
- RabbitMQ listener (payment.completed, payment.failed)
- WalletGrpcService, EscrowGrpcService
- Timeout 5sn, retry max 3

### 4.2 MARKET Modüller

**VendorModule** — Satıcı yönetimi
- Company (vergi no, MERSIS, KEP), CompanyUser
- Vendor (status: PENDING→APPROVED), VendorProfile, VendorSettings
- VendorB2BData, VendorBankAccount (IBAN validasyonu), VendorMetrics, VendorStats
- BrandEcosystem (iç komisyon %4), Subscription
- VendorFollower, VendorBanner, VendorCategory
- Endpoints: /companies/*, /vendors/*, /vendors/me/*, /ecosystems/*, /admin/vendors/*

**CatalogModule** — Ürün kataloğu
- CatalogProduct (platform geneli ürün kartı), CatalogModel, ProductType
- Category (hiyerarşik parent-child tree), CategoryAttribute
- Brand (onay süreci: PENDING→APPROVED), BrandViolation
- Listing (vendor'ın ürün listesi — fiyat, stok, varyant), ListingImage
- Review (orderId zorunlu), Favorite (CatalogProduct bazlı)
- Collection, CollectionProduct, Campaign, Coupon, GroupBuy
- ListingPriceHistory, ListingStats, ListingAnalytic, BadgeRule
- Slug VO: Türkçe karakter dönüşümü (ş→s, ö→o, ü→u, ç→c, ğ→g, ı→i)
- Endpoints: /products/*, /categories/*, /brands/*, /listings/*, /vendors/me/listings/*, /reviews/*, /favorites/*, /collections/*, /campaigns/*

**InventoryModule** — Stok yönetimi
- Warehouse, Stock (quantity + committed), InventoryLog (append-only)
- PurchaseOrder (Draft→Ordered→Received), PurchaseOrderItem
- Transfer (Pending→InTransit→Completed), TransferItem
- Stok 0 → listing status OUT_OF_STOCK
- Low stock alerts (availableQuantity ≤ lowStockThreshold)
- Endpoints: /vendors/me/warehouses/*, /vendors/me/stocks/*, /vendors/me/purchase-orders/*, /vendors/me/transfers/*

**CommerceModule** — Sipariş ve ödeme
- Cart, CartItem (aynı listing → quantity artır)
- Order, OrderItem (listing snapshot — fiyat/isim/görsel kopyalanır)
- OrderStatusHistory (append-only), OrderReturn, Dispute
- OrderNumber: BB-YYYYMMDD-XXXXX formatı
- Order State Machine: PENDING→PAID→CONFIRMED→PROCESSING→SHIPPED→DELIVERED→COMPLETED
- Checkout akışı (tek transaction): stok reserve + escrow create + hold funds + order save
- Cancel: stok release + escrow refund (sadece PENDING/PAID)
- Dispute: OPEN→UNDER_REVIEW→RESOLVED (REFUND_BUYER/FAVOR_SELLER/PARTIAL_REFUND)
- CheckoutService, PricingService (kupon, kargo), OrderNumberService
- Endpoints: /cart/*, /checkout, /orders/*, /vendors/me/orders/*, /returns/*, /disputes/*

### 4.3 EXCHANGE Modüller

**BarterModule** — Takas sistemi (platformun ana özelliği)
- SurplusItem (şirket fazla ürünü), WantedItem (ihtiyaç)
- SurplusCategory (hiyerarşik), DemandMatch (score bazlı otomatik eşleştirme)
- TradeOffer (teklif + counter-offer zinciri), TradeOfferItem
- SwapSession (PENDING_COLLATERAL→ACTIVE→COMPLETED)
- BarterPart (her kargo parçası: PENDING→SHIPPED→DELIVERED→CONFIRMED)
- TradeCompletion, TradeReview, TradeChain (çoklu taraf takas)
- BarterDisputeLog (arbitrator: INTERNAL/EXTERNAL)
- Collateral: trade value'nun %25'i (DownPaymentPolicy'den)
- MatchingService (kategori + lokasyon + fiyat score)
- TradeStateMachine: PENDING→ACCEPTED→LEGAL_PENDING→COMPLETED
- Endpoints: /surplus-items/*, /wanted-items/*, /trade-offers/*, /swap-sessions/*, /trade-reviews/*

**AuctionModule** — Açık artırma + çekiliş
- Auction (SCHEDULED→ACTIVE→ENDED→COMPLETED), AuctionBid
- AuctionParticipation (deposit hold), AuctionWinner (1.-2.-3.)
- Escalate winner (ödeme yapmazsa sıradakine geç)
- AuctionScheduler: cron job — otomatik start/end/escalate
- Lottery, LotteryTicket (crypto.randomInt ile adil çekiliş)
- Endpoints: /auctions/*, /auctions/:id/bid, /lotteries/*

### 4.4 SUPPORT Modüller

**CommunicationModule** — İletişim
- ChatRoom (orderId veya tradeOfferId bazlı), ChatMessage (TEXT/IMAGE/SYSTEM)
- WebSocket (Socket.IO, namespace: /chat) — real-time mesajlaşma
- Notification (ORDER_STATUS/BARTER_OFFER/AUCTION_BID/CAMPAIGN/SYSTEM)
- UserComplaint (PENDING→UNDER_REVIEW→RESOLVED/REJECTED)
- Otomatik bildirimler: order.created, order.shipped, barter.offer.created, auction.bid (Türkçe template)
- participantIds (User relation yok, string array)
- Endpoints: /chat/*, /notifications/*, /complaints/*

**ContentModule** — CMS
- HomeBanner, HomeQuadCard + Items
- HelpCategory (hiyerarşik) + HelpArticle (DRAFT→PUBLISHED, viewCount, upvote/downvote)
- Announcement (startDate/endDate visibility)
- Policy (versiyonlu), DynamicContent (key-value)
- SeoMetadata (path bazlı upsert)
- Endpoints: /banners, /quad-cards, /help/*, /announcements, /policies/*, /content/:key, /seo

**AdvertisingModule** — Reklam
- AdCampaign (PENDING→ACTIVE, bütçe yönetimi, hedefleme)
- AdSlot (HOMEPAGE_BANNER, SEARCH_SIDEBAR, etc.), AdSlotToAdCampaign
- AdCampaignProduct, AdCampaignMetric (günlük: impressions, clicks, CTR, spend)
- AdLocation, SideAd
- Ad Auction: bidAmount × qualityScore rank
- Budget Manager: remainingBudget -= cost (transaction içinde, PAUSED when exhausted)
- Pricing: CPC, CPM, CPA, FIXED
- Endpoints: /ads/*, /vendors/me/campaigns/*, /admin/campaigns/*

**LoyaltyModule** — XP ve sadakat
- UserLevel (currentXp, lifetimeXp, level, tier)
- XpTransaction (append-only, +/- amount), XpBatch (FIFO, 6 ay expiry)
- Mission + UserMission (IN_PROGRESS→COMPLETED→CLAIMED)
- MilestoneTracker (haftalık 3 sipariş, aylık 1000 TL)
- LoyaltyTierHistory (BRONZE→SILVER→GOLD→PLATINUM→DIAMOND)
- XpDistributionRule, XpSpendingLimitRule (daily/weekly/monthly limit)
- XP kazanma: ilk sipariş 500+%2, normal %2, barter %3, login 10, referral 200
- XP harcama: FIFO batch deduction, spending limit kontrolü
- Cron: batch expiry (gece yarısı), milestone reset (01:00)
- Endpoints: /xp/*, /missions/*, /milestones, /tiers/*

**AnalyticsModule** — Veri analizi
- AnalyticsEvent (PAGE_VIEW, PRODUCT_VIEW, SEARCH, PURCHASE, AD_CLICK...)
- ProductActivity (VIEW, CLICK, CART_ADD, PURCHASE)
- Dashboard queries: gelir, ürün analitik, kullanıcı aktivite, vendor performansı
- Rate limiting: IP başına 60/dk
- Endpoints: /analytics/track, /admin/analytics/*

---

## 5. Financial Service (Ayrı Servis)

PostgreSQL: barterborsa_financial (ayrı DB)
gRPC: :50051 (WalletService + EscrowService)

**Modüller:**
- **Wallet**: Account (11 tip: MAIN, ESCROW, COMMISSION, BARTER, AD_BUDGET...), AccountTransaction, AccountHold
- **Ledger**: GeneralLedger (çift kayıt — debit+credit, append-only), UserLedgerEntry
- **Commission**: CommissionRecord, tier-based oranlar (CORE:%10, PLUS:%8, PREMIUM:%6, ELITE:%4)
- **Escrow**: Escrow (PENDING→FUNDED→RELEASED/REFUNDED), hold/release/refund — saga pattern

**Güvenlik:**
- Idempotency key zorunlu (tüm write endpoint'ler)
- Double-entry ledger (debit === credit)
- Immutable audit log + ledger (update/delete metodu yok)
- Pessimistic locking (SELECT FOR UPDATE)
- Saga compensate (adım fail → geri al)
- Decimal.js (float yasak)
- Iyzico ödeme entegrasyonu

---

## 6. Delivery Service (Ayrı Servis — MongoDB)

MongoDB: barterborsa_delivery
gRPC: :50052 / REST: :3005 / WebSocket: /tracking

**Modüller:**
- **Shipment**: ShipmentDocument (Mongoose schema), type: ORDER/BARTER/RETURN
- **Tracking**: TrackingEvent, ShipmentLocation (GeoJSON, 2dsphere index, TTL 30 gün)

**Kargo firmaları:** Yurtiçi, Aras, MNG, PTT (carrier adapter pattern, mock implementasyon)
**Real-time:** WebSocket room-based tracking (Socket.IO, namespace: /tracking)
**State machine:** PENDING→PROCESSING→PICKED_UP→IN_TRANSIT→DELIVERED

---

## 7. Event Haritası (Servisler Arası)

```
SENKRON (gRPC):
  Backend ──gRPC──▶ Financial Service    (bakiye, ödeme, escrow)
  Backend ──gRPC──▶ Delivery Service     (kargo durumu)

ASENKRON (RabbitMQ):
  Identity  ──user.registered──────────▶ Financial (cüzdan oluştur)
  Commerce  ──order.created────────────▶ Financial (escrow + hold)
  Commerce  ──order.created────────────▶ Delivery  (kargo oluştur)
  Commerce  ──order.completed──────────▶ Financial (komisyon hesapla)
  Commerce  ──order.cancelled──────────▶ Financial (refund)
  Commerce  ──order.shipped────────────▶ Delivery  (carrier ata)
  Barter    ──barter.accepted──────────▶ Financial (collateral hold × 2)
  Barter    ──barter.accepted──────────▶ Delivery  (2 kargo oluştur)
  Barter    ──barter.completed─────────▶ Financial (komisyon)
  Delivery  ──shipment.delivered───────▶ Financial (escrow release)
  Financial ──payment.completed────────▶ Commerce  (order → PAID)
  Financial ──payment.failed───────────▶ Commerce  (order iptal)
  
  Tüm olaylar ──▶ Communication (otomatik bildirim + system mesajı)
```

---

## 8. Backend API Response Formatı

Tüm endpoint'ler standart envelope döner:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 },
  "timestamp": 1234567890
}
```

Hata:
```json
{
  "success": false,
  "message": "Hata açıklaması",
  "statusCode": 400
}
```

Auth endpoint'ler:
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": "...", "email": "...", "role": "USER", ... }
  }
}
```

---

## 9. Prisma Şema Yapısı (Multi-file)

```
apps/backend/prisma/schema/
├── base.prisma          # datasource + generator
├── identity.prisma      # User, Profile, Address, Session, Token
├── vendor.prisma        # Company, Vendor, Settings, B2B, BankAccount, Ecosystem
├── catalog.prisma       # CatalogProduct, Category, Brand, Listing, Review, Favorite
├── inventory.prisma     # Warehouse, Stock, PurchaseOrder, Transfer
├── commerce.prisma      # Order, Cart, Campaign, Coupon, Dispute
├── barter.prisma        # SurplusItem, TradeOffer, SwapSession, BarterPart
├── auction.prisma       # Auction, Bid, Lottery
├── communication.prisma # ChatRoom, ChatMessage, Notification, Complaint
├── content.prisma       # Banner, Help, Policy, SEO
├── advertising.prisma   # AdCampaign, AdSlot, Metrics
├── loyalty.prisma       # UserLevel, XP, Mission, Milestone
├── analytics.prisma     # AnalyticsEvent, ProductActivity
└── system.prisma        # Settings, AuditLog, City, District
```

---

## 10. Docker Altyapı

```yaml
# infra/docker-compose.yml
services:
  postgresql:  # :5432, barterborsa_core + barterborsa_financial
  mongodb:     # :27017, barterborsa_delivery
  redis:       # :6379
  rabbitmq:    # :5672 + :15672 (management)
```

---

## 11. Kalite Metrikleri (Backend)

| Metrik | Değer |
|--------|-------|
| `any` kullanımı | 0 |
| `@ts-ignore` | 0 |
| Unit test suite | 73+ |
| Unit test senaryo | 140+ |
| E2E test suite | 4+ |
| Swagger controller | 36 |
| Health endpoint | /health, /ready |
| Metrics endpoint | /metrics (Prometheus) |
| CI/CD | GitHub Actions (build → test → deploy) |
| Load test | k6 (5 senaryo: smoke, auth, checkout, barter, stress) |

---

## 12. Frontend Durumu

**Mevcut frontend:** 157 sayfa, 151 component, 44 composable, 13 store — çalışıyor ama dağınık.
**Karar:** Frontend baştan yazılacak (yeni backend API'larına uyumlu, temiz kod).
**Yapılan düzeltmeler:** useWallet SSR leak → Pinia, useApi any temizliği, auth store düzeltme, shared-types → lokal tipler.
**Kalan sorunlar:** 88 any, 105 SSR unsafe, 75 hardcoded URL, 45 console.log — bu yüzden baştan yazılacak.

**Frontend yeniden yazma planı (bölüm bölüm):**
1. Nuxt 3 proje iskeleti + layout + auth akışı
2. Public sayfalar (anasayfa, ürün listesi, ürün detay, kategori)
3. Auth sayfaları (login, register, profil, adresler)
4. Vendor paneli (dashboard, ürün yönetimi, sipariş yönetimi)
5. Sepet + Checkout akışı
6. Barter sayfaları (surplus, wanted, teklif, swap session)
7. Auction + Lottery sayfaları
8. Chat + Bildirimler
9. Admin paneli
10. Content sayfaları (help, policy, announcement)

---

## 13. Geliştirme Yaklaşımı

- **Claude** → mimari kararlar, prompt hazırlığı, code review
- **Gemini 2.5 Flash** → implementation (kod üretimi)
- Her faz için Claude detaylı prompt hazırlıyor, Gemini implemente ediyor
- Gemini'ye system prompt'ta: `any` YASAK, IEventBus KULLANMA (kendi EventPublisher), doğru tip kullan
- Her faz sonunda: `pnpm build` + `any` kontrolü + `pnpm test`

---

## 14. Murat Hakkında Bağlam

- macOS + iOS kullanıcısı
- Hatay bağlantılı, hukuk alanında çalışıyor
- Bu proje dışında Anthropic API ile Türk hukuku araştırma aracı geliştiriyor
- Senior developer olarak mimari kararları kendisi veriyor, implementation Gemini'ye yaptırıyor
