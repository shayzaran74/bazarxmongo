# Gemini Prompt — FAZ 5: Barter (Exchange) + Auction Modülleri

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun backend'ini yazıyorsun.

MİMARİ KARARLAR (ASLA sorgulamayacaksın):

- Framework: NestJS 10+ / Fastify adapter
- Monorepo: Turborepo + pnpm workspaces
- TypeScript strict mode
- PostgreSQL 16 — Prisma ORM
- DDD: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern
- CQRS: NestJS CQRS modülü ile Command/Query ayrımı
- Package prefix: @barterborsa/*
- Inter-service: gRPC (senkron) + RabbitMQ (asenkron)

DAHA ÖNCE TAMAMLANAN MODÜLLER:
- Faz 1: Shared paketler (core, persistence, messaging, observability, security, nest)
- Faz 2: Identity & Auth (User, Auth, Session, Google OAuth)
- Faz 3: Financial Service (ayrı servis — Wallet, Ledger, Commission, Escrow — gRPC)
- Faz 4A: Vendor (Company, Vendor, Profile, Settings, B2B, BankAccount, Ecosystem)
- Faz 4B: Catalog + Inventory (CatalogProduct, Category, Brand, Listing, Stock, Warehouse, PurchaseOrder)
- Faz 4C: Commerce + FinancialGateway (Order, Cart, Checkout, Return, Dispute + gRPC facade)

ÖNEMLİ — DI PATTERN:
- IEventBus interface'ini KULLANMA. Her modül kendi EventPublisher sınıfını kullansın (IdentityEventPublisher pattern'ı gibi).
- EventPublisher sınıfları PublisherService'i inject eder ve spesifik event metotları sunar.
- @Inject('TOKEN') yerine somut sınıfları inject et (sadece repository'ler için token kullan).

MEVCUT SERVİSLER:
- FinancialGatewayService (backend içinde): gRPC ile financial-service'i çağırır
  - getBalance, createWallet, topupWallet, transferFunds
  - createEscrow, holdFunds, releaseFunds, refundFunds

SHARED PAKETLER:

@barterborsa/shared-core:
  - Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent
  - IRepository<T>, Command, Query
  - PaginationInput, PaginatedResult<T>
  - DomainException, NotFoundException, ConflictException
  - Result<T, E>, Ok(), Err()

@barterborsa/shared-persistence:
  - PrismaModule, PrismaService, BasePrismaRepository<T>, PrismaUnitOfWork

@barterborsa/shared-messaging:
  - RabbitMQModule, PublisherService, IntegrationEvent

@barterborsa/shared-security:
  - AuthGuard, RolesGuard

@barterborsa/shared-nest:
  - @CurrentUser(), @Roles(), @Public(), @Idempotent()

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. TypeScript strict mode
4. Import'larda @barterborsa/* workspace alias kullan
5. Kod yorumlarını Türkçe yaz
6. IEventBus KULLANMA — her modülün kendi EventPublisher sınıfı olacak
7. User tablosuna relation EKLEME — sadece userId string
8. Financial işlemler → FinancialGatewayService üzerinden (doğrudan DB erişimi yok)
9. Decimal kullan, float YASAK
10. Her entity'de tam path yorumu olacak (// apps/backend/src/modules/...)
```

### GÖREV

```
FAZ 5: Barter (Exchange) ve Auction modüllerini yaz.

Barter modülü platformun en farklılaştırıcı özelliğidir — şirketler arası takas sistemi.
Auction modülü açık artırma sistemidir.

=== BARTER MODÜLÜ — İŞ AKIŞI ===

1. SurplusItem: Şirket elindeki fazla ürünü listeliyor (SurplusItem)
2. WantedItem: Şirket ihtiyaç duyduğu ürünü belirtiyor (WantedItem)
3. DemandMatch: Sistem otomatik eşleştirme yapıyor (score bazlı)
4. TradeOffer: Bir taraf diğerine takas teklifi gönderiyor
   - offeredItems: teklif edilen ürünler + miktarlar
   - requestedItems: talep edilen ürünler + miktarlar
   - cashAmount + cashDirection: nakit fark varsa (TO_INITIATOR veya TO_RECEIVER)
   - Counter-offer desteği (parentOfferId ile zincir)
   - Trade chain: çoklu taraf takas (A→B→C→A)
5. TradeOffer kabul edilince:
   a. SwapSession oluşturulur (status: PENDING_COLLATERAL)
   b. Her iki taraftan collateral (teminat) alınır → FinancialGateway.holdFunds
   c. SwapSession status → ACTIVE
   d. BarterPart'lar oluşturulur (her bir kargo parçası)
6. Kargo süreci:
   - Her BarterPart ayrı kargo takibi (trackingCode, carrier)
   - Gönderildi → Teslim edildi → Onaylandı akışı
   - Dispute window (anlaşmazlık süresi)
7. Tüm BarterPart'lar tamamlanınca:
   - Collateral serbest bırakılır (FinancialGateway.releaseFunds)
   - Cash fark varsa transfer edilir (FinancialGateway.transferFunds)
   - TradeCompletion kaydı oluşturulur
   - Barter komisyonu hesaplanır → financial-service'e event
8. Dispute: Herhangi bir aşamada anlaşmazlık açılabilir (BarterDisputeLog)

=== AUCTION MODÜLÜ — İŞ AKIŞI ===

1. Vendor bir Listing üzerinde açık artırma başlatır (Auction)
   - startingPrice, minBidIncrement, startTime, endTime
   - participationDeposit: katılım teminatı (opsiyonel)
2. Kullanıcı katılmak için deposit öder → AuctionParticipation + AccountHold
3. Kullanıcı teklif verir (AuctionBid) — her teklif öncekinden en az minBidIncrement kadar fazla
4. Süre dolunca (endTime):
   - 1., 2., 3. kazanan belirlenir (AuctionWinner)
   - Kazanana ödeme deadline'ı verilir (paymentDeadline)
   - Kazanan ödemezse sıradakine geçilir (currentWinnerStep)
5. Ödeme yapılınca:
   - Normal sipariş akışı başlar (Order oluştur)
   - Kaybedenlerin deposit'i serbest bırakılır
6. Lottery: Çekiliş sistemi (listing'e bağlı, ayrı bir mekanizma)

Modül yapıları:

apps/backend/src/modules/barter/
├── application/
│   ├── commands/
│   │   ├── create-surplus-item.command.ts
│   │   ├── create-surplus-item.handler.ts
│   │   ├── update-surplus-item.command.ts
│   │   ├── update-surplus-item.handler.ts
│   │   ├── deactivate-surplus-item.command.ts
│   │   ├── deactivate-surplus-item.handler.ts
│   │   ├── create-wanted-item.command.ts
│   │   ├── create-wanted-item.handler.ts
│   │   ├── update-wanted-item.command.ts
│   │   ├── update-wanted-item.handler.ts
│   │   ├── create-trade-offer.command.ts
│   │   ├── create-trade-offer.handler.ts
│   │   ├── accept-trade-offer.command.ts
│   │   ├── accept-trade-offer.handler.ts
│   │   ├── reject-trade-offer.command.ts
│   │   ├── reject-trade-offer.handler.ts
│   │   ├── counter-trade-offer.command.ts
│   │   ├── counter-trade-offer.handler.ts
│   │   ├── cancel-trade-offer.command.ts
│   │   ├── cancel-trade-offer.handler.ts
│   │   ├── accept-legal-terms.command.ts
│   │   ├── accept-legal-terms.handler.ts
│   │   ├── lock-collateral.command.ts
│   │   ├── lock-collateral.handler.ts
│   │   ├── ship-barter-part.command.ts
│   │   ├── ship-barter-part.handler.ts
│   │   ├── confirm-delivery.command.ts
│   │   ├── confirm-delivery.handler.ts
│   │   ├── complete-swap.command.ts
│   │   ├── complete-swap.handler.ts
│   │   ├── open-barter-dispute.command.ts
│   │   ├── open-barter-dispute.handler.ts
│   │   ├── resolve-barter-dispute.command.ts
│   │   ├── resolve-barter-dispute.handler.ts
│   │   ├── create-trade-review.command.ts
│   │   └── create-trade-review.handler.ts
│   ├── queries/
│   │   ├── get-surplus-item.query.ts
│   │   ├── get-surplus-item.handler.ts
│   │   ├── list-surplus-items.query.ts
│   │   ├── list-surplus-items.handler.ts
│   │   ├── get-wanted-item.query.ts
│   │   ├── get-wanted-item.handler.ts
│   │   ├── list-wanted-items.query.ts
│   │   ├── list-wanted-items.handler.ts
│   │   ├── get-demand-matches.query.ts
│   │   ├── get-demand-matches.handler.ts
│   │   ├── get-trade-offer.query.ts
│   │   ├── get-trade-offer.handler.ts
│   │   ├── list-trade-offers.query.ts
│   │   ├── list-trade-offers.handler.ts
│   │   ├── get-swap-session.query.ts
│   │   ├── get-swap-session.handler.ts
│   │   ├── list-swap-sessions.query.ts
│   │   ├── list-swap-sessions.handler.ts
│   │   ├── get-trade-reviews.query.ts
│   │   └── get-trade-reviews.handler.ts
│   ├── event-handlers/
│   │   ├── trade-offer-accepted.handler.ts
│   │   └── swap-completed.handler.ts
│   ├── services/
│   │   ├── matching.service.ts
│   │   └── collateral-calculator.service.ts
│   └── dtos/
│       ├── create-surplus-item.dto.ts
│       ├── update-surplus-item.dto.ts
│       ├── create-wanted-item.dto.ts
│       ├── create-trade-offer.dto.ts
│       ├── counter-trade-offer.dto.ts
│       ├── ship-barter-part.dto.ts
│       ├── open-barter-dispute.dto.ts
│       ├── resolve-barter-dispute.dto.ts
│       ├── create-trade-review.dto.ts
│       ├── surplus-item-response.dto.ts
│       ├── wanted-item-response.dto.ts
│       ├── demand-match-response.dto.ts
│       ├── trade-offer-response.dto.ts
│       ├── swap-session-response.dto.ts
│       ├── barter-part-response.dto.ts
│       └── trade-review-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── surplus-item.entity.ts
│   │   ├── wanted-item.entity.ts
│   │   ├── demand-match.entity.ts
│   │   ├── trade-offer.entity.ts
│   │   ├── trade-offer-item.entity.ts
│   │   ├── swap-session.entity.ts
│   │   ├── barter-part.entity.ts
│   │   ├── trade-completion.entity.ts
│   │   ├── trade-review.entity.ts
│   │   ├── trade-chain.entity.ts
│   │   ├── barter-dispute-log.entity.ts
│   │   └── surplus-category.entity.ts
│   ├── value-objects/
│   │   ├── trade-value.vo.ts
│   │   ├── collateral-amount.vo.ts
│   │   └── match-score.vo.ts
│   ├── events/
│   │   ├── surplus-item-created.event.ts
│   │   ├── trade-offer-created.event.ts
│   │   ├── trade-offer-accepted.event.ts
│   │   ├── trade-offer-rejected.event.ts
│   │   ├── collateral-locked.event.ts
│   │   ├── barter-part-shipped.event.ts
│   │   ├── barter-part-delivered.event.ts
│   │   ├── swap-completed.event.ts
│   │   └── barter-dispute-opened.event.ts
│   ├── repositories/
│   │   ├── surplus-item.repository.interface.ts
│   │   ├── wanted-item.repository.interface.ts
│   │   ├── demand-match.repository.interface.ts
│   │   ├── trade-offer.repository.interface.ts
│   │   ├── swap-session.repository.interface.ts
│   │   ├── barter-part.repository.interface.ts
│   │   ├── trade-completion.repository.interface.ts
│   │   ├── trade-review.repository.interface.ts
│   │   ├── trade-chain.repository.interface.ts
│   │   ├── barter-dispute.repository.interface.ts
│   │   └── surplus-category.repository.interface.ts
│   ├── enums/
│   │   ├── surplus-status.enum.ts
│   │   ├── wanted-item-status.enum.ts
│   │   ├── wanted-item-type.enum.ts
│   │   ├── trade-offer-status.enum.ts
│   │   ├── swap-session-status.enum.ts
│   │   ├── barter-part-status.enum.ts
│   │   ├── demand-match-status.enum.ts
│   │   ├── demand-match-type.enum.ts
│   │   ├── trade-chain-status.enum.ts
│   │   ├── arbitrator-type.enum.ts
│   │   ├── pilot-city.enum.ts
│   │   └── listing-type.enum.ts
│   └── services/
│       └── trade-state-machine.service.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-surplus-item.repository.ts
│   │   ├── prisma-wanted-item.repository.ts
│   │   ├── prisma-demand-match.repository.ts
│   │   ├── prisma-trade-offer.repository.ts
│   │   ├── prisma-swap-session.repository.ts
│   │   ├── prisma-barter-part.repository.ts
│   │   ├── prisma-trade-completion.repository.ts
│   │   ├── prisma-trade-review.repository.ts
│   │   ├── prisma-trade-chain.repository.ts
│   │   ├── prisma-barter-dispute.repository.ts
│   │   ├── prisma-surplus-category.repository.ts
│   │   └── mappers/
│   │       ├── surplus-item.mapper.ts
│   │       ├── wanted-item.mapper.ts
│   │       ├── demand-match.mapper.ts
│   │       ├── trade-offer.mapper.ts
│   │       ├── trade-offer-item.mapper.ts
│   │       ├── swap-session.mapper.ts
│   │       ├── barter-part.mapper.ts
│   │       ├── trade-completion.mapper.ts
│   │       ├── trade-review.mapper.ts
│   │       ├── trade-chain.mapper.ts
│   │       ├── barter-dispute.mapper.ts
│   │       └── surplus-category.mapper.ts
│   └── event-publishers/
│       └── barter-event.publisher.ts
├── presentation/
│   ├── surplus-item.controller.ts
│   ├── wanted-item.controller.ts
│   ├── demand-match.controller.ts
│   ├── trade-offer.controller.ts
│   ├── swap-session.controller.ts
│   ├── trade-review.controller.ts
│   ├── surplus-category.controller.ts
│   └── barter-admin.controller.ts
└── barter.module.ts

apps/backend/src/modules/auction/
├── application/
│   ├── commands/
│   │   ├── create-auction.command.ts
│   │   ├── create-auction.handler.ts
│   │   ├── start-auction.command.ts
│   │   ├── start-auction.handler.ts
│   │   ├── place-bid.command.ts
│   │   ├── place-bid.handler.ts
│   │   ├── join-auction.command.ts
│   │   ├── join-auction.handler.ts
│   │   ├── end-auction.command.ts
│   │   ├── end-auction.handler.ts
│   │   ├── process-auction-payment.command.ts
│   │   ├── process-auction-payment.handler.ts
│   │   ├── escalate-winner.command.ts
│   │   ├── escalate-winner.handler.ts
│   │   ├── create-lottery.command.ts
│   │   ├── create-lottery.handler.ts
│   │   ├── buy-lottery-ticket.command.ts
│   │   ├── buy-lottery-ticket.handler.ts
│   │   ├── draw-lottery.command.ts
│   │   └── draw-lottery.handler.ts
│   ├── queries/
│   │   ├── get-auction.query.ts
│   │   ├── get-auction.handler.ts
│   │   ├── list-auctions.query.ts
│   │   ├── list-auctions.handler.ts
│   │   ├── get-auction-bids.query.ts
│   │   ├── get-auction-bids.handler.ts
│   │   ├── get-lottery.query.ts
│   │   ├── get-lottery.handler.ts
│   │   ├── list-lotteries.query.ts
│   │   └── list-lotteries.handler.ts
│   ├── event-handlers/
│   │   ├── auction-ended.handler.ts
│   │   └── auction-payment-completed.handler.ts
│   ├── services/
│   │   └── auction-scheduler.service.ts
│   └── dtos/
│       ├── create-auction.dto.ts
│       ├── place-bid.dto.ts
│       ├── create-lottery.dto.ts
│       ├── buy-lottery-ticket.dto.ts
│       ├── auction-response.dto.ts
│       ├── auction-detail-response.dto.ts
│       ├── bid-response.dto.ts
│       ├── lottery-response.dto.ts
│       └── lottery-ticket-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── auction.entity.ts
│   │   ├── auction-bid.entity.ts
│   │   ├── auction-participation.entity.ts
│   │   ├── auction-winner.entity.ts
│   │   ├── lottery.entity.ts
│   │   └── lottery-ticket.entity.ts
│   ├── value-objects/
│   │   ├── bid-amount.vo.ts
│   │   └── auction-time-range.vo.ts
│   ├── events/
│   │   ├── auction-created.event.ts
│   │   ├── auction-started.event.ts
│   │   ├── bid-placed.event.ts
│   │   ├── auction-ended.event.ts
│   │   ├── auction-winner-determined.event.ts
│   │   └── lottery-drawn.event.ts
│   ├── repositories/
│   │   ├── auction.repository.interface.ts
│   │   ├── auction-bid.repository.interface.ts
│   │   ├── auction-participation.repository.interface.ts
│   │   ├── auction-winner.repository.interface.ts
│   │   ├── lottery.repository.interface.ts
│   │   └── lottery-ticket.repository.interface.ts
│   ├── enums/
│   │   ├── auction-status.enum.ts
│   │   ├── participation-status.enum.ts
│   │   └── lottery-status.enum.ts
│   └── services/
│       └── auction-state-machine.service.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-auction.repository.ts
│   │   ├── prisma-auction-bid.repository.ts
│   │   ├── prisma-auction-participation.repository.ts
│   │   ├── prisma-auction-winner.repository.ts
│   │   ├── prisma-lottery.repository.ts
│   │   ├── prisma-lottery-ticket.repository.ts
│   │   └── mappers/
│   │       ├── auction.mapper.ts
│   │       ├── auction-bid.mapper.ts
│   │       ├── auction-participation.mapper.ts
│   │       ├── auction-winner.mapper.ts
│   │       ├── lottery.mapper.ts
│   │       └── lottery-ticket.mapper.ts
│   └── event-publishers/
│       └── auction-event.publisher.ts
├── presentation/
│   ├── auction.controller.ts
│   ├── auction-bid.controller.ts
│   ├── lottery.controller.ts
│   └── auction-admin.controller.ts
└── auction.module.ts
```

### MEVCUT PRİSMA ŞEMASI — REFERANS

Backend Prisma şemasına aşağıdaki tabloları ekle. Mevcut tablolara DOKUNMA.

```prisma
// === BARTER ENUMS ===

enum SurplusStatus {
  PENDING_APPROVAL
  ACTIVE
  RESERVED
  TRADED
  EXPIRED
  DEACTIVATED
}

enum WantedItemStatus {
  PENDING
  ACTIVE
  MATCHED
  FULFILLED
  EXPIRED
}

enum WantedItemType {
  PRODUCT
  SERVICE
  MATERIAL
}

enum ListingType {
  BUY
  SELL
  BARTER
  BOTH
}

enum TradeOfferStatus {
  PENDING
  ACCEPTED
  REJECTED
  COUNTER_OFFERED
  EXPIRED
  CANCELLED
  COMPLETED
  LEGAL_PENDING
}

enum SwapSessionStatus {
  PENDING_COLLATERAL
  ACTIVE
  SHIPPING
  PARTIALLY_COMPLETED
  COMPLETED
  CANCELLED
  DISPUTED
  TIMEOUT
}

enum BarterPartStatus {
  PENDING
  SHIPPED
  DELIVERED
  CONFIRMED
  DISPUTED
}

enum DemandMatchStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}

enum DemandMatchType {
  SURPLUS_TO_WANTED
  WANTED_TO_SURPLUS
  SURPLUS_TO_SURPLUS
}

enum TradeChainStatus {
  DRAFT
  PROPOSED
  ACTIVE
  COMPLETED
  CANCELLED
}

enum ArbitratorType {
  INTERNAL
  EXTERNAL
}

enum PilotCity {
  ISTANBUL
  ANKARA
  IZMIR
  HATAY
}

// === AUCTION ENUMS ===

enum AuctionStatus {
  SCHEDULED
  ACTIVE
  ENDED
  COMPLETED
  CANCELLED
}

enum ParticipationStatus {
  PENDING
  APPROVED
  DEPOSIT_HELD
  ACTIVE
  WON
  LOST
  REFUNDED
}

enum LotteryStatus {
  ACTIVE
  ENDED
  DRAWN
  CANCELLED
}

// === BARTER TABLES ===

model SurplusCategory {
  id          String              @id @default(cuid())
  name        String              @unique
  slug        String?             @unique
  icon        String?
  parentId    String?             @map("parent_id")
  order       Int                 @default(0)
  isActive    Boolean             @default(true) @map("is_active")
  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")
  attributes  CategoryAttribute[]
  parent      SurplusCategory?    @relation("SurplusCategoryHierarchy", fields: [parentId], references: [id])
  children    SurplusCategory[]   @relation("SurplusCategoryHierarchy")
  wantedItems WantedItem[]

  @@index([parentId])
  @@index([slug])
  @@map("surplus_categories")
}

model SurplusItem {
  id                String                 @id @default(cuid())
  companyId         String                 @map("company_id")
  title             String
  description       String?
  category          String
  materialType      String?                @map("material_type")
  quantity          Decimal                @db.Decimal(18, 2)
  blockedQuantity   Decimal                @default(0) @map("blocked_quantity") @db.Decimal(18, 2)
  unit              String
  minTradeQuantity  Decimal?               @map("min_trade_quantity") @db.Decimal(18, 2)
  unitPrice         Decimal?               @map("unit_price") @db.Decimal(18, 2)
  wantedCategories  Json?                  @map("wanted_categories")
  tradeModes        Json?                  @map("trade_modes")
  technicalSpecs    Json?                  @map("technical_specs")
  images            Json?
  location          String?
  city              PilotCity?             @map("city")
  status            SurplusStatus          @default(PENDING_APPROVAL)
  reactivationCount Int                    @default(0) @map("reactivation_count")
  lastReactivatedAt DateTime?              @map("last_reactivated_at")
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  latitude          Float?
  longitude         Float?
  metadata          Json?
  demandMatches     DemandMatch[]
  company           Company                @relation(fields: [companyId], references: [id])
  givenOffers       TradeOffer[]           @relation("OfferedItemOffers")
  offers            TradeOffer[]           @relation("RequestedItemOffers")

  @@index([city])
  @@index([city, status])
  @@map("surplus_items")
}

model WantedItem {
  id              String                 @id @default(cuid())
  keywords        String[]
  description     String?
  latitude        Float?
  longitude       Float?
  categoryId      String                 @map("category_id")
  companyId       String?                @map("company_id")
  createdAt       DateTime               @default(now()) @map("created_at")
  isActive        Boolean                @default(true) @map("is_active")
  listingType     ListingType            @default(BUY) @map("listing_type")
  maxPrice        Decimal?               @map("max_price") @db.Decimal(18, 2)
  minPrice        Decimal?               @map("min_price") @db.Decimal(18, 2)
  updatedAt       DateTime               @updatedAt @map("updated_at")
  userId          String?                @map("user_id")
  status          WantedItemStatus       @default(PENDING)
  type            WantedItemType         @default(PRODUCT)
  matchesAsBuyer  DemandMatch[]          @relation("BuyerMatch")
  matchesAsSeller DemandMatch[]          @relation("SellerMatch")
  category        SurplusCategory        @relation(fields: [categoryId], references: [id])
  company         Company?               @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([companyId])
  @@index([userId])
  @@index([categoryId])
  @@map("wanted_items")
}

model DemandMatch {
  id              String            @id @default(cuid())
  score           Int
  notes           String?
  actionAt        DateTime?         @map("action_at")
  actionBy        String?           @map("action_by")
  buyerItemId     String            @map("buyer_item_id")
  createdAt       DateTime          @default(now()) @map("created_at")
  matchType       DemandMatchType   @map("match_type")
  rejectionReason String?           @map("rejection_reason")
  sellerItemId    String?           @map("seller_item_id")
  surplusItemId   String?           @map("surplus_item_id")
  updatedAt       DateTime          @updatedAt @map("updated_at")
  status          DemandMatchStatus @default(PENDING)
  buyerItem       WantedItem        @relation("BuyerMatch", fields: [buyerItemId], references: [id], onDelete: Cascade)
  sellerItem      WantedItem?       @relation("SellerMatch", fields: [sellerItemId], references: [id])
  surplusItem     SurplusItem?      @relation(fields: [surplusItemId], references: [id])

  @@index([buyerItemId])
  @@index([sellerItemId])
  @@map("demand_matches")
}

model TradeOffer {
  id                String              @id @default(cuid())
  fromCompanyId     String?             @map("from_company_id")
  toCompanyId       String?             @map("to_company_id")
  offeredItemId     String?             @map("offered_item_id")
  requestedItemId   String?             @map("requested_item_id")
  message           String?
  status            TradeOfferStatus    @default(PENDING)
  chainId           String?             @map("chain_id")
  parentOfferId     String?             @map("parent_offer_id")
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @updatedAt @map("updated_at")
  legalAcceptedAt   DateTime?           @map("legal_accepted_at")
  downPaymentHoldId String?             @unique @map("down_payment_hold_id")
  acceptedAt        DateTime?           @map("accepted_at")
  cancelledAt       DateTime?           @map("cancelled_at")
  cashAmount        Decimal             @map("cash_amount") @db.Decimal(18, 2)
  cashDirection     String              @map("cash_direction")
  cashCurrency      String              @map("currency")
  completedAt       DateTime?           @map("completed_at")
  counterOfferId    String?             @map("counter_offer_id")
  expiresAt         DateTime            @map("expires_at")
  initiatorId       String              @map("initiator_id")
  initiatorType     String              @map("initiator_type")
  receiverId        String              @map("receiver_id")
  receiverType      String              @map("receiver_type")
  rejectedAt        DateTime?           @map("rejected_at")
  offeredItems      TradeOfferItem[]    @relation("OfferedItems")
  requestedItems    TradeOfferItem[]    @relation("RequestedItems")
  swapSession       SwapSession?
  completion        TradeCompletion?
  chain             TradeChain?         @relation(fields: [chainId], references: [id], onDelete: Cascade)
  fromCompany       Company?            @relation("GivenOffers", fields: [fromCompanyId], references: [id])
  offeredItem       SurplusItem?        @relation("OfferedItemOffers", fields: [offeredItemId], references: [id])
  parentOffer       TradeOffer?         @relation("CounterOffers", fields: [parentOfferId], references: [id])
  counterOffers     TradeOffer[]        @relation("CounterOffers")
  requestedItem     SurplusItem?        @relation("RequestedItemOffers", fields: [requestedItemId], references: [id])
  toCompany         Company?            @relation("ReceivedOffers", fields: [toCompanyId], references: [id])
  reviews           TradeReview[]

  @@map("trade_offers")
}

model TradeOfferItem {
  id             String      @id @default(cuid())
  listingId      String?     @map("listing_id")
  surplusItemId  String?     @map("surplus_item_id")
  quantity       Decimal     @db.Decimal(18, 2)
  estimatedValue Decimal     @map("estimated_value") @db.Decimal(18, 2)
  offeredOfferId   String?   @map("offered_offer_id")
  requestedOfferId String?   @map("requested_offer_id")
  offeredAt        TradeOffer? @relation("OfferedItems", fields: [offeredOfferId], references: [id])
  requestedAt      TradeOffer? @relation("RequestedItems", fields: [requestedOfferId], references: [id])

  @@map("trade_offer_items")
}

model SwapSession {
  id                      String            @id @default(cuid())
  tradeOfferId            String            @unique @map("trade_offer_id")
  initiatorId             String            @map("initiator_id")
  receiverId              String            @map("receiver_id")
  shipmentMode            String            @map("shipment_mode")
  shipments               Json?             @map("shipments")
  escrowId                String?           @map("escrow_id")
  collateralAmount        Decimal           @map("collateral_amount") @db.Decimal(18, 2)
  collateralCurrency      String            @map("collateral_currency")
  collateralStatus        String            @map("collateral_status")
  collateralLockedAt      DateTime?         @map("collateral_locked_at")
  collateralReleasedAt    DateTime?         @map("collateral_released_at")
  collateralForfeitedAt   DateTime?         @map("collateral_forfeited_at")
  fromCollateralHoldId    String?           @unique @map("from_collateral_hold_id")
  toCollateralHoldId      String?           @unique @map("to_collateral_hold_id")
  status                  SwapSessionStatus @default(PENDING_COLLATERAL)
  timeoutAt               DateTime          @map("timeout_at")
  completedAt             DateTime?         @map("completed_at")
  cancelledAt             DateTime?         @map("cancelled_at")
  cancelledReason         String?           @map("cancelled_reason")
  disputedAt              DateTime?         @map("disputed_at")
  createdAt               DateTime          @default(now()) @map("created_at")
  updatedAt               DateTime          @updatedAt @map("updated_at")
  tradeOffer              TradeOffer        @relation(fields: [tradeOfferId], references: [id])
  parts                   BarterPart[]

  @@map("barter_swap_sessions")
}

model BarterPart {
  id                  String           @id @default(cuid())
  swapSessionId       String           @map("swap_session_id")
  partNumber          Int              @map("part_number")
  senderId            String           @map("sender_id")
  recipientId         String           @map("recipient_id")
  trackingCode        String?          @map("tracking_code")
  carrier             String?          @map("carrier")
  status              BarterPartStatus @default(PENDING)
  shippedAt           DateTime?        @map("shipped_at")
  deliveredAt         DateTime?        @map("delivered_at")
  confirmedAt         DateTime?        @map("confirmed_at")
  disputedAt          DateTime?        @map("disputed_at")
  disputeWindowEndsAt DateTime?        @map("dispute_window_ends_at")
  createdAt           DateTime         @default(now()) @map("created_at")
  updatedAt           DateTime         @updatedAt @map("updated_at")
  session             SwapSession      @relation(fields: [swapSessionId], references: [id])

  @@unique([swapSessionId, partNumber])
  @@map("barter_parts")
}

model TradeCompletion {
  id               String     @id @default(cuid())
  notes            String?
  cashDifference   Decimal?   @map("cash_difference") @db.Decimal(18, 2)
  completedAt      DateTime   @default(now()) @map("completed_at")
  fromItemQuantity Decimal?   @map("from_item_quantity") @db.Decimal(18, 2)
  toItemQuantity   Decimal?   @map("to_item_quantity") @db.Decimal(18, 2)
  tradeOfferId     String     @unique @map("trade_offer_id")
  tradeOffer       TradeOffer @relation(fields: [tradeOfferId], references: [id], onDelete: Cascade)

  @@index([tradeOfferId])
  @@map("trade_completions")
}

model TradeReview {
  id           String     @id @default(cuid())
  rating       Int
  comment      String?
  createdAt    DateTime   @default(now()) @map("created_at")
  fromUserId   String     @map("from_user_id")
  mediaUrl     String?    @map("media_url")
  toUserId     String     @map("to_user_id")
  tradeOfferId String     @map("trade_offer_id")
  tradeOffer   TradeOffer @relation(fields: [tradeOfferId], references: [id], onDelete: Cascade)

  @@unique([tradeOfferId, fromUserId])
  @@index([tradeOfferId])
  @@index([fromUserId])
  @@index([toUserId])
  @@map("trade_reviews")
}

model TradeChain {
  id         String           @id @default(cuid())
  createdAt  DateTime         @default(now()) @map("created_at")
  expiresAt  DateTime?        @map("expires_at")
  matchScore Float?           @map("match_score")
  totalValue Decimal?         @map("total_value") @db.Decimal(18, 2)
  updatedAt  DateTime         @updatedAt @map("updated_at")
  status     TradeChainStatus @default(DRAFT)
  offers     TradeOffer[]

  @@map("trade_chains")
}

model TradeMatch {
  id             String   @id @default(cuid())
  offerId        String   @unique @map("offer_id")
  completedAt    DateTime @default(now()) @map("completed_at")
  matchScore     Float    @default(0) @map("match_score")
  proximityScore Float?   @default(0) @map("proximity_score")

  @@map("trade_matches")
}

model BarterDisputeLog {
  id                   String         @id @default(cuid())
  swapSessionId        String         @map("swap_session_id")
  tradeOfferId         String         @map("trade_offer_id")
  openedById           String         @map("opened_by_id")
  respondentId         String         @map("respondent_id")
  tradeValueInKurus    Int            @map("trade_value_kurus")
  reason               String
  evidence             Json?
  status               String         @default("OPEN")
  arbitratorType       ArbitratorType @default(INTERNAL)
  arbitratorId         String?        @map("arbitrator_id")
  resolution           String?
  resolutionNote       String?        @map("resolution_note")
  costChargedToId      String?        @map("cost_charged_to_id")
  resolutionDeadlineAt DateTime?      @map("resolution_deadline_at")
  resolvedAt           DateTime?      @map("resolved_at")
  createdAt            DateTime       @default(now()) @map("created_at")
  updatedAt            DateTime       @updatedAt @map("updated_at")

  @@map("barter_dispute_logs")
}

// === AUCTION TABLES ===

model Auction {
  id                   String                 @id @default(cuid())
  status               AuctionStatus          @default(SCHEDULED)
  createdAt            DateTime               @default(now()) @map("created_at")
  currentPrice         Decimal                @map("current_price") @db.Decimal(18, 2)
  currentWinnerStep    Int                    @default(1) @map("current_winner_step")
  endTime              DateTime               @map("end_time")
  listingId            String                 @map("listing_id")
  minBidIncrement      Decimal                @default(1) @map("min_bid_increment") @db.Decimal(18, 2)
  participationDeposit Decimal?               @map("participation_deposit") @db.Decimal(18, 2)
  paymentDeadline      DateTime?              @map("payment_deadline")
  startTime            DateTime               @map("start_time")
  startingPrice        Decimal                @map("starting_price") @db.Decimal(18, 2)
  updatedAt            DateTime               @default(now()) @updatedAt @map("updated_at")
  userId               String                 @map("user_id")
  winner2Id            String?                @map("winner_2_id")
  winner3Id            String?                @map("winner_3_id")
  winnerId             String?                @map("winner_id")
  bids                 AuctionBid[]
  participations       AuctionParticipation[]
  winners              AuctionWinner[]
  listing              Listing                @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([status, endTime])
  @@index([listingId])
  @@map("auctions")
}

model AuctionWinner {
  id        String   @id @default(cuid())
  position  Int
  amount    Decimal? @db.Decimal(18, 2)
  auctionId String   @map("auction_id")
  createdAt DateTime @default(now()) @map("created_at")
  userId    String   @map("user_id")
  auction   Auction  @relation(fields: [auctionId], references: [id], onDelete: Cascade)

  @@unique([auctionId, position])
  @@index([auctionId])
  @@index([userId])
  @@map("auction_winners")
}

model AuctionParticipation {
  id            String              @id @default(cuid())
  status        ParticipationStatus @default(PENDING)
  auctionId     String              @map("auction_id")
  blockedAmount Decimal             @default(0) @map("blocked_amount") @db.Decimal(18, 2)
  createdAt     DateTime            @default(now()) @map("created_at")
  holdId        String?             @unique @map("hold_id")
  updatedAt     DateTime            @default(now()) @updatedAt @map("updated_at")
  userId        String              @map("user_id")
  auction       Auction             @relation(fields: [auctionId], references: [id], onDelete: Cascade)

  @@unique([auctionId, userId])
  @@map("auction_participations")
}

model AuctionBid {
  id        String   @id @default(cuid())
  amount    Decimal  @db.Decimal(18, 2)
  auctionId String   @map("auction_id")
  createdAt DateTime @default(now()) @map("created_at")
  userId    String   @map("user_id")
  auction   Auction  @relation(fields: [auctionId], references: [id], onDelete: Cascade)

  @@index([auctionId])
  @@index([userId])
  @@map("auction_bids")
}

model Lottery {
  id                String          @id @default(cuid())
  title             String
  prizeDescription  String?         @map("prize_description")
  ticketPrice       Decimal         @map("ticket_price") @db.Decimal(18, 2)
  status            LotteryStatus   @default(ACTIVE)
  winnerId          String?         @map("winner_id")
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @default(now()) @updatedAt @map("updated_at")
  endTime           DateTime        @map("end_time")
  maxTicketsPerUser Int             @default(10) @map("max_tickets_per_user")
  ownerId           String          @map("owner_id")
  startTime         DateTime        @default(now()) @map("start_time")
  ticketDigits      Int             @default(3) @map("ticket_digits")
  totalTickets      Int             @default(100) @map("total_tickets")
  numbersPerTicket  Int             @default(1) @map("numbers_per_ticket")
  prizeValue        Decimal?        @map("prize_value") @db.Decimal(18, 2)
  winningNumber     String?         @map("winning_number")
  listingId         String?         @map("listing_id")
  listing           Listing?        @relation(fields: [listingId], references: [id])
  tickets           LotteryTicket[]

  @@index([endTime])
  @@index([status])
  @@map("lotteries")
}

model LotteryTicket {
  id        String   @id @default(cuid())
  lotteryId String   @map("lottery_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  numbers   String[]
  lottery   Lottery  @relation(fields: [lotteryId], references: [id], onDelete: Cascade)

  @@index([lotteryId])
  @@index([userId])
  @@map("lottery_tickets")
}
```

NOT: Company modeline (Faz 4A'da tanımlı) şu relation'ları EKLE:
```prisma
surplusItems        SurplusItem[]
givenOffers         TradeOffer[]  @relation("GivenOffers")
receivedOffers      TradeOffer[]  @relation("ReceivedOffers")
wantedItems         WantedItem[]
```

Listing modeline (Faz 4B'de tanımlı) şu relation'ları EKLE:
```prisma
auctions            Auction[]
lotteries           Lottery[]
```

### DOSYA LİSTESİ — HER BİRİNİN TAM İÇERİĞİNİ YAZ

Dosya numaralandırmasını burada listelemek yerine, yukarıdaki klasör yapısındaki
HER DOSYANIN tam içeriğini yaz. Sıralama:

BÖLÜM 1 — PRISMA + BARTER DOMAIN:
- schema.prisma güncellemesi
- Barter tüm enum'lar
- Barter tüm value objects (trade-value, collateral-amount, match-score)
- Barter tüm entities (surplus-item, wanted-item, demand-match, trade-offer, trade-offer-item, swap-session, barter-part, trade-completion, trade-review, trade-chain, barter-dispute-log, surplus-category)
- Barter tüm events
- Barter tüm repository interfaces
- trade-state-machine.service.ts — TradeOffer state machine:
  PENDING → [ACCEPTED, REJECTED, COUNTER_OFFERED, EXPIRED, CANCELLED]
  ACCEPTED → [LEGAL_PENDING]
  LEGAL_PENDING → [COMPLETED, CANCELLED]

BÖLÜM 2 — BARTER APPLICATION:
- Tüm DTOs
- matching.service.ts — SurplusItem + WantedItem eşleştirme (score hesaplama: kategori uyumu, lokasyon yakınlığı, fiyat aralığı)
- collateral-calculator.service.ts — teminat hesaplama (trade value'nun %25'i default, DownPaymentPolicy'den al)
- Tüm commands + handlers
  Özellikle:
  - accept-trade-offer: SwapSession oluştur, BarterPart'lar oluştur
  - lock-collateral: FinancialGateway.holdFunds (her iki taraf için)
  - ship-barter-part: trackingCode + carrier ekle, status SHIPPED
  - confirm-delivery: status CONFIRMED, dispute window başlat (3 gün)
  - complete-swap: tüm part'lar CONFIRMED ise → collateral release + cash transfer + TradeCompletion + barter.completed event
  - open-barter-dispute: SwapSession status DISPUTED, BarterDisputeLog oluştur
  - resolve-barter-dispute: arbitrator kararı → collateral forfeiture veya release
- Tüm queries + handlers
- Event handlers:
  - trade-offer-accepted: RabbitMQ publish (barter.accepted → financial-service + delivery-service)
  - swap-completed: RabbitMQ publish (barter.completed → financial-service komisyon hesaplasın)

BÖLÜM 3 — BARTER INFRASTRUCTURE + PRESENTATION:
- Tüm mappers
- Tüm Prisma repositories
- barter-event.publisher.ts (BARTER_EXCHANGE = 'barter.events', routing keys: offer.created, offer.accepted, offer.rejected, collateral.locked, part.shipped, part.delivered, swap.completed, dispute.opened)
- Tüm controllers:
  - surplus-item.controller: CRUD + company'ye ait
  - wanted-item.controller: CRUD + user/company'ye ait
  - demand-match.controller: eşleştirme listesi, kabul/red
  - trade-offer.controller: teklif gönder, kabul, red, counter
  - swap-session.controller: session detayı, kargo gönder, teslimat onayla
  - trade-review.controller: takas sonrası değerlendirme
  - surplus-category.controller: @Public, kategori listesi
  - barter-admin.controller: @Roles('ADMIN'), tüm teklifler/session'lar, dispute çözümleme
- barter.module.ts

BÖLÜM 4 — AUCTION DOMAIN + APPLICATION:
- Tüm enum'lar
- Tüm value objects
- Tüm entities:
  - Auction extends AggregateRoot:
    - static create(): status SCHEDULED + AuctionCreatedEvent
    - start(): SCHEDULED → ACTIVE (startTime geldiğinde)
    - placeBid(userId, amount): bid oluştur, currentPrice güncelle
      - Validation: amount >= currentPrice + minBidIncrement
      - Validation: auction ACTIVE
      - Validation: userId katılımcı mı (AuctionParticipation ACTIVE)
    - end(): ACTIVE → ENDED, winner'ları belirle (en yüksek 3 bid)
    - complete(): → COMPLETED
    - cancel(): → CANCELLED
    - escalateWinner(): currentWinnerStep++ (kazanan ödemezse sıradakine geç)
  - AuctionBid: amount (BidAmount VO), userId, auctionId
  - AuctionParticipation: deposit hold + status tracking
  - Lottery + LotteryTicket
- auction-state-machine.service.ts:
  SCHEDULED → [ACTIVE, CANCELLED]
  ACTIVE → [ENDED, CANCELLED]
  ENDED → [COMPLETED]
- auction-scheduler.service.ts:
  - Cron job: her dakika SCHEDULED auction'ları kontrol, startTime ≤ now → start()
  - Cron job: ACTIVE auction'ları kontrol, endTime ≤ now → end()
  - Cron job: paymentDeadline geçen kazananlar → escalateWinner()
- Tüm DTOs, commands, queries, event handlers

BÖLÜM 5 — AUCTION INFRASTRUCTURE + PRESENTATION + MODULE REGISTRATION:
- Tüm mappers, repositories
- auction-event.publisher.ts (AUCTION_EXCHANGE = 'auction.events')
- Controllers:
  - auction.controller: @Public liste, detay; authenticated: oluştur
  - auction-bid.controller: authenticated: teklif ver
  - lottery.controller: @Public liste; authenticated: bilet al
  - auction-admin.controller: @Roles('ADMIN'), yönetim
- auction.module.ts
- app-components.ts GÜNCELLE: EXCHANGE = [BarterModule, AuctionModule]
- app.module.ts GÜNCELLE (gerekiyorsa)

### EK GÖREV

Tüm dosyaları yazdıktan sonra `pnpm build` hatasız derlenmesi için gereken adımları listele.

### KONTROL

1. IEventBus KULLANILMAMIŞ mı? (Her modülün kendi EventPublisher sınıfı var mı?)
2. FinancialGateway üzerinden collateral hold/release yapılıyor mu?
3. TradeOffer state machine geçişleri doğru mu?
4. Auction bid validation: amount >= currentPrice + minBidIncrement?
5. Auction end: en yüksek 3 bid winner olarak belirleniyor mu?
6. EscalateWinner: currentWinnerStep doğru artıyor mu?
7. Collateral calculator: DownPaymentPolicy'den oran alıyor mu?
8. Swap complete: tüm BarterPart CONFIRMED kontrolü var mı?
9. Barter dispute: collateral forfeiture mantığı doğru mu?
10. Lottery draw: random winner seçimi adil mi?
11. Decimal kullanımı — float sızmamış mı?
12. TypeScript strict mode derlenir mi?
13. Company relation'ları (surplusItems, givenOffers, receivedOffers, wantedItems) eklenmiş mi?
14. Listing relation'ları (auctions, lotteries) eklenmiş mi?

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

Bu çok büyük bir faz. Parçalı verme planı:

- Birinci mesaj: BÖLÜM 1 (Prisma + Barter Domain)
- İkinci mesaj: BÖLÜM 2 (Barter Application — DTOs + Services + Commands + Queries)
- Üçüncü mesaj: BÖLÜM 3 (Barter Infrastructure + Presentation + Module)
- Dördüncü mesaj: BÖLÜM 4 (Auction Domain + Application)
- Beşinci mesaj: BÖLÜM 5 (Auction Infrastructure + Presentation + Module Registration)

Her parçada system prompt'u TEKRAR VER.

KRİTİK REVIEW NOKTALARI:
- Barter'ın en karmaşık kısmı SwapSession + BarterPart + Collateral üçgeni
- Counter-offer zinciri (parentOfferId) düzgün çalışıyor mu
- Collateral forfeiture vs release kararları dispute çözümüne bağlı mı
- Auction scheduler cron job'ları doğru interval'de mi
- Lottery çekiliş randomness'ı (crypto.randomInt kullanılmalı)