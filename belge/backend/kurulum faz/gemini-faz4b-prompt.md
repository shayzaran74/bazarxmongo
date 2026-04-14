# Gemini Prompt — FAZ 4B: Catalog + Inventory Modülleri

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

DAHA ÖNCE TAMAMLANAN MODÜLLER:
- Faz 1: Shared paketler (core, persistence, messaging, observability, security, nest)
- Faz 2: Identity & Auth modülü (User, UserProfile, UserAddress, Auth, Session)
- Faz 3: Financial Service (ayrı servis — Wallet, Ledger, Commission, Escrow)
- Faz 4A: Vendor modülü (Company, Vendor, VendorProfile, VendorSettings, B2B, BankAccount, Ecosystem, Subscription)

SHARED PAKETLER (bunları kullanacaksın):

@barterborsa/shared-core:
  - Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent
  - IRepository<T>, IReadRepository<T>, IWriteRepository<T>
  - IUseCase<TInput, TOutput>, Command, Query
  - PaginationInput, PaginatedResult<T>
  - DomainException, NotFoundException, ConflictException
  - Result<T, E>, Ok(), Err(), isOk(), isErr()

@barterborsa/shared-persistence:
  - PrismaModule, PrismaService, BasePrismaRepository<T>, PrismaUnitOfWork

@barterborsa/shared-messaging:
  - RabbitMQModule, RabbitMQService, IntegrationEvent, IEventBus

@barterborsa/shared-security:
  - AuthGuard, RolesGuard

@barterborsa/shared-nest:
  - @CurrentUser(), @Roles(), @Public()
  - ResponseTransformInterceptor, GlobalExceptionFilter
  - ValidationPipe, ParsePaginationPipe

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. Kendi mimari önerini ekleme
4. TypeScript strict mode
5. Import'larda @barterborsa/* workspace alias kullan
6. Kod yorumlarını Türkçe yaz
7. Her dosya ÇALIŞIR, DERLENEBILIR, eksiksiz olacak
8. User tablosuna relation EKLEME — sadece userId string
9. Vendor tablosu Faz 4A'da zaten tanımlı — ona yeni relation'lar eklenecek (listings, inventoryLogs, purchaseOrders, transfers, warehouses)
10. Decimal kullan, float YASAK (fiyatlar, tutarlar)
```

### GÖREV

```
FAZ 4B: Catalog ve Inventory modüllerini yaz.

Bu iki modül birlikte çalışır:
- Catalog: Ürün kataloğu (CatalogProduct), kategoriler (Category), markalar (Brand),
  listing'ler (Listing), koleksiyonlar (Collection), favoriler, review'lar
- Inventory: Stok yönetimi (Stock, Warehouse), satın alma siparişleri (PurchaseOrder),
  transferler (Transfer), envanter logları (InventoryLog)

Önemli mimari ayrım:
- CatalogProduct = platform genelindeki ürün (Trendyol'daki "ürün kartı" gibi)
- Listing = bir vendor'ın o ürünü listelemesi (fiyat, stok, koşul, varyant)
- Bir CatalogProduct'ın birden fazla Listing'i olabilir (farklı vendor'lardan)

Önemli iş kuralları:
- Listing oluşturulabilmesi için vendor APPROVED olmalı
- Listing stok 0'a düşünce status → OUT_OF_STOCK
- Fiyat değişikliğinde ListingPriceHistory kaydı oluşturulmalı
- Review yazabilmek için sipariş tamamlanmış olmalı (orderId zorunlu)
- Favorite: kullanıcı CatalogProduct'ı favoriye ekler (Listing'i değil)
- Listing slug unique olmalı
- Category hiyerarşik (parent-child tree yapısı)
- Brand onay süreci var (PENDING → APPROVED/REJECTED)

İki modülün yapısı:

apps/backend/src/modules/catalog/
├── application/
│   ├── commands/
│   │   ├── create-catalog-product.command.ts
│   │   ├── create-catalog-product.handler.ts
│   │   ├── update-catalog-product.command.ts
│   │   ├── update-catalog-product.handler.ts
│   │   ├── create-category.command.ts
│   │   ├── create-category.handler.ts
│   │   ├── update-category.command.ts
│   │   ├── update-category.handler.ts
│   │   ├── create-brand.command.ts
│   │   ├── create-brand.handler.ts
│   │   ├── approve-brand.command.ts
│   │   ├── approve-brand.handler.ts
│   │   ├── reject-brand.command.ts
│   │   ├── reject-brand.handler.ts
│   │   ├── create-listing.command.ts
│   │   ├── create-listing.handler.ts
│   │   ├── update-listing.command.ts
│   │   ├── update-listing.handler.ts
│   │   ├── update-listing-price.command.ts
│   │   ├── update-listing-price.handler.ts
│   │   ├── change-listing-status.command.ts
│   │   ├── change-listing-status.handler.ts
│   │   ├── add-listing-images.command.ts
│   │   ├── add-listing-images.handler.ts
│   │   ├── remove-listing-image.command.ts
│   │   ├── remove-listing-image.handler.ts
│   │   ├── add-favorite.command.ts
│   │   ├── add-favorite.handler.ts
│   │   ├── remove-favorite.command.ts
│   │   ├── remove-favorite.handler.ts
│   │   ├── create-review.command.ts
│   │   ├── create-review.handler.ts
│   │   ├── approve-review.command.ts
│   │   ├── approve-review.handler.ts
│   │   ├── create-collection.command.ts
│   │   ├── create-collection.handler.ts
│   │   ├── update-collection.command.ts
│   │   ├── update-collection.handler.ts
│   │   ├── add-to-collection.command.ts
│   │   ├── add-to-collection.handler.ts
│   │   ├── remove-from-collection.command.ts
│   │   ├── remove-from-collection.handler.ts
│   │   ├── create-campaign.command.ts
│   │   ├── create-campaign.handler.ts
│   │   ├── create-group-buy.command.ts
│   │   └── create-group-buy.handler.ts
│   ├── queries/
│   │   ├── get-catalog-product.query.ts
│   │   ├── get-catalog-product.handler.ts
│   │   ├── search-catalog-products.query.ts
│   │   ├── search-catalog-products.handler.ts
│   │   ├── get-category-tree.query.ts
│   │   ├── get-category-tree.handler.ts
│   │   ├── get-category.query.ts
│   │   ├── get-category.handler.ts
│   │   ├── list-brands.query.ts
│   │   ├── list-brands.handler.ts
│   │   ├── get-listing.query.ts
│   │   ├── get-listing.handler.ts
│   │   ├── get-listing-by-slug.query.ts
│   │   ├── get-listing-by-slug.handler.ts
│   │   ├── search-listings.query.ts
│   │   ├── search-listings.handler.ts
│   │   ├── get-vendor-listings.query.ts
│   │   ├── get-vendor-listings.handler.ts
│   │   ├── get-favorites.query.ts
│   │   ├── get-favorites.handler.ts
│   │   ├── get-reviews.query.ts
│   │   ├── get-reviews.handler.ts
│   │   ├── get-collection.query.ts
│   │   ├── get-collection.handler.ts
│   │   ├── list-collections.query.ts
│   │   ├── list-collections.handler.ts
│   │   ├── get-listing-price-history.query.ts
│   │   └── get-listing-price-history.handler.ts
│   ├── event-handlers/
│   │   ├── listing-created.handler.ts
│   │   └── listing-stock-changed.handler.ts
│   └── dtos/
│       ├── create-catalog-product.dto.ts
│       ├── create-category.dto.ts
│       ├── create-brand.dto.ts
│       ├── create-listing.dto.ts
│       ├── update-listing.dto.ts
│       ├── update-listing-price.dto.ts
│       ├── create-review.dto.ts
│       ├── create-collection.dto.ts
│       ├── create-campaign.dto.ts
│       ├── create-group-buy.dto.ts
│       ├── catalog-product-response.dto.ts
│       ├── category-response.dto.ts
│       ├── brand-response.dto.ts
│       ├── listing-response.dto.ts
│       ├── listing-detail-response.dto.ts
│       ├── review-response.dto.ts
│       ├── collection-response.dto.ts
│       └── favorite-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── catalog-product.entity.ts
│   │   ├── catalog-model.entity.ts
│   │   ├── category.entity.ts
│   │   ├── brand.entity.ts
│   │   ├── listing.entity.ts
│   │   ├── listing-image.entity.ts
│   │   ├── product-media.entity.ts
│   │   ├── product-type.entity.ts
│   │   ├── review.entity.ts
│   │   ├── favorite.entity.ts
│   │   ├── collection.entity.ts
│   │   ├── collection-product.entity.ts
│   │   ├── campaign.entity.ts
│   │   ├── coupon.entity.ts
│   │   ├── group-buy.entity.ts
│   │   ├── category-attribute.entity.ts
│   │   ├── badge-rule.entity.ts
│   │   └── listing-price-history.entity.ts
│   ├── value-objects/
│   │   ├── slug.vo.ts
│   │   ├── price.vo.ts
│   │   ├── rating.vo.ts
│   │   └── gtin.vo.ts
│   ├── events/
│   │   ├── listing-created.event.ts
│   │   ├── listing-updated.event.ts
│   │   ├── listing-price-changed.event.ts
│   │   ├── listing-stock-changed.event.ts
│   │   ├── review-created.event.ts
│   │   └── product-created.event.ts
│   ├── repositories/
│   │   ├── catalog-product.repository.interface.ts
│   │   ├── category.repository.interface.ts
│   │   ├── brand.repository.interface.ts
│   │   ├── listing.repository.interface.ts
│   │   ├── listing-image.repository.interface.ts
│   │   ├── review.repository.interface.ts
│   │   ├── favorite.repository.interface.ts
│   │   ├── collection.repository.interface.ts
│   │   ├── campaign.repository.interface.ts
│   │   └── group-buy.repository.interface.ts
│   └── enums/
│       ├── listing-status.enum.ts
│       ├── listing-visibility.enum.ts
│       ├── product-condition.enum.ts
│       ├── brand-status.enum.ts
│       ├── category-type.enum.ts
│       └── campaign-type.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-catalog-product.repository.ts
│   │   ├── prisma-category.repository.ts
│   │   ├── prisma-brand.repository.ts
│   │   ├── prisma-listing.repository.ts
│   │   ├── prisma-listing-image.repository.ts
│   │   ├── prisma-review.repository.ts
│   │   ├── prisma-favorite.repository.ts
│   │   ├── prisma-collection.repository.ts
│   │   ├── prisma-campaign.repository.ts
│   │   ├── prisma-group-buy.repository.ts
│   │   └── mappers/
│   │       ├── catalog-product.mapper.ts
│   │       ├── category.mapper.ts
│   │       ├── brand.mapper.ts
│   │       ├── listing.mapper.ts
│   │       ├── listing-image.mapper.ts
│   │       ├── review.mapper.ts
│   │       ├── favorite.mapper.ts
│   │       ├── collection.mapper.ts
│   │       ├── campaign.mapper.ts
│   │       └── group-buy.mapper.ts
│   └── event-publishers/
│       └── catalog-event.publisher.ts
├── presentation/
│   ├── catalog-product.controller.ts
│   ├── category.controller.ts
│   ├── brand.controller.ts
│   ├── listing.controller.ts
│   ├── listing-vendor.controller.ts
│   ├── review.controller.ts
│   ├── favorite.controller.ts
│   ├── collection.controller.ts
│   ├── campaign.controller.ts
│   └── catalog-admin.controller.ts
└── catalog.module.ts

apps/backend/src/modules/inventory/
├── application/
│   ├── commands/
│   │   ├── create-warehouse.command.ts
│   │   ├── create-warehouse.handler.ts
│   │   ├── update-warehouse.command.ts
│   │   ├── update-warehouse.handler.ts
│   │   ├── adjust-stock.command.ts
│   │   ├── adjust-stock.handler.ts
│   │   ├── reserve-stock.command.ts
│   │   ├── reserve-stock.handler.ts
│   │   ├── release-stock.command.ts
│   │   ├── release-stock.handler.ts
│   │   ├── create-purchase-order.command.ts
│   │   ├── create-purchase-order.handler.ts
│   │   ├── receive-purchase-order.command.ts
│   │   ├── receive-purchase-order.handler.ts
│   │   ├── create-transfer.command.ts
│   │   ├── create-transfer.handler.ts
│   │   ├── complete-transfer.command.ts
│   │   └── complete-transfer.handler.ts
│   ├── queries/
│   │   ├── get-stock.query.ts
│   │   ├── get-stock.handler.ts
│   │   ├── get-warehouse-stocks.query.ts
│   │   ├── get-warehouse-stocks.handler.ts
│   │   ├── list-warehouses.query.ts
│   │   ├── list-warehouses.handler.ts
│   │   ├── get-purchase-orders.query.ts
│   │   ├── get-purchase-orders.handler.ts
│   │   ├── get-transfers.query.ts
│   │   ├── get-transfers.handler.ts
│   │   ├── get-inventory-logs.query.ts
│   │   ├── get-inventory-logs.handler.ts
│   │   ├── get-low-stock-alerts.query.ts
│   │   └── get-low-stock-alerts.handler.ts
│   ├── event-handlers/
│   │   ├── order-created.handler.ts
│   │   └── order-cancelled.handler.ts
│   └── dtos/
│       ├── create-warehouse.dto.ts
│       ├── adjust-stock.dto.ts
│       ├── create-purchase-order.dto.ts
│       ├── create-transfer.dto.ts
│       ├── warehouse-response.dto.ts
│       ├── stock-response.dto.ts
│       ├── purchase-order-response.dto.ts
│       ├── transfer-response.dto.ts
│       └── inventory-log-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── warehouse.entity.ts
│   │   ├── stock.entity.ts
│   │   ├── purchase-order.entity.ts
│   │   ├── purchase-order-item.entity.ts
│   │   ├── transfer.entity.ts
│   │   ├── transfer-item.entity.ts
│   │   └── inventory-log.entity.ts
│   ├── value-objects/
│   │   └── stock-quantity.vo.ts
│   ├── events/
│   │   ├── stock-adjusted.event.ts
│   │   ├── stock-reserved.event.ts
│   │   ├── stock-low.event.ts
│   │   └── purchase-order-received.event.ts
│   ├── repositories/
│   │   ├── warehouse.repository.interface.ts
│   │   ├── stock.repository.interface.ts
│   │   ├── purchase-order.repository.interface.ts
│   │   ├── transfer.repository.interface.ts
│   │   └── inventory-log.repository.interface.ts
│   └── enums/
│       ├── purchase-order-status.enum.ts
│       └── transfer-status.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-warehouse.repository.ts
│   │   ├── prisma-stock.repository.ts
│   │   ├── prisma-purchase-order.repository.ts
│   │   ├── prisma-transfer.repository.ts
│   │   ├── prisma-inventory-log.repository.ts
│   │   └── mappers/
│   │       ├── warehouse.mapper.ts
│   │       ├── stock.mapper.ts
│   │       ├── purchase-order.mapper.ts
│   │       ├── transfer.mapper.ts
│   │       └── inventory-log.mapper.ts
│   └── event-publishers/
│       └── inventory-event.publisher.ts
├── presentation/
│   ├── warehouse.controller.ts
│   ├── stock.controller.ts
│   ├── purchase-order.controller.ts
│   ├── transfer.controller.ts
│   └── inventory-admin.controller.ts
└── inventory.module.ts
```

### MEVCUT PRİSMA ŞEMASI — REFERANS

Backend Prisma şemasına (apps/backend/prisma/schema.prisma) aşağıdaki tabloları ekle.
FAZ 4A'daki tablolar (Company, Vendor vs.) zaten mevcut — onlara dokunma.
Vendor modeline yeni relation'lar ekle: listings, inventoryLogs, purchaseOrders, transfers, warehouses.

```prisma
// === CATALOG ENUMS ===

enum ListingStatus {
  DRAFT
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
  SUSPENDED
  REJECTED
  ARCHIVED
}

enum ListingVisibility {
  PUBLIC
  PRIVATE
  ECOSYSTEM_ONLY
  B2B_ONLY
}

enum ProductCondition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  REFURBISHED
}

enum BrandStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum CategoryType {
  GENERAL
  BARTER
  RESTAURANT
  SERVICE
}

enum CampaignType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
  BUY_X_GET_Y
}

// === INVENTORY ENUMS ===

enum PurchaseOrderStatus {
  Draft
  Ordered
  PartiallyReceived
  Received
  Cancelled
}

enum TransferStatus {
  Pending
  InTransit
  PartiallyReceived
  Completed
  Cancelled
}

// === CATALOG TABLES ===

model CatalogModel {
  id          String           @id @default(uuid())
  modelCode   String           @unique @map("model_code")
  name        String
  slug        String           @unique
  brand       String
  description String
  attributes  Json?
  categoryId  String?          @map("category_id")
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")
  category    Category?        @relation(fields: [categoryId], references: [id])
  products    CatalogProduct[]

  @@index([modelCode])
  @@index([slug])
  @@map("catalog_models")
}

model CatalogProduct {
  id             String           @id @default(uuid())
  gtin           String?          @unique
  name           String
  slug           String           @unique
  brand          String
  description    String
  specs          Json?
  categoryId     String?          @map("category_id")
  productTypeId  String?          @map("product_type_id")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")
  rating         Decimal          @default(0) @db.Decimal(3, 2)
  isFeatured     Boolean          @default(false) @map("is_featured")
  modelId        String?          @map("model_id")
  attributes     Json?
  metadata       Json?
  sourceUrl      String?          @map("source_url")
  scrapedAt      DateTime?        @map("scraped_at")
  isFlashSale    Boolean          @default(false) @map("is_flash_sale")
  status         String           @default("ACTIVE")
  isSpecialOffer Boolean          @default(false) @map("is_special_offer")
  category       Category?        @relation(fields: [categoryId], references: [id])
  catalogModel   CatalogModel?    @relation(fields: [modelId], references: [id])
  productType    ProductType?     @relation(fields: [productTypeId], references: [id])
  favorites      Favorite[]
  listings       Listing[]
  media          ProductMedia[]
  reviews        Review[]
  brands         Brand[]          @relation("BrandToCatalogProduct")

  @@map("catalog_products")
}

model Category {
  id                String              @id @default(cuid())
  name              String
  slug              String              @unique
  icon              String?
  parentId          String?             @map("parent_id")
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @default(now()) @updatedAt @map("updated_at")
  description       String?
  order             Int                 @default(0)
  isActive          Boolean             @default(true) @map("is_active")
  badgeColor        String?             @default("#ef4444") @map("badge_color")
  badgeText         String?             @map("badge_text")
  type              CategoryType        @default(GENERAL)
  image             String?
  attributeTemplate Json?               @map("attribute_template")
  colorFrom         String?             @map("color_from")
  colorTo           String?             @map("color_to")
  hoverColor        String?             @map("hover_color")
  shadowColor       String?             @map("shadow_color")
  isFeatured        Boolean             @default(false) @map("is_featured")
  megaMenuColor     String?             @map("mega_menu_color")
  megaMenuIcon      String?             @map("mega_menu_icon")
  megaMenuOrder     Int?                @map("mega_menu_order")
  blurhash          String?
  catalogModels     CatalogModel[]
  catalogProducts   CatalogProduct[]
  parent            Category?           @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children          Category[]          @relation("CategoryHierarchy")
  attributes        CategoryAttribute[]
  vendorCategories  VendorCategory[]

  @@index([order])
  @@index([parentId])
  @@index([slug])
  @@map("categories")
}

model Brand {
  id                        String           @id @default(cuid())
  name                      String           @unique
  slug                      String           @unique
  icon                      String?
  image                     String?
  order                     Int              @default(0)
  aliases                   String[]         @default([])
  description               String?
  status                    BrandStatus      @default(PENDING)
  isOfficial                Boolean          @default(false) @map("is_official")
  isPopular                 Boolean          @default(false) @map("is_popular")
  popularityScore           Int              @default(0) @map("popularity_score")
  productCount              Int              @default(0) @map("product_count")
  violationCount            Int              @default(0) @map("violation_count")
  approvedAt                DateTime?        @map("approved_at")
  rejectedAt                DateTime?        @map("rejected_at")
  rejectionReason           String?          @map("rejection_reason")
  reviewedBy                String?          @map("reviewed_by")
  submittedAt               DateTime?        @map("submitted_at")
  createdAt                 DateTime         @default(now()) @map("created_at")
  updatedAt                 DateTime         @updatedAt @map("updated_at")
  vendorId                  String?          @map("vendor_id")
  blurhash                  String?
  violations                BrandViolation[]
  vendor                    Vendor?          @relation(fields: [vendorId], references: [id])
  catalog_products          CatalogProduct[] @relation("BrandToCatalogProduct")

  @@map("brands")
}

model BrandViolation {
  id                String    @id @default(cuid())
  description       String?
  status            String    @default("PENDING")
  severity          String?
  adminNotes        String?   @map("admin_notes")
  brandId           String    @map("brand_id")
  createdAt         DateTime  @default(now()) @map("created_at")
  evidenceUrls      String[]  @default([]) @map("evidence_urls")
  relatedProductIds String[]  @default([]) @map("related_product_ids")
  relatedVendorId   String?   @map("related_vendor_id")
  reporterId        String    @map("reporter_id")
  reporterType      String    @map("reporter_type")
  resolvedAt        DateTime? @map("resolved_at")
  resolvedBy        String?   @map("resolved_by")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  violationType     String    @map("violation_type")
  brand             Brand     @relation(fields: [brandId], references: [id], onDelete: Cascade)

  @@index([brandId])
  @@index([reporterId])
  @@map("brand_violations")
}

model ProductType {
  id              String           @id
  name            String           @unique
  slug            String           @unique
  description     String?
  schema          Json?
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @default(now()) @updatedAt @map("updated_at")
  catalogProducts CatalogProduct[]

  @@index([slug])
  @@map("product_types")
}

model Listing {
  id                   String              @id @default(cuid())
  vendorId             String              @map("vendor_id")
  catalogProductId     String              @map("catalog_product_id")
  title                String
  description          String?
  price                Decimal             @db.Decimal(18, 2)
  stock                Int                 @default(0)
  status               ListingStatus       @default(ACTIVE)
  visibility           ListingVisibility   @default(PUBLIC)
  isPromoted           Boolean             @default(false) @map("is_promoted")
  promotedPrice        Decimal?            @map("promoted_price") @db.Decimal(18, 2)
  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  originalPrice        Decimal?            @map("original_price") @db.Decimal(18, 2)
  condition            ProductCondition    @default(NEW)
  wholesalePrice       Decimal?            @map("wholesale_price") @db.Decimal(18, 2)
  minWholesaleQty      Int?                @map("min_wholesale_qty")
  sku                  String?
  isDigital            Boolean             @default(false) @map("is_digital")
  isB2BOnly            Boolean             @default(false) @map("is_b2b_only")
  b2bDiscount          Decimal?            @map("b2b_discount") @db.Decimal(5, 2)
  shippingTemplateId   String?             @map("shipping_template_id")
  tags                 String[]            @default([])
  isFeatured           Boolean             @default(false) @map("is_featured")
  featuredUntil        DateTime?           @map("featured_until")
  slug                 String?             @unique
  listingType          String              @default("SELL") @map("listing_type")
  isAuctionEnabled     Boolean             @default(false) @map("is_auction_enabled")
  isLotteryEnabled     Boolean             @default(false) @map("is_lottery_enabled")
  lastStatusChangedAt  DateTime?           @map("last_status_changed_at")
  rejectionReason      String?             @map("rejection_reason")
  isSpecialOffer       Boolean             @default(false) @map("is_special_offer")
  isFlashSale          Boolean             @default(false) @map("is_flash_sale")
  minMarketPrice       Decimal?            @map("min_market_price") @db.Decimal(18, 2)
  maxPurchasePerMember Int                 @default(100) @map("max_purchase_per_member")
  ecosystemId          String?             @map("ecosystem_id")
  variantOptions       Json?               @map("variant_options")
  integrationCode      String?             @map("integration_code")
  isActive             Boolean             @default(true) @map("is_active")
  commissionRate       Decimal?            @map("commission_rate") @db.Decimal(5, 2)
  metadata             Json?
  weight               Decimal             @default(0) @db.Decimal(10, 3)
  volume               Decimal             @default(0) @db.Decimal(10, 3)
  variants             Json?
  availableQuantity    Int                 @default(0) @map("available_quantity")
  reservedQuantity     Int                 @default(0) @map("reserved_quantity")
  isSponsored          Boolean             @default(false) @map("is_sponsored")
  lowStockThreshold    Int                 @default(5) @map("low_stock_threshold")
  sponsorBudget        Decimal?            @default(0) @map("sponsor_budget") @db.Decimal(18, 2)
  // Relations
  catalogProduct       CatalogProduct      @relation(fields: [catalogProductId], references: [id])
  ecosystem            BrandEcosystem?     @relation(fields: [ecosystemId], references: [id])
  vendor               Vendor              @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  images               ListingImage[]
  priceHistory         ListingPriceHistory[]
  stats                ListingStats?
  inventoryLogs        InventoryLog[]
  stocks               Stock[]
  purchaseOrderItems   PurchaseOrderItem[]
  transferItems        TransferItem[]
  cartItems            CartItem[]
  orderItems           OrderItem[]
  collectionProducts   CollectionProduct[]
  analytics            ListingAnalytic[]
  campaigns            Campaign[]          @relation("CampaignListings")

  @@index([vendorId])
  @@index([catalogProductId])
  @@index([slug])
  @@map("listings")
}

model ListingImage {
  id        String   @id @default(cuid())
  listingId String   @map("listing_id")
  url       String
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("listing_images")
}

model ListingPriceHistory {
  id        String   @id @default(cuid())
  listingId String   @map("listing_id")
  price     Decimal  @db.Decimal(18, 2)
  changedAt DateTime @default(now()) @map("changed_at")
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([listingId])
  @@map("listing_price_history")
}

model ListingStats {
  id        String   @id @default(cuid())
  listingId String   @unique @map("listing_id")
  views     Int      @default(0)
  sales     Int      @default(0)
  updatedAt DateTime @updatedAt @map("updated_at")
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("listing_stats")
}

model ListingAnalytic {
  id        String   @id @default(cuid())
  listingId String   @map("listing_id")
  views     Int      @default(0)
  clicks    Int      @default(0)
  sales     Int      @default(0)
  revenue   Decimal  @default(0) @db.Decimal(18, 2)
  date      DateTime @default(now())
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([listingId, date])
  @@index([date])
  @@map("listing_analytics")
}

model ProductMedia {
  id        String         @id @default(uuid())
  productId String         @map("product_id")
  url       String
  blurhash  String?
  type      String         @default("IMAGE")
  sortOrder Int            @default(0) @map("sort_order")
  product   CatalogProduct @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([sortOrder])
  @@map("product_media")
}

model Review {
  id               String         @id @default(cuid())
  userId           String         @map("user_id")
  rating           Int
  comment          String?
  images           String[]       @default([])
  isApproved       Boolean        @default(false) @map("is_approved")
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @default(now()) @updatedAt @map("updated_at")
  isVerified       Boolean        @default(false) @map("is_verified")
  orderId          String?        @map("order_id")
  catalogProductId String         @map("catalog_product_id")
  catalogProduct   CatalogProduct @relation(fields: [catalogProductId], references: [id], onDelete: Cascade)

  @@unique([userId, catalogProductId])
  @@index([catalogProductId])
  @@map("reviews")
}

model Favorite {
  id               String         @id @default(cuid())
  userId           String         @map("user_id")
  catalogProductId String         @map("catalog_product_id")
  createdAt        DateTime       @default(now()) @map("created_at")
  product          CatalogProduct @relation(fields: [catalogProductId], references: [id], onDelete: Cascade)

  @@unique([userId, catalogProductId])
  @@index([userId])
  @@map("favorites")
}

model CategoryAttribute {
  id           String    @id @default(cuid())
  name         String
  label        String
  type         String
  options      Json?
  unit         String?
  placeholder  String?
  order        Int       @default(0)
  categoryId   String?   @map("category_id")
  createdAt    DateTime  @default(now()) @map("created_at")
  isActive     Boolean   @default(true) @map("is_active")
  isFilterable Boolean   @default(true) @map("is_filterable")
  isRequired   Boolean   @default(false) @map("is_required")
  isVariant    Boolean   @default(false) @map("is_variant")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  category     Category? @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
  @@index([order])
  @@map("category_attributes")
}

model BadgeRule {
  id              String    @id @default(cuid())
  code            String?   @unique
  position        String?   @default("TOP_LEFT")
  priority        Int       @default(0)
  backgroundColor String?   @map("background_color")
  badgeColor      String?   @map("badge_color")
  badgeIcon       String?   @map("badge_icon")
  badgeText       String    @map("badge_text")
  conditionJson   Json      @map("condition_json")
  createdAt       DateTime  @default(now()) @map("created_at")
  displayText     Json?     @map("display_text")
  iconUrl         String?   @map("icon_url")
  isActive        Boolean   @default(true) @map("is_active")
  name            String
  targetEcosystem String[]  @default(["ALL"]) @map("target_ecosystem")
  textColor       String?   @map("text_color")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  validFrom       DateTime? @map("valid_from")
  validUntil      DateTime? @map("valid_until")

  @@map("badge_rules")
}

// === COLLECTION ===

model Collection {
  id              String              @id @default(cuid())
  title           String
  handle          String              @unique
  description     String?
  type            String              @default("Manual")
  image           String?
  conditionType   String?             @map("condition_type")
  conditions      Json?
  metaTitle       String?             @map("meta_title")
  metaDescription String?             @map("meta_description")
  isPublished     Boolean             @default(false) @map("is_published")
  publishedAt     DateTime?           @map("published_at")
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")
  products        CollectionProduct[]

  @@map("collections")
}

model CollectionProduct {
  collectionId String     @map("collection_id")
  listingId    String     @map("listing_id")
  position     Int        @default(0)
  createdAt    DateTime   @default(now()) @map("created_at")
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  listing      Listing    @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@id([collectionId, listingId])
  @@map("collection_products")
}

// === CAMPAIGN ===

model Campaign {
  id              String       @id @default(cuid())
  title           String
  description     String?
  type            CampaignType
  value           Decimal      @db.Decimal(18, 2)
  minAmount       Decimal?     @map("min_amount") @db.Decimal(18, 2)
  startDate       DateTime     @map("start_date")
  endDate         DateTime     @map("end_date")
  isActive        Boolean      @default(true) @map("is_active")
  usageLimit      Int?         @map("usage_limit")
  usedCount       Int          @default(0) @map("used_count")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")
  banner          String?
  category        String       @default("STANDARD")
  maxUsagePerUser Int          @default(1) @map("max_usage_per_user")
  priority        Int          @default(0)
  coupons         Coupon[]
  listings        Listing[]    @relation("CampaignListings")

  @@map("campaigns")
}

model Coupon {
  id         String    @id @default(cuid())
  code       String    @unique
  campaignId String    @map("campaign_id")
  userId     String?   @map("user_id")
  isUsed     Boolean   @default(false) @map("is_used")
  usedAt     DateTime? @map("used_at")
  expiresAt  DateTime? @map("expires_at")
  campaign   Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@map("coupons")
}

model GroupBuy {
  id              String   @id @default(cuid())
  title           String?
  description     String?
  tiers           Json
  createdAt       DateTime @default(now()) @map("created_at")
  currentQuantity Int      @default(0) @map("current_quantity")
  endDate         DateTime @map("end_date")
  isActive        Boolean  @default(true) @map("is_active")
  listingId       String   @map("listing_id")
  startDate       DateTime @map("start_date")
  updatedAt       DateTime @updatedAt @map("updated_at")
  listing         Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([isActive])
  @@index([endDate])
  @@map("group_buys")
}

// === INVENTORY TABLES ===

model Warehouse {
  id        String   @id @default(cuid())
  name      String
  vendorId  String   @map("vendor_id")
  location  String?
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  stocks    Stock[]
  vendor    Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("warehouses")
}

model Stock {
  id          String    @id @default(cuid())
  listingId   String    @map("listing_id")
  warehouseId String    @map("warehouse_id")
  quantity    Int       @default(0)
  committed   Int       @default(0)
  updatedAt   DateTime  @updatedAt @map("updated_at")
  listing     Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  @@unique([listingId, warehouseId])
  @@map("stocks")
}

model PurchaseOrder {
  id               String              @id @default(cuid())
  supplier         String
  status           PurchaseOrderStatus @default(Draft)
  createdAt        DateTime            @default(now()) @map("created_at")
  estimatedArrival DateTime?           @map("estimated_arrival")
  orderNumber      String              @unique @map("order_number")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  vendorId         String?             @map("vendor_id")
  items            PurchaseOrderItem[]
  vendor           Vendor?             @relation(fields: [vendorId], references: [id])

  @@map("purchase_orders")
}

model PurchaseOrderItem {
  id              String        @id @default(cuid())
  quantity        Int
  costPerItem     Decimal       @map("cost_per_item") @db.Decimal(18, 2)
  createdAt       DateTime      @default(now()) @map("created_at")
  listingId       String        @map("listing_id")
  purchaseOrderId String        @map("purchase_order_id")
  receivedQty     Int           @default(0) @map("received_qty")
  listing         Listing       @relation(fields: [listingId], references: [id])
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)

  @@map("purchase_order_items")
}

model Transfer {
  id               String         @id @default(cuid())
  status           TransferStatus @default(Pending)
  createdAt        DateTime       @default(now()) @map("created_at")
  estimatedArrival DateTime?      @map("estimated_arrival")
  fromLocation     String         @map("from_location")
  toLocation       String         @map("to_location")
  transferNumber   String         @unique @map("transfer_number")
  updatedAt        DateTime       @updatedAt @map("updated_at")
  vendorId         String?        @map("vendor_id")
  items            TransferItem[]
  vendor           Vendor?        @relation(fields: [vendorId], references: [id])

  @@map("transfers")
}

model TransferItem {
  id          String   @id @default(cuid())
  quantity    Int
  createdAt   DateTime @default(now()) @map("created_at")
  listingId   String   @map("listing_id")
  receivedQty Int      @default(0) @map("received_qty")
  transferId  String   @map("transfer_id")
  listing     Listing  @relation(fields: [listingId], references: [id])
  transfer    Transfer @relation(fields: [transferId], references: [id], onDelete: Cascade)

  @@map("transfer_items")
}

model InventoryLog {
  id          String   @id @default(cuid())
  change      Int
  reason      String
  createdAt   DateTime @default(now()) @map("created_at")
  listingId   String   @map("listing_id")
  referenceId String?  @map("reference_id")
  vendorId    String   @map("vendor_id")
  listing     Listing  @relation(fields: [listingId], references: [id])
  vendor      Vendor   @relation(fields: [vendorId], references: [id])

  @@index([listingId])
  @@index([vendorId])
  @@map("inventory_logs")
}
```

NOT: Vendor modeline (Faz 4A'da tanımlı) şu relation'ları EKLE:
```prisma
// Vendor modeline eklenecek yeni relation'lar
listings          Listing[]
inventoryLogs     InventoryLog[]
purchaseOrders    PurchaseOrder[]
transfers         Transfer[]
warehouses        Warehouse[]
brands            Brand[]
vendorCategories  VendorCategory[]
```

BrandEcosystem modeline ekle:
```prisma
listings          Listing[]
```

### DOSYA LİSTESİ — HER BİRİNİN TAM İÇERİĞİNİ YAZ

```
=== PRİSMA GÜNCELLEME ===

DOSYA #1: apps/backend/prisma/schema.prisma
- Mevcut Identity + Vendor tablolarını KORU
- Yukarıdaki TÜM catalog + inventory tablolarını ve enum'ları ekle
- Vendor modeline yeni relation'ları ekle
- BrandEcosystem modeline listings relation'ı ekle

=== CATALOG MODULE — DOMAIN ===

DOSYA #2: apps/backend/src/modules/catalog/domain/enums/listing-status.enum.ts
DOSYA #3: apps/backend/src/modules/catalog/domain/enums/listing-visibility.enum.ts
DOSYA #4: apps/backend/src/modules/catalog/domain/enums/product-condition.enum.ts
DOSYA #5: apps/backend/src/modules/catalog/domain/enums/brand-status.enum.ts
DOSYA #6: apps/backend/src/modules/catalog/domain/enums/category-type.enum.ts
DOSYA #7: apps/backend/src/modules/catalog/domain/enums/campaign-type.enum.ts

DOSYA #8: apps/backend/src/modules/catalog/domain/value-objects/slug.vo.ts
- Slug extends ValueObject
- Validasyon: lowercase, no spaces, URL-safe, min 2 karakter
- static fromTitle(title: string): Slug — Türkçe karakterleri dönüştür (ş→s, ö→o, ü→u, ç→c, ğ→g, ı→i)

DOSYA #9: apps/backend/src/modules/catalog/domain/value-objects/price.vo.ts
- Price extends ValueObject
- Props: amount (Decimal), originalPrice (Decimal nullable), wholesalePrice (Decimal nullable)
- isDiscounted(): originalPrice !== null && amount < originalPrice
- discountPercentage(): indirim yüzdesi
- Validation: amount > 0

DOSYA #10: apps/backend/src/modules/catalog/domain/value-objects/rating.vo.ts
- Rating extends ValueObject
- Props: value (Decimal 0-5), count (number)
- Validation: 0 <= value <= 5

DOSYA #11: apps/backend/src/modules/catalog/domain/value-objects/gtin.vo.ts
- GTIN extends ValueObject
- Validasyon: EAN-13 veya UPC-A formatı (13 veya 12 haneli)

DOSYA #12: apps/backend/src/modules/catalog/domain/entities/catalog-product.entity.ts
- CatalogProduct extends AggregateRoot
- Props: name, slug, brand, description, specs, categoryId, productTypeId, rating, isFeatured, gtin, modelId, attributes, metadata, status
- static create(): + ProductCreatedEvent
- updateRating(newRating): ortalama rating güncelle

DOSYA #13: apps/backend/src/modules/catalog/domain/entities/catalog-model.entity.ts
DOSYA #14: apps/backend/src/modules/catalog/domain/entities/category.entity.ts
- Category extends AggregateRoot
- Props: name, slug, parentId, icon, description, order, isActive, type, image, attributeTemplate, isFeatured, badgeColor, badgeText
- static create(): kategori oluştur
- isRoot(): parentId === null
- activate() / deactivate()

DOSYA #15: apps/backend/src/modules/catalog/domain/entities/brand.entity.ts
- Brand extends AggregateRoot
- Props: name, slug, description, status, isOfficial, vendorId
- static create(): status PENDING
- approve(): PENDING → APPROVED
- reject(reason): PENDING → REJECTED

DOSYA #16: apps/backend/src/modules/catalog/domain/entities/listing.entity.ts
- Listing extends AggregateRoot
- Props: vendorId, catalogProductId, title, description, price (Price VO), stock, status, visibility, condition, slug, sku, tags, variantOptions, weight, volume, availableQuantity, reservedQuantity, lowStockThreshold, isDigital, isB2BOnly, ecosystemId, commissionRate, listingType, isAuctionEnabled, isLotteryEnabled
- static create(): + ListingCreatedEvent
- updatePrice(newPrice): fiyat değiştir + ListingPriceChangedEvent (PriceHistory kaydı tetikler)
- adjustStock(quantity, reason): stok güncelle + ListingStockChangedEvent
  - stok 0'a düşerse status → OUT_OF_STOCK
  - stok <= lowStockThreshold ise StockLowEvent
- reserveStock(quantity): availableQuantity azalt, reservedQuantity artır
- releaseStock(quantity): reservedQuantity azalt, availableQuantity artır
- activate() / deactivate() / suspend(reason) / archive()

DOSYA #17: apps/backend/src/modules/catalog/domain/entities/listing-image.entity.ts
DOSYA #18: apps/backend/src/modules/catalog/domain/entities/product-media.entity.ts
DOSYA #19: apps/backend/src/modules/catalog/domain/entities/product-type.entity.ts
DOSYA #20: apps/backend/src/modules/catalog/domain/entities/review.entity.ts
- Review extends Entity
- Props: userId, catalogProductId, rating, comment, images, isApproved, isVerified, orderId
- static create(): review oluştur + ReviewCreatedEvent
- approve(): isApproved = true
- Validation: rating 1-5

DOSYA #21: apps/backend/src/modules/catalog/domain/entities/favorite.entity.ts
DOSYA #22: apps/backend/src/modules/catalog/domain/entities/collection.entity.ts
DOSYA #23: apps/backend/src/modules/catalog/domain/entities/collection-product.entity.ts
DOSYA #24: apps/backend/src/modules/catalog/domain/entities/campaign.entity.ts
- Campaign extends AggregateRoot
- Props: title, description, type (CampaignType), value, minAmount, startDate, endDate, isActive, usageLimit, usedCount, banner, maxUsagePerUser, priority
- isExpired(): endDate < now
- isAvailable(): isActive && !isExpired && (usageLimit === null || usedCount < usageLimit)
- use(): usedCount++

DOSYA #25: apps/backend/src/modules/catalog/domain/entities/coupon.entity.ts
DOSYA #26: apps/backend/src/modules/catalog/domain/entities/group-buy.entity.ts
DOSYA #27: apps/backend/src/modules/catalog/domain/entities/category-attribute.entity.ts
DOSYA #28: apps/backend/src/modules/catalog/domain/entities/badge-rule.entity.ts
DOSYA #29: apps/backend/src/modules/catalog/domain/entities/listing-price-history.entity.ts

DOSYA #30-35: Domain events (listing-created, listing-updated, listing-price-changed, listing-stock-changed, review-created, product-created)

DOSYA #36-45: Repository interfaces (catalog-product, category, brand, listing, listing-image, review, favorite, collection, campaign, group-buy)
- IListingRepository: findBySlug, findByVendorId(paginated), search(query, filters, pagination), findByCatalogProductId
- ICategoryRepository: findBySlug, findRoots, findChildren(parentId), getTree
- IBrandRepository: findBySlug, findByStatus(paginated)

DOSYA #46-51: Enums tanımları (zaten #2-7'de)

=== CATALOG MODULE — APPLICATION DTOs ===

DOSYA #52: apps/backend/src/modules/catalog/application/dtos/create-catalog-product.dto.ts
- name, slug, brand, description, specs, categoryId, productTypeId, gtin, modelId, attributes

DOSYA #53: apps/backend/src/modules/catalog/application/dtos/create-category.dto.ts
- name, parentId, icon, description, type, image, order

DOSYA #54: apps/backend/src/modules/catalog/application/dtos/create-brand.dto.ts
- name, description, icon, image

DOSYA #55: apps/backend/src/modules/catalog/application/dtos/create-listing.dto.ts
- catalogProductId, title, description, price, stock, condition, visibility, sku, tags, variantOptions, weight, volume, isDigital, isB2BOnly, b2bDiscount, wholesalePrice, minWholesaleQty, lowStockThreshold, shippingTemplateId, ecosystemId, listingType, images (string[])

DOSYA #56: apps/backend/src/modules/catalog/application/dtos/update-listing.dto.ts
- PartialType(CreateListingDto) — fiyat ve stok HARİÇ (ayrı endpoint)

DOSYA #57: apps/backend/src/modules/catalog/application/dtos/update-listing-price.dto.ts
- price, promotedPrice, originalPrice, wholesalePrice

DOSYA #58: apps/backend/src/modules/catalog/application/dtos/create-review.dto.ts
- catalogProductId, orderId, rating, comment, images

DOSYA #59: apps/backend/src/modules/catalog/application/dtos/create-collection.dto.ts
DOSYA #60: apps/backend/src/modules/catalog/application/dtos/create-campaign.dto.ts
DOSYA #61: apps/backend/src/modules/catalog/application/dtos/create-group-buy.dto.ts

DOSYA #62: apps/backend/src/modules/catalog/application/dtos/catalog-product-response.dto.ts
DOSYA #63: apps/backend/src/modules/catalog/application/dtos/category-response.dto.ts
- CategoryResponseDto: id, name, slug, icon, description, type, parentId, children (recursive), isActive

DOSYA #64: apps/backend/src/modules/catalog/application/dtos/brand-response.dto.ts
DOSYA #65: apps/backend/src/modules/catalog/application/dtos/listing-response.dto.ts
- ListingResponseDto: id, title, slug, price, originalPrice, stock, status, condition, vendorName, mainImage, rating

DOSYA #66: apps/backend/src/modules/catalog/application/dtos/listing-detail-response.dto.ts
- ListingDetailResponseDto: tüm listing alanları + images[] + vendor bilgisi + catalogProduct bilgisi

DOSYA #67: apps/backend/src/modules/catalog/application/dtos/review-response.dto.ts
DOSYA #68: apps/backend/src/modules/catalog/application/dtos/collection-response.dto.ts
DOSYA #69: apps/backend/src/modules/catalog/application/dtos/favorite-response.dto.ts

=== CATALOG MODULE — APPLICATION Commands ===

DOSYA #70: create-catalog-product command + handler — @Roles('ADMIN'), slug duplicate kontrolü
DOSYA #71: update-catalog-product command + handler
DOSYA #72: create-category command + handler — @Roles('ADMIN'), slug üret, parent kontrolü
DOSYA #73: update-category command + handler
DOSYA #74: create-brand command + handler — slug üret, duplicate kontrolü
DOSYA #75: approve-brand command + handler — @Roles('ADMIN')
DOSYA #76: reject-brand command + handler — @Roles('ADMIN')
DOSYA #77: create-listing command + handler
- Vendor APPROVED kontrolü
- CatalogProduct var mı kontrolü
- Slug üret (title + vendorId'den)
- Listing.create(), ListingImage kaydet
- Inventory: Stock kaydı oluştur (default warehouse)
- ListingCreated event

DOSYA #78: update-listing command + handler (fiyat/stok hariç)
DOSYA #79: update-listing-price command + handler
- Fiyat değiştir + ListingPriceHistory kaydet
- ListingPriceChanged event

DOSYA #80: change-listing-status command + handler — activate, deactivate, suspend, archive
DOSYA #81: add-listing-images command + handler
DOSYA #82: remove-listing-image command + handler

DOSYA #83: add-favorite command + handler — duplicate kontrolü (userId + catalogProductId unique)
DOSYA #84: remove-favorite command + handler

DOSYA #85: create-review command + handler
- orderId doğrula (sipariş tamamlanmış mı)
- userId + catalogProductId unique kontrolü
- Review.create(), isApproved = false (admin onayı bekler)
- ReviewCreated event → CatalogProduct rating güncelle

DOSYA #86: approve-review command + handler — @Roles('ADMIN')

DOSYA #87: create-collection command + handler — @Roles('ADMIN')
DOSYA #88: update-collection command + handler
DOSYA #89: add-to-collection / remove-from-collection command + handler
DOSYA #90: create-campaign command + handler — @Roles('ADMIN')
DOSYA #91: create-group-buy command + handler

=== CATALOG MODULE — APPLICATION Queries ===

DOSYA #92: get-catalog-product query + handler — slug veya id ile
DOSYA #93: search-catalog-products query + handler — Paginated, filtrelenebilir (category, brand, price range, search text)
DOSYA #94: get-category-tree query + handler — Tüm kategori ağacını recursive döndür
DOSYA #95: get-category query + handler
DOSYA #96: list-brands query + handler — Paginated, filtrelenebilir (status, search)
DOSYA #97: get-listing query + handler — id ile, include images + vendor
DOSYA #98: get-listing-by-slug query + handler
DOSYA #99: search-listings query + handler
- Paginated, filtrelenebilir: category, brand, vendor, priceMin/priceMax, condition, status, visibility, search text, tags, sortBy (price, rating, createdAt, popularity)

DOSYA #100: get-vendor-listings query + handler — vendor'ın kendi listing'leri
DOSYA #101: get-favorites query + handler — kullanıcının favorileri
DOSYA #102: get-reviews query + handler — catalogProductId ile, paginated
DOSYA #103: get-collection / list-collections query + handler
DOSYA #104: get-listing-price-history query + handler

=== CATALOG MODULE — Event Handlers ===

DOSYA #105: listing-created event handler → RabbitMQ publish (catalog.listing.created)
DOSYA #106: listing-stock-changed event handler → stok 0 ise status OUT_OF_STOCK

=== CATALOG MODULE — Infrastructure ===

DOSYA #107-116: Mappers (catalog-product, category, brand, listing, listing-image, review, favorite, collection, campaign, group-buy)

DOSYA #117-126: Prisma repositories (catalog-product, category, brand, listing, listing-image, review, favorite, collection, campaign, group-buy)
- PrismaListingRepository: search metodu — Prisma where ile dinamik filtre oluştur, include images + vendor.profile
- PrismaCategoryRepository: getTree — recursive CTE veya nested query ile ağaç yapısı

DOSYA #127: catalog-event.publisher.ts
- CATALOG_EXCHANGE = 'catalog.events'
- Routing keys: listing.created, listing.updated, listing.price_changed, listing.stock_changed, review.created

=== CATALOG MODULE — Presentation ===

DOSYA #128: catalog-product.controller.ts
- GET /products — @Public(), search + filter + paginate
- GET /products/:slug — @Public(), ürün detayı + listing'leri
- POST /products — @Roles('ADMIN'), ürün oluştur
- PUT /products/:id — @Roles('ADMIN')

DOSYA #129: category.controller.ts
- GET /categories — @Public(), kategori ağacı
- GET /categories/:slug — @Public()
- POST /categories — @Roles('ADMIN')
- PUT /categories/:id — @Roles('ADMIN')

DOSYA #130: brand.controller.ts
- GET /brands — @Public(), marka listesi
- POST /brands — authenticated vendor
- POST /admin/brands/:id/approve — @Roles('ADMIN')
- POST /admin/brands/:id/reject — @Roles('ADMIN')

DOSYA #131: listing.controller.ts
- GET /listings — @Public(), search + filter + paginate (ana vitrin)
- GET /listings/:slug — @Public(), listing detayı
- GET /listings/:id/price-history — @Public()

DOSYA #132: listing-vendor.controller.ts
- GET /vendors/me/listings — authenticated vendor, kendi listing'leri
- POST /vendors/me/listings — authenticated vendor, listing oluştur
- PUT /vendors/me/listings/:id — authenticated vendor
- PATCH /vendors/me/listings/:id/price — authenticated vendor, fiyat güncelle
- PATCH /vendors/me/listings/:id/status — authenticated vendor (activate/deactivate)
- POST /vendors/me/listings/:id/images — authenticated vendor
- DELETE /vendors/me/listings/:id/images/:imageId — authenticated vendor

DOSYA #133: review.controller.ts
- GET /products/:productId/reviews — @Public(), paginated
- POST /reviews — authenticated, review yaz
- POST /admin/reviews/:id/approve — @Roles('ADMIN')

DOSYA #134: favorite.controller.ts
- GET /users/me/favorites — authenticated
- POST /favorites — authenticated, favoriye ekle
- DELETE /favorites/:productId — authenticated, favoriden çıkar

DOSYA #135: collection.controller.ts
- GET /collections — @Public()
- GET /collections/:handle — @Public()
- POST /collections — @Roles('ADMIN')
- POST /collections/:id/products — @Roles('ADMIN'), ürün ekle
- DELETE /collections/:id/products/:listingId — @Roles('ADMIN')

DOSYA #136: campaign.controller.ts
- GET /campaigns — @Public(), aktif kampanyalar
- POST /campaigns — @Roles('ADMIN')

DOSYA #137: catalog-admin.controller.ts
- @Roles('ADMIN', 'SUPER_ADMIN')
- GET /admin/listings — tüm listing'ler (admin filtreler)
- PATCH /admin/listings/:id/status — listing durumu değiştir (suspend/reject)
- GET /admin/reviews — onay bekleyen review'lar
- GET /admin/brands — onay bekleyen markalar

DOSYA #138: apps/backend/src/modules/catalog/catalog.module.ts

=== INVENTORY MODULE — DOMAIN ===

DOSYA #139: apps/backend/src/modules/inventory/domain/enums/purchase-order-status.enum.ts
DOSYA #140: apps/backend/src/modules/inventory/domain/enums/transfer-status.enum.ts

DOSYA #141: apps/backend/src/modules/inventory/domain/value-objects/stock-quantity.vo.ts
- StockQuantity extends ValueObject
- Props: quantity (number), committed (number)
- available(): quantity - committed
- canFulfill(requested): available() >= requested
- reserve(amount): committed += amount
- release(amount): committed -= amount

DOSYA #142: apps/backend/src/modules/inventory/domain/entities/warehouse.entity.ts
- Warehouse extends AggregateRoot
- Props: vendorId, name, location, isActive
- static create()
- activate() / deactivate()

DOSYA #143: apps/backend/src/modules/inventory/domain/entities/stock.entity.ts
- Stock extends Entity
- Props: listingId, warehouseId, quantity (StockQuantity VO)
- adjust(change, reason): stok ayarla + StockAdjustedEvent
- reserve(amount): sipariş için ayır
- release(amount): iptal edilen siparişi serbest bırak

DOSYA #144: apps/backend/src/modules/inventory/domain/entities/purchase-order.entity.ts
- PurchaseOrder extends AggregateRoot
- Props: vendorId, supplier, orderNumber, status, estimatedArrival, items[]
- static create(): status Draft + orderNumber üret
- submit(): Draft → Ordered
- receivePartial(items): Ordered → PartiallyReceived
- receiveAll(): → Received + PurchaseOrderReceivedEvent
- cancel(): → Cancelled

DOSYA #145: apps/backend/src/modules/inventory/domain/entities/purchase-order-item.entity.ts
DOSYA #146: apps/backend/src/modules/inventory/domain/entities/transfer.entity.ts
- Transfer extends AggregateRoot
- Props: vendorId, fromLocation, toLocation, transferNumber, status, estimatedArrival, items[]
- static create(): status Pending + transferNumber üret
- ship(): Pending → InTransit
- receivePartial(): → PartiallyReceived
- complete(): → Completed (stok transferi gerçekleştir)
- cancel(): → Cancelled

DOSYA #147: apps/backend/src/modules/inventory/domain/entities/transfer-item.entity.ts
DOSYA #148: apps/backend/src/modules/inventory/domain/entities/inventory-log.entity.ts
- InventoryLog extends Entity (append-only)
- Props: listingId, vendorId, change (int, + veya -), reason, referenceId

DOSYA #149-152: Domain events (stock-adjusted, stock-reserved, stock-low, purchase-order-received)
DOSYA #153-157: Repository interfaces (warehouse, stock, purchase-order, transfer, inventory-log)

=== INVENTORY MODULE — APPLICATION ===

DOSYA #158-159: create-warehouse command + handler — vendor'a ait
DOSYA #160-161: update-warehouse command + handler
DOSYA #162-163: adjust-stock command + handler
- Stok değişikliği, InventoryLog kaydet
- Listing.adjustStock() çağır (status OUT_OF_STOCK kontrolü)
- StockAdjusted event

DOSYA #164-165: reserve-stock command + handler — sipariş oluşturulduğunda
DOSYA #166-167: release-stock command + handler — sipariş iptal edildiğinde
DOSYA #168-169: create-purchase-order command + handler
DOSYA #170-171: receive-purchase-order command + handler — stok artır, InventoryLog kaydet
DOSYA #172-173: create-transfer command + handler
DOSYA #174-175: complete-transfer command + handler — kaynak depodan düş, hedef depoya ekle

DOSYA #176-183: Queries (get-stock, get-warehouse-stocks, list-warehouses, get-purchase-orders, get-transfers, get-inventory-logs, get-low-stock-alerts)
- get-low-stock-alerts: availableQuantity <= lowStockThreshold olan listing'leri bul

DOSYA #184: order-created event handler — RabbitMQ'dan dinle → reserveStock
DOSYA #185: order-cancelled event handler — RabbitMQ'dan dinle → releaseStock

DOSYA #186-194: DTOs (warehouse, stock, purchase-order, transfer, inventory-log request/response)

=== INVENTORY MODULE — Infrastructure ===

DOSYA #195-199: Mappers (warehouse, stock, purchase-order, transfer, inventory-log)
DOSYA #200-204: Prisma repositories
- PrismaStockRepository: findByListingAndWarehouse, findLowStock(vendorId, threshold)
- PrismaInventoryLogRepository: findByListing(paginated), findByVendor(paginated)

DOSYA #205: inventory-event.publisher.ts
- INVENTORY_EXCHANGE = 'inventory.events'
- Routing keys: stock.adjusted, stock.reserved, stock.low, purchase_order.received

=== INVENTORY MODULE — Presentation ===

DOSYA #206: warehouse.controller.ts
- GET /vendors/me/warehouses — authenticated vendor
- POST /vendors/me/warehouses — authenticated vendor
- PUT /vendors/me/warehouses/:id — authenticated vendor

DOSYA #207: stock.controller.ts
- GET /vendors/me/stocks — authenticated vendor, listing veya warehouse filtresi
- PATCH /vendors/me/stocks/adjust — authenticated vendor, stok ayarla

DOSYA #208: purchase-order.controller.ts
- GET /vendors/me/purchase-orders — authenticated vendor
- POST /vendors/me/purchase-orders — authenticated vendor
- PATCH /vendors/me/purchase-orders/:id/receive — authenticated vendor

DOSYA #209: transfer.controller.ts
- GET /vendors/me/transfers — authenticated vendor
- POST /vendors/me/transfers — authenticated vendor
- PATCH /vendors/me/transfers/:id/complete — authenticated vendor

DOSYA #210: inventory-admin.controller.ts
- @Roles('ADMIN')
- GET /admin/inventory/low-stock — düşük stok uyarıları
- GET /admin/inventory/logs — tüm envanter logları

DOSYA #211: apps/backend/src/modules/inventory/inventory.module.ts

=== MODULE REGISTRATION ===

DOSYA #212: apps/backend/src/app-components.ts (GÜNCELLE)
- MARKET grubuna CatalogModule ve InventoryModule ekle

DOSYA #213: apps/backend/src/app.module.ts (GÜNCELLE — gerekiyorsa)
```

### KONTROL

Tüm dosyaları yazdıktan sonra şunları kontrol et:
1. Her dosyanın başında tam path var mı?
2. Listing entity'de fiyat değişikliğinde ListingPriceHistory otomatik oluşturuyor mu?
3. Stok 0'a düşünce status OUT_OF_STOCK oluyor mu?
4. Review'da orderId doğrulaması var mı?
5. Category tree recursive dönüyor mu?
6. Slug VO'da Türkçe karakter dönüşümü var mı (ş→s, ö→o)?
7. Stock reserve/release mantığı doğru mu (committed alanı)?
8. PurchaseOrder alındığında stok artıyor mu?
9. InventoryLog append-only mu (update/delete yok)?
10. Vendor APPROVED kontrolü listing oluşturmada var mı?
11. Decimal kullanımı — float sızmamış mı?
12. TypeScript strict mode derlenir mi?

Sorun varsa düzelt ve açıkla.

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

213 dosya — en büyük faz. Parçalı verme planı:

- Birinci mesaj: Dosya #1 — #51 (Prisma + Catalog Domain)
- İkinci mesaj: Dosya #52 — #106 (Catalog Application: DTOs + Commands + Queries + Events)
- Üçüncü mesaj: Dosya #107 — #138 (Catalog Infrastructure + Presentation + Module)
- Dördüncü mesaj: Dosya #139 — #175 (Inventory Domain + Commands)
- Beşinci mesaj: Dosya #176 — #213 (Inventory Queries + Infrastructure + Presentation + Module)

Her parçada system prompt'u TEKRAR VER.

Sonraki prompt: Faz 4C (Commerce + FinancialGateway)
