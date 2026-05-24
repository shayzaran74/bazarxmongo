---
Son Güncelleme: 2026-05-24
📐 BAZARX — UÇTAN UCA MİMARİ HARİTA (Architecture Blueprint)

═══════════════════════════════════════════════════════════════
📂 FAZ 1: MONOREPO & DİZİN BAĞIMLILIK AĞACI
═══════════════════════════════════════════════════════════════

```
bazarx/                              Turbo Monorepo (pnpm workspaces)
├── apps/
│   ├── backend/                     NestJS 10+ / Express — Ana API Sunucusu
│   │   └── src/modules/            23 modül (468 REST endpoint)
│   ├── financial-service/           NestJS — gRPC Finansal Mikro-servis
│   │   └── src/modules/            4 modül (wallet, ledger, escrow, commission)
│   ├── delivery-service/            NestJS — gRPC Kargo Mikro-servis
│   │   └── src/modules/            2 modül (shipment, tracking)
│   ├── frontend/                    Nuxt 3 / Vue 3 — Web Uygulaması
│   │   ├── pages/                  195 sayfa
│   │   ├── components/             UI bileşenleri
│   │   ├── composables/            State yönetimi
│   │   └── stores/                 Pinia store'ları
│   └── mobile/                      React Native (planlanan)
│
├── packages/
│   ├── domain-identity/             Kimlik domaini (UserProfile, auth)
│   └── shared/
│       ├── shared-core/             AggregateRoot, Entity, ValueObject, DomainEvent, DomainException
│       ├── shared-messaging/        RabbitMQ service (publish/subscribe)
│       ├── shared-nest/             NestJS decorator'ları (@CurrentUser, guards)
│       ├── shared-observability/    StructuredLogger
│       ├── shared-persistence/      MongoDB şemaları (130+ schema) + model proxy
│       ├── shared-queue/            Kuyruk altyapısı
│       ├── shared-security/         JWT guard, RBAC (Roles, RolesGuard)
│       └── shared-types/            DTO tipleri
│
└── scripts/
    └── migration/                   Veritabanı migration scriptleri
```

Paket Bağımlılık Grafiği:
```
shared-core ──────────────────────────────────┐
shared-persistence ──► shared-core            │
shared-security ─────► shared-core            ├──► backend
shared-messaging ────► shared-core            │    financial-service
shared-nest ─────────► shared-core            │    delivery-service
shared-observability                          │
shared-types                                  │
shared-queue                                  │
domain-identity ─────► shared-persistence ────┘
```

═══════════════════════════════════════════════════════════════
🗄️ FAZ 2: VERİ KATMANI (Persistence)
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  MongoDB 7  (Ana Veritabanı — Backend + Delivery)           │
│  130+ Mongoose şeması (shared-persistence)                  │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 16  (Finansal Servis — Wallet/Ledger)           │
│  Prisma ORM → Wallet, AccountHold, GeneralLedger, Escrow   │
├─────────────────────────────────────────────────────────────┤
│  Redis 7  (Cache + Session)                                 │
└─────────────────────────────────────────────────────────────┘

MongoDB Şema Grupları (130+ koleksiyon):

  Ticari Takas (Barter):
    surplusItem, tradeOffer, tradeOfferItem, tradeReview,
    swapSession, barterPart, barterDisputeLog, tradeChain,
    tradeCompletion, tradeMatch, demandMatch, wantedItem,
    surplusCategory, categoryAttribute, trustScore, vendorB2BData

  Ekosistem (Dealer Network):
    brandEcosystem, ecosystemAuditLog, ecosystemMembership,
    ecosystemOrder, blindPool, blindPoolEntry, brandViolation

  Ticaret (Commerce):
    order, orderItem, orderStatusHistory, orderReturn, returnRequest,
    cart, cartItem, invoice, invoiceItem, purchaseOrder, purchaseOrderItem

  Katalog:
    catalogProduct, catalogModel, listing, listingImage, listingAnalytic,
    listingPriceHistory, listingStats, productMedia, productType,
    productActivity, category, brand, collection, collectionProduct

  Kullanıcı & Vendor:
    user, userProfile, userAddress, userLevel, userMission,
    vendor, vendorProfile, vendorSettings, vendorBankAccount,
    vendorStats, vendorMetrics, vendorBanner, vendorCategory,
    vendorFollower, vendorViolation, company, companyUser

  Finansal (MongoDB mirror):
    transfer, transferItem, stockReservation, stock,
    escrowCoupon, giftVoucher, early-payment-request

  Pazarlama & Sadakat:
    campaign, coupon, referral, goReferral, badgeRule, mission,
    userMission, milestoneTracker, platinumMissionLog,
    loyaltyTierHistory, membershipPlan, membershipTier,
    xpBatch, xpTransaction, xpDistributionRule, xpSpendingLimitRule

  Reklam:
    adCampaign, adCampaignMetric, adCampaignProduct,
    adLocation, adSlot, adSlotToAdCampaign, sideAd

  İletişim:
    chatRoom, chatMessage, notification, userComplaint,
    userDeviceToken, announcement

  Açık Artırma & Çekiliş & Grup Alım:
    auction, auctionBid, auctionParticipation, auctionWinner,
    lottery, lotteryTicket, groupBuy

  Menü & Abonelik:
    surpriseMenu, menuRight, menuPurchase, menuRedemption,
    menuReservation, menuUsage, subscription, userSubscription

  GO (Yemek Servisi):
    goReferral, goReservation, garageSale

  Diğer:
    auditLog, analyticsEvent, seoMetadata, systemSetting,
    homeBanner, homeQuadCard, dynamicContent, helpArticle,
    helpCategory, policy, review, favorite, warehouse,
    importJob, outboxMessage, refreshToken, verificationToken,
    sSOToken, session, loginHistory

PostgreSQL Tabloları (Financial Service — Prisma):

  Wallet          userId, balanceTL (Money VO), createdAt
  AccountHold     walletId, amount, reason, status, referenceId
  GeneralLedger   debitAccountId, creditAccountId, amount, entryType
  Escrow          orderId, buyerId, sellerId, amount, status
  CommissionRecord vendorId, orderId, amount, rate, type

═══════════════════════════════════════════════════════════════
🔄 FAZ 3: İLETİŞİM VE ENTEGRASYON HARİTASI
═══════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────┐
│                    L1: SİSTEM BAĞLAM DİYAGRAMI               │
│                                                              │
│  [Kullanıcı/Bayi]                                            │
│       │ HTTPS                                                │
│       ▼                                                      │
│  ┌─────────────┐     gRPC      ┌──────────────────┐         │
│  │  Frontend    │◄────────────►│  Backend API      │         │
│  │  (Nuxt 3)   │  REST API    │  (NestJS/Express) │         │
│  │  :3002      │              │  :3001             │         │
│  └─────────────┘              └────────┬───────────┘         │
│                                        │                     │
│                          ┌─────────────┼─────────────┐       │
│                          │ gRPC        │ gRPC        │       │
│                          ▼             ▼             │       │
│               ┌────────────┐  ┌──────────────┐      │       │
│               │ Financial  │  │ Delivery     │      │       │
│               │ Service    │  │ Service      │      │       │
│               │ :50051     │  │ :50052       │      │       │
│               └──────┬─────┘  └──────┬───────┘      │       │
│                      │               │               │       │
│                  PostgreSQL      MongoDB          RabbitMQ   │
│                  (Wallet/GL)    (Shipment)       (Events)    │
│                                                              │
│  [MongoDB 7]  ◄──── Backend ────► [Redis 7]                  │
│  (Ana DB)                          (Cache)                   │
└──────────────────────────────────────────────────────────────┘

─── gRPC Entegrasyon Noktaları ────────────────────────────────

Backend ↔ Financial Service (financial.proto — 16 metod):
  GetWallet, GetBalance, HoldFunds, ReleaseFunds, RefundFunds,
  GetTransactions, TopUpWallet, RequestWithdrawal, GetWithdrawals,
  GetWalletRequests, ProcessWalletRequest, ProcessWithdrawal,
  CreateGiftCard, ListGiftCards, GetGiftCard, TransferBetweenAccounts

Backend ↔ Delivery Service (delivery.proto — 4 metod):
  GetShipment, GetShipmentByOrder, GetShipmentByTracking,
  UpdateShipmentStatus

─── RabbitMQ Event Akışı (Outbox Pattern) ─────────────────────

Exchange          Routing Key        Producer            Consumer
──────────────── ─────────────────── ───────────────── ─────────────────────
barter.events     offer.accepted     AcceptTradeOffer   TradeOfferAcceptedNotification
commerce.events   order.created      CheckoutService    OrderCreatedNotification
identity.events   user.registered    RegisterUser       UserRegisteredNotification

─── REST API Endpoint Dağılımı (468 toplam) ───────────────────

Modül                  Endpoint Sayısı
─────────────────────  ───────────────
vendor                      85
barter                      67
content                     55
catalog                     48
commerce                    40
loyalty                     19
marketing                   19
advertising                 17
analytics                   17
menu                        20
communication               14
financial-gateway           14
inventory                   12
delivery                     9
identity                     9
subscription                 7
barterborsa                  4
tax                          4
garage-sale                  3
media                        2
health                       —
audit                        —

═══════════════════════════════════════════════════════════════
📊 FAZ 4: GÖRSEL RAPORLAMA VE METRİKLER
═══════════════════════════════════════════════════════════════

─── Sistem Boyut Metrikleri ───────────────────────────────────

Kategori                           Sayı
─────────────────────────────── ──────
Backend modüller                   23
Frontend sayfalar                 195
MongoDB şemaları                  130+
REST API endpoint'leri            468
gRPC metod'ları                    20
RabbitMQ exchange'ler               3
Outbox event tipleri                4
Proto dosyaları                     2
Migration scriptleri                4+

─── L2: BACKEND MODÜL BAĞIMLILIK GRAFİĞİ ─────────────────────

```
                    ┌──────────────┐
                    │   identity   │ (auth, user, profile)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
        ┌──────────┐ ┌──────────┐    ┌──────────────┐
        │  vendor  │ │ catalog  │    │  commerce    │
        │ (85 ep)  │ │ (48 ep)  │    │  (40 ep)     │
        └────┬─────┘ └────┬─────┘    └──────┬───────┘
             │            │                 │
    ┌────────┼────┐       │          ┌──────┼───────┐
    ▼        ▼    ▼       ▼          ▼      ▼       ▼
┌────────┐┌─────┐┌──────┐┌────┐ ┌────────┐┌─────┐┌─────┐
│ barter ││eco- ││garage││inv-│ │delivery││tax  ││pay- │
│ (67ep) ││sys- ││sale  ││ent-│ │(9 ep)  ││(4ep)││ment │
│        ││tem  ││(3ep) ││ory │ │        ││     ││     │
└────┬───┘└─────┘└──────┘└────┘ └────────┘└─────┘└─────┘
     │
     ▼
┌──────────────────┐     ┌──────────────┐
│ financial-gateway│────►│ Financial    │ (gRPC)
│ (14 ep)          │     │ Service      │
└──────────────────┘     │ (PostgreSQL) │
                         └──────────────┘
```

Yatay Bağımlılıklar:
  barter ──► vendor (IVendorRepository, Company model)
  barter ──► financial-gateway (holdFunds, releaseFunds, checkBalance)
  barter ──► audit (AuditLogService)
  barter ──► communication (chat, notification)
  commerce ──► vendor (ecosystem komisyon, WatchoverService)
  commerce ──► financial-gateway (checkout escrow)
  vendor ──► barter (ITrustScoreRepository, ISwapSessionRepository)

─── L3: TİCARİ TAKAS (BARTER) İŞ AKIŞI ──────────────────────

```
[Vendor A]                    [Sistem]                     [Vendor B]
    │                            │                              │
    │ 1. İlan oluştur            │                              │
    │ (PENDING_APPROVAL) ───────►│                              │
    │                            │ 2. Admin onay → ACTIVE       │
    │                            │                              │
    │                            │◄──── 3. Havuzu gör ──────────│
    │                            │◄──── 4. Teklif oluştur ──────│
    │                            │◄──── 5. Teklif onayla ───────│
    │◄── 6. Bildirim ────────────│                              │
    │ 7. Kabul/Red/Karşı ──────►│                              │
    │                            │ 8. SwapSession + BarterPart  │
    │                            │    holdFunds (her iki taraf)  │
    │                            │    blockedQuantity güncelle   │
    │ 9. Sohbet ◄───────────────►│◄──────────────────────── 9.  │
    │ 10. Kargo bildir ─────────►│                              │
    │                            │◄──── 11. Kargo bildir ───────│
    │ 12. Teslim onay ──────────►│                              │
    │                            │◄──── 13. Teslim onay ────────│
    │                            │ 14. 3 gün inceleme süresi    │
    │ 15. ONAYLA & TAMAMLA ─────►│                              │
    │                            │◄──── 16. ONAYLA & TAMAMLA ───│
    │                            │ 17. PENDING_RELEASE          │
    │                            │                              │
    │          [Admin]           │                              │
    │           │ 18. Serbest bırak                             │
    │           │──────────────►│                               │
    │                            │ 19. RELEASED (komisyon kesilerek)
```

─── TEKNİK BORÇ TESPİTLERİ ───────────────────────────────────

Seviye    Alan                         Detay
────────  ──────────────────────────── ──────────────────────────────────────────
🟡 Orta   Auction modülü               Controller dosyası yok — modül boş
🟡 Orta   Lottery bilet satışı          Stub — cüzdandan ticketPrice düşülmüyor
🟡 Orta   Auction teminat blokajı       AuctionController.participate teminat almıyor
🟡 Orta   Health modülü                 Endpoint yok — sadece modül kabuğu
🟡 Orta   RabbitMQ event çeşitliliği    Sadece 3 exchange, 3 consumer — daha fazla
                                        event-driven akış fırsatı var
🟢 Düşük  Duplicate şemalar             vendor-b2b-data.schema.ts / vendorB2BData.schema.ts
                                        order.schema.ts / order-item.schema.ts çiftleri
🟢 Düşük  Proto dosya kopyaları         financial.proto hem backend hem financial-service'te
                                        — tek kaynak (single source of truth) olmalı
🟢 Düşük  Mobile app                    Boş — henüz başlanmamış

═══════════════════════════════════════════════════════════════
📋 ÖZET METRİKLER
═══════════════════════════════════════════════════════════════

                    Backend    Financial   Delivery   Frontend
                    ─────────  ──────────  ─────────  ────────
Modüller            23         4           2          —
Endpoint'ler        468        —           —          —
gRPC metod          —          16          4          —
Sayfalar            —          —           —          195
Şemalar             130+       4 entity    —          —
Veritabanı          MongoDB    PostgreSQL  MongoDB    —
Port                3001       50051       50052      3002

Teknoloji Yığını:
  Runtime:    Node.js 20+ / TypeScript 5+
  Backend:    NestJS 10+ (Express adapter) / CQRS / DDD
  Frontend:   Nuxt 3 / Vue 3 Composition API / TailwindCSS / Pinia
  DB:         MongoDB 7 (Mongoose) + PostgreSQL 16 (Prisma)
  Cache:      Redis 7
  Messaging:  RabbitMQ 3.13 (Outbox pattern)
  RPC:        gRPC (protobuf)
  Auth:       JWT + RBAC (shared-security)
  Build:      Turbo (monorepo orchestrator) + pnpm
