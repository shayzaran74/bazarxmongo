# Gemini Prompt — FAZ 7B: Content + Advertising Modülleri

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

ÖNEMLİ DI PATTERN:
- IEventBus interface'ini KULLANMA. Her modülün kendi EventPublisher sınıfı olacak.
- `any` tipi YASAK — her yerde doğru tip kullan.
- Repository'ler için @Inject('TOKEN') ile injection token kullan.

DAHA ÖNCE TAMAMLANAN:
- Faz 1-6: Shared paketler, Identity, Financial, Vendor, Catalog, Inventory, Commerce, Barter, Auction, Delivery
- Faz 7A: Communication (Chat, Notification, Complaint)

SHARED PAKETLER:
@barterborsa/shared-core: Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent, IRepository<T>, Command, Query, PaginationInput, PaginatedResult<T>, Result<T,E>, Ok(), Err(), DomainException, NotFoundException
@barterborsa/shared-persistence: PrismaModule, PrismaService, BasePrismaRepository<T>
@barterborsa/shared-messaging: RabbitMQModule, PublisherService, IntegrationEvent
@barterborsa/shared-nest: @CurrentUser(), @Roles(), @Public(), ResponseTransformInterceptor, GlobalExceptionFilter

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. TypeScript strict mode — `any` YASAK
4. Import'larda @barterborsa/* workspace alias kullan
5. Kod yorumlarını Türkçe yaz
6. User/Vendor/Listing tablosuna doğrudan relation EKLEME — sadece string ID referansı
7. Decimal kullan (fiyat/bütçe alanları), float YASAK
```

### GÖREV

```
FAZ 7B: Content ve Advertising modüllerini yaz.

Content modülü platform içerik yönetimini kapsar:
- HomeBanner: Anasayfa slider banner'ları
- HomeQuadCard: Anasayfa 4'lü ürün kartları
- HelpCategory + HelpArticle: Yardım merkezi (hiyerarşik kategoriler + makaleler)
- Announcement: Platform duyuruları
- Policy: Kullanım koşulları, gizlilik politikası vs.
- DynamicContent: Dinamik içerik blokları (key-value)
- SeoMetadata: Sayfa bazlı SEO ayarları

Advertising modülü reklam kampanyası yönetimini kapsar:
- AdCampaign: Reklam kampanyaları (bütçe, hedefleme, süre, teklif modeli)
- AdSlot: Reklam yerleri (HOMEPAGE_BANNER, SEARCH_SIDEBAR, CATEGORY_TOP vs.)
- AdCampaignProduct: Kampanyaya bağlı ürünler
- AdCampaignMetric: Günlük performans metrikleri (impression, click, CTR, spend)
- AdLocation: Kampanya/banner lokasyon hedeflemesi
- SideAd: Yan reklam alanları

Reklam iş kuralları:
- Vendor bir AdCampaign oluşturur (bütçe belirler)
- Admin onayı ile kampanya aktifleşir (PENDING → ACTIVE)
- Kampanya bütçesi dolunca otomatik duraklar (remainingBudget <= 0 → PAUSED)
- Her impression/click'te remainingBudget azalır
- Günlük metrikler AdCampaignMetric tablosunda tutulur
- Kampanya süresi dolunca otomatik kapanır (endDate ≤ now → EXPIRED)
- Pricing modelleri: CPC (click başına), CPM (1000 impression başına), CPA (aksiyon başına), FIXED

Modül yapıları:

apps/backend/src/modules/content/
├── application/
│   ├── commands/
│   │   ├── create-home-banner.command.ts
│   │   ├── create-home-banner.handler.ts
│   │   ├── update-home-banner.command.ts
│   │   ├── update-home-banner.handler.ts
│   │   ├── delete-home-banner.command.ts
│   │   ├── delete-home-banner.handler.ts
│   │   ├── create-quad-card.command.ts
│   │   ├── create-quad-card.handler.ts
│   │   ├── update-quad-card.command.ts
│   │   ├── update-quad-card.handler.ts
│   │   ├── create-help-category.command.ts
│   │   ├── create-help-category.handler.ts
│   │   ├── update-help-category.command.ts
│   │   ├── update-help-category.handler.ts
│   │   ├── create-help-article.command.ts
│   │   ├── create-help-article.handler.ts
│   │   ├── update-help-article.command.ts
│   │   ├── update-help-article.handler.ts
│   │   ├── publish-help-article.command.ts
│   │   ├── publish-help-article.handler.ts
│   │   ├── create-announcement.command.ts
│   │   ├── create-announcement.handler.ts
│   │   ├── update-announcement.command.ts
│   │   ├── update-announcement.handler.ts
│   │   ├── create-policy.command.ts
│   │   ├── create-policy.handler.ts
│   │   ├── update-policy.command.ts
│   │   ├── update-policy.handler.ts
│   │   ├── create-dynamic-content.command.ts
│   │   ├── create-dynamic-content.handler.ts
│   │   ├── update-dynamic-content.command.ts
│   │   ├── update-dynamic-content.handler.ts
│   │   ├── upsert-seo-metadata.command.ts
│   │   └── upsert-seo-metadata.handler.ts
│   ├── queries/
│   │   ├── get-home-banners.query.ts
│   │   ├── get-home-banners.handler.ts
│   │   ├── get-quad-cards.query.ts
│   │   ├── get-quad-cards.handler.ts
│   │   ├── get-help-categories.query.ts
│   │   ├── get-help-categories.handler.ts
│   │   ├── get-help-article.query.ts
│   │   ├── get-help-article.handler.ts
│   │   ├── search-help-articles.query.ts
│   │   ├── search-help-articles.handler.ts
│   │   ├── get-announcements.query.ts
│   │   ├── get-announcements.handler.ts
│   │   ├── get-policy.query.ts
│   │   ├── get-policy.handler.ts
│   │   ├── get-policies.query.ts
│   │   ├── get-policies.handler.ts
│   │   ├── get-dynamic-content.query.ts
│   │   ├── get-dynamic-content.handler.ts
│   │   ├── get-seo-metadata.query.ts
│   │   └── get-seo-metadata.handler.ts
│   └── dtos/
│       ├── create-home-banner.dto.ts
│       ├── update-home-banner.dto.ts
│       ├── create-quad-card.dto.ts
│       ├── create-help-category.dto.ts
│       ├── create-help-article.dto.ts
│       ├── create-announcement.dto.ts
│       ├── create-policy.dto.ts
│       ├── create-dynamic-content.dto.ts
│       ├── upsert-seo-metadata.dto.ts
│       ├── home-banner-response.dto.ts
│       ├── quad-card-response.dto.ts
│       ├── help-category-response.dto.ts
│       ├── help-article-response.dto.ts
│       ├── announcement-response.dto.ts
│       ├── policy-response.dto.ts
│       ├── dynamic-content-response.dto.ts
│       └── seo-metadata-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── home-banner.entity.ts
│   │   ├── home-quad-card.entity.ts
│   │   ├── home-quad-card-item.entity.ts
│   │   ├── help-category.entity.ts
│   │   ├── help-article.entity.ts
│   │   ├── announcement.entity.ts
│   │   ├── policy.entity.ts
│   │   ├── dynamic-content.entity.ts
│   │   └── seo-metadata.entity.ts
│   ├── value-objects/
│   │   └── slug.vo.ts
│   ├── repositories/
│   │   ├── home-banner.repository.interface.ts
│   │   ├── home-quad-card.repository.interface.ts
│   │   ├── help-category.repository.interface.ts
│   │   ├── help-article.repository.interface.ts
│   │   ├── announcement.repository.interface.ts
│   │   ├── policy.repository.interface.ts
│   │   ├── dynamic-content.repository.interface.ts
│   │   └── seo-metadata.repository.interface.ts
│   └── enums/
│       └── article-status.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-home-banner.repository.ts
│   │   ├── prisma-home-quad-card.repository.ts
│   │   ├── prisma-help-category.repository.ts
│   │   ├── prisma-help-article.repository.ts
│   │   ├── prisma-announcement.repository.ts
│   │   ├── prisma-policy.repository.ts
│   │   ├── prisma-dynamic-content.repository.ts
│   │   ├── prisma-seo-metadata.repository.ts
│   │   └── mappers/
│   │       ├── home-banner.mapper.ts
│   │       ├── home-quad-card.mapper.ts
│   │       ├── help-category.mapper.ts
│   │       ├── help-article.mapper.ts
│   │       ├── announcement.mapper.ts
│   │       ├── policy.mapper.ts
│   │       ├── dynamic-content.mapper.ts
│   │       └── seo-metadata.mapper.ts
│   └── event-publishers/
│       └── content-event.publisher.ts
├── presentation/
│   ├── home-banner.controller.ts
│   ├── quad-card.controller.ts
│   ├── help.controller.ts
│   ├── announcement.controller.ts
│   ├── policy.controller.ts
│   ├── dynamic-content.controller.ts
│   ├── seo.controller.ts
│   └── content-admin.controller.ts
└── content.module.ts

apps/backend/src/modules/advertising/
├── application/
│   ├── commands/
│   │   ├── create-ad-campaign.command.ts
│   │   ├── create-ad-campaign.handler.ts
│   │   ├── update-ad-campaign.command.ts
│   │   ├── update-ad-campaign.handler.ts
│   │   ├── approve-ad-campaign.command.ts
│   │   ├── approve-ad-campaign.handler.ts
│   │   ├── reject-ad-campaign.command.ts
│   │   ├── reject-ad-campaign.handler.ts
│   │   ├── pause-ad-campaign.command.ts
│   │   ├── pause-ad-campaign.handler.ts
│   │   ├── resume-ad-campaign.command.ts
│   │   ├── resume-ad-campaign.handler.ts
│   │   ├── record-impression.command.ts
│   │   ├── record-impression.handler.ts
│   │   ├── record-click.command.ts
│   │   ├── record-click.handler.ts
│   │   ├── create-ad-slot.command.ts
│   │   ├── create-ad-slot.handler.ts
│   │   ├── create-side-ad.command.ts
│   │   ├── create-side-ad.handler.ts
│   │   ├── update-side-ad.command.ts
│   │   └── update-side-ad.handler.ts
│   ├── queries/
│   │   ├── get-ad-campaign.query.ts
│   │   ├── get-ad-campaign.handler.ts
│   │   ├── list-ad-campaigns.query.ts
│   │   ├── list-ad-campaigns.handler.ts
│   │   ├── get-vendor-campaigns.query.ts
│   │   ├── get-vendor-campaigns.handler.ts
│   │   ├── get-campaign-metrics.query.ts
│   │   ├── get-campaign-metrics.handler.ts
│   │   ├── get-ads-for-slot.query.ts
│   │   ├── get-ads-for-slot.handler.ts
│   │   ├── get-side-ads.query.ts
│   │   ├── get-side-ads.handler.ts
│   │   ├── get-ad-slots.query.ts
│   │   └── get-ad-slots.handler.ts
│   ├── services/
│   │   ├── ad-auction.service.ts
│   │   └── budget-manager.service.ts
│   └── dtos/
│       ├── create-ad-campaign.dto.ts
│       ├── update-ad-campaign.dto.ts
│       ├── create-ad-slot.dto.ts
│       ├── create-side-ad.dto.ts
│       ├── ad-campaign-response.dto.ts
│       ├── ad-campaign-detail-response.dto.ts
│       ├── campaign-metrics-response.dto.ts
│       ├── ad-slot-response.dto.ts
│       └── side-ad-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── ad-campaign.entity.ts
│   │   ├── ad-slot.entity.ts
│   │   ├── ad-slot-to-campaign.entity.ts
│   │   ├── ad-campaign-product.entity.ts
│   │   ├── ad-campaign-metric.entity.ts
│   │   ├── ad-location.entity.ts
│   │   └── side-ad.entity.ts
│   ├── value-objects/
│   │   ├── ad-budget.vo.ts
│   │   └── bid-amount.vo.ts
│   ├── events/
│   │   ├── campaign-created.event.ts
│   │   ├── campaign-approved.event.ts
│   │   ├── campaign-exhausted.event.ts
│   │   └── impression-recorded.event.ts
│   ├── repositories/
│   │   ├── ad-campaign.repository.interface.ts
│   │   ├── ad-slot.repository.interface.ts
│   │   ├── ad-campaign-metric.repository.interface.ts
│   │   ├── ad-location.repository.interface.ts
│   │   └── side-ad.repository.interface.ts
│   └── enums/
│       ├── ad-type.enum.ts
│       ├── ad-slot-type.enum.ts
│       ├── billing-model.enum.ts
│       ├── pricing-model.enum.ts
│       └── target-role.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-ad-campaign.repository.ts
│   │   ├── prisma-ad-slot.repository.ts
│   │   ├── prisma-ad-campaign-metric.repository.ts
│   │   ├── prisma-ad-location.repository.ts
│   │   ├── prisma-side-ad.repository.ts
│   │   └── mappers/
│   │       ├── ad-campaign.mapper.ts
│   │       ├── ad-slot.mapper.ts
│   │       ├── ad-campaign-metric.mapper.ts
│   │       ├── ad-location.mapper.ts
│   │       └── side-ad.mapper.ts
│   └── event-publishers/
│       └── advertising-event.publisher.ts
├── presentation/
│   ├── ad-campaign.controller.ts
│   ├── ad-campaign-vendor.controller.ts
│   ├── ad-slot.controller.ts
│   ├── side-ad.controller.ts
│   └── advertising-admin.controller.ts
└── advertising.module.ts
```

### PRİSMA ŞEMASI

Backend Prisma şemasına ekle (mevcut tablolara DOKUNMA):

```prisma
// === CONTENT ENUMS ===

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// === ADVERTISING ENUMS ===

enum AdType {
  BANNER
  SPONSORED_PRODUCT
  SEARCH_AD
  SIDE_AD
  VIDEO
  REWARD_DISTRIBUTION
}

enum AdSlotType {
  HOMEPAGE_BANNER
  HOMEPAGE_SIDEBAR
  SEARCH_TOP
  SEARCH_SIDEBAR
  CATEGORY_TOP
  CATEGORY_SIDEBAR
  PRODUCT_DETAIL
  CART_SIDEBAR
  CHECKOUT_BANNER
}

enum BillingModel {
  PREPAID
  POSTPAID
}

enum PricingModel {
  CPC
  CPM
  CPA
  FIXED
}

enum TargetRole {
  ALL
  CUSTOMER
  VENDOR
  B2B
}

// === CONTENT TABLES ===

model HomeBanner {
  id          String       @id @default(cuid())
  title       String
  description String?
  order       Int          @default(0)
  buttonText  String?      @map("button_text")
  createdAt   DateTime     @default(now()) @map("created_at")
  image       String
  isActive    Boolean      @default(true) @map("is_active")
  link        String?
  platform    Platform     @default(BAZARX)
  subtitle    String?
  tag         String?
  startDate   DateTime?    @map("start_date")
  endDate     DateTime?    @map("end_date")
  updatedAt   DateTime     @updatedAt @map("updated_at")
  locations   AdLocation[] @relation("HomeBannerLocations")

  @@index([platform, order])
  @@map("home_banners")
}

model HomeQuadCard {
  id        String             @id @default(cuid())
  title     String
  order     Int                @default(0)
  createdAt DateTime           @default(now()) @map("created_at")
  isActive  Boolean            @default(true) @map("is_active")
  platform  Platform           @default(BAZARX)
  updatedAt DateTime           @updatedAt @map("updated_at")
  items     HomeQuadCardItem[]

  @@index([platform, order])
  @@map("home_quad_cards")
}

model HomeQuadCardItem {
  id         String       @id @default(cuid())
  order      Int          @default(0)
  image      String
  link       String?
  productId  String?      @map("product_id")
  quadCardId String       @map("quad_card_id")
  title      String
  quadCard   HomeQuadCard @relation(fields: [quadCardId], references: [id], onDelete: Cascade)

  @@index([quadCardId, order])
  @@map("home_quad_card_items")
}

model HelpCategory {
  id          String         @id @default(cuid())
  name        String
  slug        String         @unique
  description String?
  icon        String?
  order       Int            @default(0)
  language    String         @default("tr")
  createdAt   DateTime       @default(now()) @map("created_at")
  isActive    Boolean        @default(true) @map("is_active")
  parentId    String?        @map("parent_id")
  platform    Platform       @default(BAZARX)
  updatedAt   DateTime       @updatedAt @map("updated_at")
  articles    HelpArticle[]
  parent      HelpCategory?  @relation("HelpCategoryHierarchy", fields: [parentId], references: [id])
  children    HelpCategory[] @relation("HelpCategoryHierarchy")

  @@index([platform, order])
  @@map("help_categories")
}

model HelpArticle {
  id           String        @id @default(cuid())
  title        String
  slug         String        @unique
  content      String
  excerpt      String?
  status       ArticleStatus @default(DRAFT)
  upvotes      Int           @default(0)
  downvotes    Int           @default(0)
  order        Int           @default(0)
  language     String        @default("tr")
  category     String?
  categoryId   String?       @map("category_id")
  createdAt    DateTime      @default(now()) @map("created_at")
  isActive     Boolean       @default(true) @map("is_active")
  isPopular    Boolean       @default(false) @map("is_popular")
  platform     Platform      @default(BAZARX)
  updatedAt    DateTime      @updatedAt @map("updated_at")
  viewCount    Int           @default(0) @map("view_count")
  helpCategory HelpCategory? @relation(fields: [categoryId], references: [id])

  @@index([platform, categoryId, status])
  @@map("help_articles")
}

model Announcement {
  id         String    @id @default(cuid())
  title      String
  content    String
  type       String    @default("info")
  priority   Int       @default(0)
  createdAt  DateTime  @default(now()) @map("created_at")
  endDate    DateTime? @map("end_date")
  imageUrl   String?   @map("image_url")
  isActive   Boolean   @default(true) @map("is_active")
  linkText   String?   @map("link_text")
  linkUrl    String?   @map("link_url")
  startDate  DateTime  @default(now()) @map("start_date")
  targetPage String?   @map("target_page")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@map("announcements")
}

model Policy {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String
  type      String
  version   String   @default("1.0")
  createdAt DateTime @default(now()) @map("created_at")
  isActive  Boolean  @default(true) @map("is_active")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("policies")
}

model DynamicContent {
  id          String   @id @default(cuid())
  key         String   @unique
  title       String
  content     String
  category    String?
  contentType String   @default("text") @map("content_type")
  createdAt   DateTime @default(now()) @map("created_at")
  isActive    Boolean  @default(true) @map("is_active")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("dynamic_contents")
}

model SeoMetadata {
  id          String   @id @default(cuid())
  path        String   @unique
  title       String?
  description String?
  keywords    String[]
  ogImage     String?  @map("og_image")
  platform    Platform @default(BAZARX)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([platform, path])
  @@map("seo_metadata")
}

// === ADVERTISING TABLES ===

model AdCampaign {
  id                     String               @id @default(uuid())
  name                   String
  platform               Platform             @default(BAZARX)
  budget                 Decimal              @db.Decimal(18, 2)
  adStatus               AdStatus             @default(PENDING) @map("ad_status")
  adType                 AdType               @map("ad_type")
  bidAmount              Decimal              @map("bid_amount") @db.Decimal(18, 2)
  billingModel           BillingModel         @default(PREPAID) @map("billing_model")
  createdAt              DateTime             @default(now()) @map("created_at")
  creatorId              String?              @map("creator_id")
  endDate                DateTime             @map("end_date")
  imageUrl               String?              @map("image_url")
  linkUrl                String?              @map("link_url")
  metadata               Json?
  pricingModel           PricingModel         @map("pricing_model")
  remainingBudget        Decimal              @map("remaining_budget") @db.Decimal(18, 2)
  startDate              DateTime             @map("start_date")
  targetCategories       String[]             @map("target_categories")
  targetKeywords         String[]             @map("target_keywords")
  targetRole             TargetRole           @default(ALL) @map("target_role")
  updatedAt              DateTime             @updatedAt @map("updated_at")
  vendorId               String?              @map("vendor_id")
  rejectionReason        String?              @map("rejection_reason")
  targetCities           String[]             @default([]) @map("target_cities")
  targetDistricts        String[]             @default([]) @map("target_districts")
  targetSlots            String[]             @default([]) @map("target_slots")
  targetUrl              String?              @map("target_url")
  qualityScore           Decimal?             @default(1.0) @map("quality_score") @db.Decimal(5, 2)
  historicCTR            Decimal?             @default(0.01) @map("historic_ctr") @db.Decimal(8, 6)
  maxBidPerClick         Decimal?             @default(0.5) @map("max_bid_per_click") @db.Decimal(18, 2)
  maxBidPerMille         Decimal?             @default(5.0) @map("max_bid_per_mille") @db.Decimal(18, 2)
  mediaUrl               String?              @map("media_url")
  negativeKeywords       String[]             @default([]) @map("negative_keywords")
  metrics                AdCampaignMetric[]
  products               AdCampaignProduct[]
  vendor                 Vendor?              @relation(fields: [vendorId], references: [id])
  locations              AdLocation[]         @relation("AdCampaignLocations")
  adSlots                AdSlotToAdCampaign[]

  @@index([adStatus])
  @@index([adType])
  @@index([platform])
  @@map("ad_campaigns")
}

model AdSlot {
  id          String               @id @default(uuid())
  slotType    AdSlotType           @map("slot_type")
  platform    Platform             @default(BAZARX)
  description String?
  isActive    Boolean              @default(true) @map("is_active")
  createdAt   DateTime             @default(now()) @map("created_at")
  adCampaigns AdSlotToAdCampaign[]

  @@unique([slotType, platform])
  @@map("ad_slots")
}

model AdSlotToAdCampaign {
  adSlotId     String     @map("ad_slot_id")
  adCampaignId String     @map("ad_campaign_id")
  adCampaign   AdCampaign @relation(fields: [adCampaignId], references: [id], onDelete: Cascade)
  adSlot       AdSlot     @relation(fields: [adSlotId], references: [id], onDelete: Cascade)

  @@id([adSlotId, adCampaignId])
  @@map("ad_slot_to_campaign")
}

model AdCampaignProduct {
  id           String     @id @default(uuid())
  adCampaignId String     @map("ad_campaign_id")
  listingId    String     @map("listing_id")
  adCampaign   AdCampaign @relation(fields: [adCampaignId], references: [id], onDelete: Cascade)
  listing      Listing    @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([adCampaignId, listingId])
  @@map("ad_campaign_products")
}

model AdCampaignMetric {
  id           String     @id @default(cuid())
  adCampaignId String     @map("ad_campaign_id")
  date         DateTime   @default(now())
  impressions  Int        @default(0)
  clicks       Int        @default(0)
  ctr          Decimal    @default(0) @db.Decimal(8, 6)
  spend        Decimal    @default(0) @db.Decimal(18, 2)
  sales        Int        @default(0)
  adCampaign   AdCampaign @relation(fields: [adCampaignId], references: [id], onDelete: Cascade)

  @@unique([adCampaignId, date], name: "adCampaignId_date")
  @@index([date])
  @@map("ad_campaign_metrics")
}

model AdLocation {
  id           String      @id @default(cuid())
  tag          String
  adCampaignId String?     @map("ad_campaign_id")
  createdAt    DateTime    @default(now()) @map("created_at")
  homeBannerId String?     @map("home_banner_id")
  sideAdId     String?     @map("side_ad_id")
  updatedAt    DateTime    @updatedAt @map("updated_at")
  adCampaign   AdCampaign? @relation("AdCampaignLocations", fields: [adCampaignId], references: [id], onDelete: Cascade)
  homeBanner   HomeBanner? @relation("HomeBannerLocations", fields: [homeBannerId], references: [id], onDelete: Cascade)
  sideAd       SideAd?     @relation("SideAdLocations", fields: [sideAdId], references: [id], onDelete: Cascade)

  @@unique([homeBannerId, tag])
  @@unique([sideAdId, tag])
  @@unique([adCampaignId, tag])
  @@index([tag])
  @@map("ad_locations")
}

model SideAd {
  id         String       @id @default(cuid())
  side       String
  title      String
  subtitle   String?
  image      String?
  emoji      String?
  link       String?
  order      Int          @default(0)
  ecosystems String[]     @default(["GLOBAL"])
  category   String?
  createdAt  DateTime     @default(now()) @map("created_at")
  isActive   Boolean      @default(true) @map("is_active")
  updatedAt  DateTime     @updatedAt @map("updated_at")
  locations  AdLocation[] @relation("SideAdLocations")

  @@index([isActive, order, side])
  @@map("side_ads")
}
```

NOT: Listing modeline (Faz 4B'de tanımlı) şu relation'ı EKLE:
```prisma
adCampaigns       AdCampaignProduct[]
```

Vendor modeline (Faz 4A'da tanımlı) şu relation'ı EKLE:
```prisma
adCampaigns       AdCampaign[]
```

### DOSYA LİSTESİ

Yukarıdaki klasör yapısındaki HER DOSYANIN tam içeriğini yaz.

Özellikle dikkat edilecek domain entity'ler:

CONTENT:
- HomeBanner: static create(), activate/deactivate, isVisible (startDate/endDate kontrolü)
- HelpCategory: hiyerarşik (parent-child), slug üret
- HelpArticle: static create(), publish (DRAFT → PUBLISHED), archive, incrementViewCount, vote(up/down)
- Announcement: isVisible (startDate/endDate + isActive kontrolü)
- Policy: versiyonlama (version field), slug unique
- DynamicContent: key-value, contentType (text, html, json, markdown)
- SeoMetadata: path bazlı upsert

ADVERTISING:
- AdCampaign extends AggregateRoot:
  - static create(): status PENDING + CampaignCreatedEvent
  - approve(): PENDING → ACTIVE + CampaignApprovedEvent
  - reject(reason): PENDING → REJECTED
  - pause(): ACTIVE → PAUSED
  - resume(): PAUSED → ACTIVE
  - exhaust(): remainingBudget <= 0 → PAUSED + CampaignExhaustedEvent
  - expire(): endDate ≤ now → EXPIRED
  - recordImpression(cost): impressions++, remainingBudget -= cost, günlük metrik güncelle
  - recordClick(cost): clicks++, remainingBudget -= cost, günlük metrik güncelle
  - hasBudget(): remainingBudget > 0
  - isRunning(): status === ACTIVE && hasBudget() && startDate ≤ now ≤ endDate

APPLICATION SERVICES:
- ad-auction.service.ts:
  - getAdsForSlot(slotType, context): belirli slot için en uygun reklamları seç
    1. ACTIVE ve bütçesi olan kampanyaları filtrele
    2. Slot type'a göre filtrele
    3. Hedefleme kontrolü (category, keyword, city, role)
    4. Ad rank hesapla: bidAmount × qualityScore
    5. En yüksek rank'lı reklamları döndür

- budget-manager.service.ts:
  - deductBudget(campaignId, amount): remainingBudget -= amount
  - checkBudgetExhaustion(campaignId): bütçe bitti mi → exhaust()
  - Tüm işlemler Prisma transaction içinde (race condition'a karşı)

CONTROLLERS:

Content:
- home-banner.controller: GET /banners → @Public(), aktif banner'lar (platform filtre)
- quad-card.controller: GET /quad-cards → @Public()
- help.controller:
  - GET /help/categories → @Public(), hiyerarşik
  - GET /help/articles/:slug → @Public(), makale detayı + viewCount++
  - GET /help/search?q= → @Public(), makale arama
- announcement.controller: GET /announcements → @Public(), aktif duyurular
- policy.controller:
  - GET /policies → @Public(), aktif politikalar
  - GET /policies/:slug → @Public()
- dynamic-content.controller: GET /content/:key → @Public()
- seo.controller: GET /seo?path= → @Public()
- content-admin.controller: @Roles('ADMIN'), tüm CRUD işlemleri

Advertising:
- ad-campaign.controller: GET /ads/slot/:slotType → @Public(), slot için reklamlar
- ad-campaign-vendor.controller:
  - GET /vendors/me/campaigns → authenticated vendor
  - POST /vendors/me/campaigns → authenticated vendor, kampanya oluştur
  - GET /vendors/me/campaigns/:id/metrics → authenticated vendor, metrikler
- ad-slot.controller: GET /ads/slots → @Public(), mevcut slotlar
- side-ad.controller: GET /ads/side → @Public(), yan reklamlar
- advertising-admin.controller:
  - @Roles('ADMIN')
  - GET /admin/campaigns → tüm kampanyalar
  - POST /admin/campaigns/:id/approve → onayla
  - POST /admin/campaigns/:id/reject → reddet
  - POST /admin/campaigns/:id/pause → duraklat
  - POST /admin/ads/impression → impression kaydet
  - POST /admin/ads/click → click kaydet
  - GET /admin/ads/slots → slot yönetimi
  - POST /admin/ads/slots → yeni slot oluştur

MODULE REGISTRATION:
- content.module.ts
- advertising.module.ts
- app-components.ts: SUPPORT grubuna ContentModule ve AdvertisingModule ekle

### KONTROL

1. `any` tipi SIFIR mı?
2. IEventBus KULLANILMAMIŞ mı?
3. HomeBanner startDate/endDate visibility kontrolü var mı?
4. HelpArticle viewCount artırma var mı?
5. HelpCategory hiyerarşik (parent-child) dönüyor mu?
6. AdCampaign bütçe kontrolü: remainingBudget ≤ 0 → PAUSED?
7. Ad auction: bidAmount × qualityScore rank hesabı var mı?
8. Budget deduction Prisma transaction içinde mi (race condition)?
9. Record impression/click günlük metrik tablosunu güncelliyor mu?
10. Content endpoint'leri @Public() mı (SEO için)?
11. Vendor kendi kampanyasını görebiliyor ama başkasınkini göremiyor mu?
12. Decimal kullanımı — float sızmamış mı?
13. TypeScript strict mode derlenir mi?

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

Parçalı verme planı:

- Birinci mesaj: System prompt + Prisma + Content Domain + Application
- İkinci mesaj: Content Infrastructure + Presentation + Module
- Üçüncü mesaj: Advertising Domain + Application (entities + services + commands + queries)
- Dördüncü mesaj: Advertising Infrastructure + Presentation + Module Registration

Her parçada system prompt'u TEKRAR VER.

Sonraki prompt: Faz 7C (Loyalty/XP + Analytics)
