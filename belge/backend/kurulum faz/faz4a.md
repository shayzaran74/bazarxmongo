# Gemini Prompt — FAZ 4A: Vendor Modülü

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
  - OutboxModule, OutboxPublisherService

@barterborsa/shared-messaging:
  - RabbitMQModule, RabbitMQService, IntegrationEvent, IEventBus

@barterborsa/shared-security:
  - AuthGuard, RolesGuard

@barterborsa/shared-nest:
  - @CurrentUser(), @Roles(), @Public()
  - ResponseTransformInterceptor, GlobalExceptionFilter
  - ValidationPipe, ParsePaginationPipe

@barterborsa/shared-observability:
  - LoggerModule, StructuredLogger

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. Kendi mimari önerini ekleme
4. TypeScript strict mode
5. Import'larda @barterborsa/* workspace alias kullan
6. Kod yorumlarını Türkçe yaz
7. Her dosya ÇALIŞIR, DERLENEBILIR, eksiksiz olacak
8. Entity'ler shared-core'daki AggregateRoot/Entity/ValueObject'ten türeyecek
9. Repository'ler shared-persistence'taki BasePrismaRepository'den türeyecek
10. Controller'larda @Public() veya @Roles() decorator kullan
11. User tablosuna relation EKLEME — sadece userId string referansı kullan
12. Financial tablolara relation EKLEME — financial ayrı serviste, sadece event ile iletişim
```

### GÖREV

```
FAZ 4A: Vendor modülünü yaz.

Bu modül satıcı (vendor) kayıt, onay, profil yönetimi, B2B, banka hesapları, 
ecosystem ve abonelik yönetimini kapsar.

Önemli iş kuralları:
- Vendor olmak için önce bir Company oluşturulmalı (vergi no zorunlu)
- Company oluşturulduktan sonra Vendor başvurusu yapılır (status: PENDING)
- Admin onayı ile vendor aktifleşir (status: APPROVED)
- Her vendor'ın bir tier'ı var (CORE, PLUS, PREMIUM, ELITE) — komisyon oranlarını belirler
- Vendor vacation mode'a alınabilir (tüm listing'ler gizlenir)
- BrandEcosystem: bir vendor kendi ekosistemini oluşturup diğer vendor'ları davet edebilir

Modül yapısı:

apps/backend/src/modules/vendor/
├── application/
│   ├── commands/
│   │   ├── create-company.command.ts
│   │   ├── create-company.handler.ts
│   │   ├── register-vendor.command.ts
│   │   ├── register-vendor.handler.ts
│   │   ├── approve-vendor.command.ts
│   │   ├── approve-vendor.handler.ts
│   │   ├── reject-vendor.command.ts
│   │   ├── reject-vendor.handler.ts
│   │   ├── suspend-vendor.command.ts
│   │   ├── suspend-vendor.handler.ts
│   │   ├── update-vendor-profile.command.ts
│   │   ├── update-vendor-profile.handler.ts
│   │   ├── update-vendor-settings.command.ts
│   │   ├── update-vendor-settings.handler.ts
│   │   ├── update-vendor-b2b.command.ts
│   │   ├── update-vendor-b2b.handler.ts
│   │   ├── add-bank-account.command.ts
│   │   ├── add-bank-account.handler.ts
│   │   ├── remove-bank-account.command.ts
│   │   ├── remove-bank-account.handler.ts
│   │   ├── toggle-vacation-mode.command.ts
│   │   ├── toggle-vacation-mode.handler.ts
│   │   ├── create-ecosystem.command.ts
│   │   ├── create-ecosystem.handler.ts
│   │   ├── invite-to-ecosystem.command.ts
│   │   ├── invite-to-ecosystem.handler.ts
│   │   ├── follow-vendor.command.ts
│   │   ├── follow-vendor.handler.ts
│   │   ├── unfollow-vendor.command.ts
│   │   ├── unfollow-vendor.handler.ts
│   │   ├── create-vendor-banner.command.ts
│   │   ├── create-vendor-banner.handler.ts
│   │   ├── create-subscription.command.ts
│   │   └── create-subscription.handler.ts
│   ├── queries/
│   │   ├── get-vendor.query.ts
│   │   ├── get-vendor.handler.ts
│   │   ├── get-vendor-by-slug.query.ts
│   │   ├── get-vendor-by-slug.handler.ts
│   │   ├── list-vendors.query.ts
│   │   ├── list-vendors.handler.ts
│   │   ├── get-vendor-profile.query.ts
│   │   ├── get-vendor-profile.handler.ts
│   │   ├── get-vendor-settings.query.ts
│   │   ├── get-vendor-settings.handler.ts
│   │   ├── get-vendor-stats.query.ts
│   │   ├── get-vendor-stats.handler.ts
│   │   ├── get-vendor-metrics.query.ts
│   │   ├── get-vendor-metrics.handler.ts
│   │   ├── get-vendor-bank-accounts.query.ts
│   │   ├── get-vendor-bank-accounts.handler.ts
│   │   ├── get-vendor-followers.query.ts
│   │   ├── get-vendor-followers.handler.ts
│   │   ├── get-ecosystem.query.ts
│   │   ├── get-ecosystem.handler.ts
│   │   ├── get-company.query.ts
│   │   └── get-company.handler.ts
│   ├── event-handlers/
│   │   ├── vendor-approved.handler.ts
│   │   └── vendor-suspended.handler.ts
│   └── dtos/
│       ├── create-company.dto.ts
│       ├── register-vendor.dto.ts
│       ├── update-vendor-profile.dto.ts
│       ├── update-vendor-settings.dto.ts
│       ├── update-vendor-b2b.dto.ts
│       ├── add-bank-account.dto.ts
│       ├── create-ecosystem.dto.ts
│       ├── create-banner.dto.ts
│       ├── create-subscription.dto.ts
│       ├── vendor-response.dto.ts
│       ├── vendor-profile-response.dto.ts
│       ├── vendor-stats-response.dto.ts
│       ├── company-response.dto.ts
│       └── ecosystem-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── company.entity.ts
│   │   ├── vendor.entity.ts
│   │   ├── vendor-profile.entity.ts
│   │   ├── vendor-settings.entity.ts
│   │   ├── vendor-b2b-data.entity.ts
│   │   ├── vendor-bank-account.entity.ts
│   │   ├── vendor-metrics.entity.ts
│   │   ├── vendor-stats.entity.ts
│   │   ├── vendor-financials.entity.ts
│   │   ├── vendor-banner.entity.ts
│   │   ├── vendor-follower.entity.ts
│   │   ├── brand-ecosystem.entity.ts
│   │   ├── subscription.entity.ts
│   │   └── company-user.entity.ts
│   ├── value-objects/
│   │   ├── tax-number.vo.ts
│   │   ├── vendor-tier.vo.ts
│   │   ├── vendor-slug.vo.ts
│   │   └── iban.vo.ts
│   ├── events/
│   │   ├── vendor-registered.event.ts
│   │   ├── vendor-approved.event.ts
│   │   ├── vendor-rejected.event.ts
│   │   ├── vendor-suspended.event.ts
│   │   └── ecosystem-created.event.ts
│   ├── repositories/
│   │   ├── company.repository.interface.ts
│   │   ├── vendor.repository.interface.ts
│   │   ├── vendor-profile.repository.interface.ts
│   │   ├── vendor-settings.repository.interface.ts
│   │   ├── vendor-bank-account.repository.interface.ts
│   │   ├── vendor-follower.repository.interface.ts
│   │   ├── brand-ecosystem.repository.interface.ts
│   │   └── subscription.repository.interface.ts
│   └── enums/
│       ├── vendor-status.enum.ts
│       ├── vendor-tier.enum.ts
│       ├── b2b-tier.enum.ts
│       └── ad-status.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-company.repository.ts
│   │   ├── prisma-vendor.repository.ts
│   │   ├── prisma-vendor-profile.repository.ts
│   │   ├── prisma-vendor-settings.repository.ts
│   │   ├── prisma-vendor-bank-account.repository.ts
│   │   ├── prisma-vendor-follower.repository.ts
│   │   ├── prisma-brand-ecosystem.repository.ts
│   │   ├── prisma-subscription.repository.ts
│   │   └── mappers/
│   │       ├── company.mapper.ts
│   │       ├── vendor.mapper.ts
│   │       ├── vendor-profile.mapper.ts
│   │       ├── vendor-settings.mapper.ts
│   │       ├── vendor-bank-account.mapper.ts
│   │       ├── vendor-follower.mapper.ts
│   │       ├── brand-ecosystem.mapper.ts
│   │       └── subscription.mapper.ts
│   └── event-publishers/
│       └── vendor-event.publisher.ts
├── presentation/
│   ├── company.controller.ts
│   ├── vendor.controller.ts
│   ├── vendor-profile.controller.ts
│   ├── vendor-settings.controller.ts
│   ├── vendor-bank-account.controller.ts
│   ├── vendor-follower.controller.ts
│   ├── ecosystem.controller.ts
│   └── vendor-admin.controller.ts
└── vendor.module.ts
```

### MEVCUT PRİSMA ŞEMASI — REFERANS

Aşağıdaki tabloları backend'in ortak Prisma şemasına (apps/backend/prisma/schema.prisma) ekle.
User relation'larını KALDIR — sadece userId string referansı kullan.

```prisma
// === VENDOR ENUMS ===

enum VendorStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum VendorTier {
  CORE
  PLUS
  PREMIUM
  ELITE
}

enum B2BTier {
  NONE
  STARTER
  GROWTH
  ENTERPRISE
}

enum AdStatus {
  PENDING
  ACTIVE
  PAUSED
  REJECTED
  EXPIRED
}

enum PilotCity {
  ISTANBUL
  ANKARA
  IZMIR
  HATAY
}

// === COMPANY ===

model Company {
  id                  String        @id @default(cuid())
  taxNumber           String        @unique @map("tax_number")
  name                String
  address             String?
  phone               String?
  email               String?
  website             String?
  logo                String?
  registrationNumber  String?       @map("registration_number")
  taxOffice           String?       @map("tax_office")
  representativeName  String?       @map("representative_name")
  representativePhone String?       @map("representative_phone")
  vatRate             Decimal       @default(20) @map("vat_rate") @db.Decimal(5, 2)
  status              String        @default("PENDING")
  verifiedAt          DateTime?     @map("verified_at")
  companyType         String?       @map("company_type")
  tradeRegistryNumber String?       @map("trade_registry_number")
  mersisNumber        String?       @map("mersis_number")
  kepAddress          String?       @map("kep_address")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")
  deletedAt           DateTime?     @map("deleted_at")
  companyUsers        CompanyUser[]
  subscription        Subscription?
  vendor              Vendor?

  @@index([taxNumber])
  @@map("companies")
}

model CompanyUser {
  id        String  @id @default(cuid())
  userId    String  @map("user_id")
  companyId String  @map("company_id")
  role      String
  company   Company @relation(fields: [companyId], references: [id])

  @@unique([userId, companyId])
  @@map("company_users")
}

// === VENDOR ===

model Vendor {
  id               String          @id @default(cuid())
  status           VendorStatus    @default(PENDING)
  companyId        String          @unique @map("company_id")
  createdAt        DateTime        @default(now()) @map("created_at")
  ecosystemId      String?         @map("ecosystem_id")
  isVerified       Boolean         @default(false) @map("is_verified")
  lastAuditAt      DateTime?       @map("last_audit_at")
  membershipTierId String?         @map("membership_tier_id")
  rejectionReason  String?         @map("rejection_reason")
  slug             String          @unique
  suspensionReason String?         @map("suspension_reason")
  tier             VendorTier      @default(CORE)
  updatedAt        DateTime        @updatedAt @map("updated_at")
  userId           String          @unique @map("user_id")
  verifiedAt       DateTime?       @map("verified_at")
  // Vendor modülü içi relation'lar
  bankAccounts     VendorBankAccount[]
  banners          VendorBanner[]
  company          Company         @relation(fields: [companyId], references: [id])
  b2bData          VendorB2BData?
  financials       VendorFinancials?
  followers        VendorFollower[]
  metrics          VendorMetrics?
  profile          VendorProfile?
  settings         VendorSettings?
  stats            VendorStats?
  // Ecosystem relation'ları
  brandEcosystem   BrandEcosystem? @relation("EcosystemOwner")
  memberOfEcosystem BrandEcosystem? @relation("EcosystemMembers", fields: [ecosystemId], references: [id])

  @@index([status])
  @@index([tier])
  @@map("vendors")
}

model VendorProfile {
  id            String     @id @default(cuid())
  vendorId      String     @unique @map("vendor_id")
  storeName     String     @map("store_name")
  description   String?
  logo          String?
  banner        String?
  supportEmail  String?    @map("support_email")
  isFeatured    Boolean    @default(false) @map("is_featured")
  featuredUntil DateTime?  @map("featured_until")
  city          PilotCity? @map("city")
  district      String?    @map("district")
  vendor        Vendor     @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([city])
  @@map("vendor_profiles")
}

model VendorSettings {
  id                    String    @id @default(cuid())
  vendorId              String    @unique @map("vendor_id")
  listingLimit          Int       @default(100) @map("listing_limit")
  commissionRate        Decimal   @default(10) @map("commission_rate") @db.Decimal(5, 2)
  deliveryTimeDays      Int       @default(3) @map("delivery_time_days")
  minOrderAmount        Decimal   @default(0) @map("min_order_amount") @db.Decimal(10, 2)
  returnPolicy          String?   @map("return_policy")
  shippingPolicy        String?   @map("shipping_policy")
  preferredCurrency     String    @default("TRY") @map("preferred_currency")
  vatIncluded           Boolean   @default(true) @map("vat_included")
  vacationMode          Boolean   @default(false) @map("vacation_mode")
  vacationEndAt         DateTime? @map("vacation_end_at")
  autoFulfill           Boolean   @default(false) @map("auto_fulfill")
  commissionAdjustments Json?     @map("commission_adjustments")
  vendor                Vendor    @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("vendor_settings")
}

model VendorB2BData {
  id                  String   @id @default(cuid())
  vendorId            String   @unique @map("vendor_id")
  isB2B               Boolean  @default(false) @map("is_b2b")
  b2bTier             B2BTier  @default(NONE) @map("b2b_tier")
  wholesaleEnabled    Boolean  @default(false) @map("wholesale_enabled")
  isBrandOwner        Boolean  @default(false) @map("is_brand_owner")
  authorizedBrands    String[] @default([]) @map("authorized_brands")
  corporateCode       String?  @unique @map("corporate_code")
  barterLimitOverride Decimal? @map("barter_limit_override") @db.Decimal(18, 2)
  b2bWalletLimit      Decimal? @map("b2b_wallet_limit") @db.Decimal(18, 2)
  b2bCommRate         Decimal? @map("b2b_comm_rate") @db.Decimal(5, 2)
  vendor              Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("vendor_b2b_data")
}

model VendorMetrics {
  id                  String   @id @default(cuid())
  vendorId            String   @unique @map("vendor_id")
  totalRevenue        Decimal  @default(0) @map("total_revenue") @db.Decimal(18, 2)
  monthlyOrderCount   Int      @default(0) @map("monthly_order_count")
  returnRate          Decimal  @default(0) @map("return_rate") @db.Decimal(5, 2)
  avgResponseTimeMins Decimal  @default(0) @map("avg_response_time_mins") @db.Decimal(10, 2)
  adBudgetSpent       Decimal  @default(0) @map("ad_budget_spent") @db.Decimal(18, 2)
  lastCalculatedAt    DateTime @default(now()) @map("last_calculated_at")
  vendor              Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("vendor_metrics")
}

model VendorFinancials {
  id                String  @id @default(cuid())
  vendorId          String  @unique @map("vendor_id")
  taxOffice         String? @map("tax_office")
  bankAccountHolder String? @map("bank_account_holder")
  bankIban          String? @map("bank_iban")
  bankName          String? @map("bank_name")
  vendor            Vendor  @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("vendor_financials")
}

model VendorStats {
  id                 String    @id @default(cuid())
  vendorId           String    @unique @map("vendor_id")
  rating             Decimal   @default(0) @db.Decimal(3, 2)
  reviewCount        Int       @default(0) @map("review_count")
  activeListingCount Int       @default(0) @map("active_listing_count")
  loyaltyPoints      Int       @default(0) @map("loyalty_points")
  trustScore         Decimal   @default(100) @map("trust_score") @db.Decimal(5, 2)
  lastSyncAt         DateTime? @map("last_sync_at")
  vendor             Vendor    @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("vendor_stats")
}

model VendorBanner {
  id              String   @id @default(cuid())
  type            Int      @default(1)
  template        String   @default("A")
  order           Int      @default(0)
  status          AdStatus @default(PENDING)
  createdAt       DateTime @default(now()) @map("created_at")
  imageUrl        String   @map("image_url")
  isActive        Boolean  @default(false) @map("is_active")
  linkUrl         String?  @map("link_url")
  rejectionReason String?  @map("rejection_reason")
  targetCities    String[] @default([]) @map("target_cities")
  targetDistricts String[] @default([]) @map("target_districts")
  updatedAt       DateTime @updatedAt @map("updated_at")
  vendorId        String   @map("vendor_id")
  vendor          Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("vendor_banners")
}

model VendorFollower {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now()) @map("created_at")
  userId    String   @map("user_id")
  vendorId  String   @map("vendor_id")
  vendor    Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@unique([userId, vendorId])
  @@index([userId])
  @@index([vendorId])
  @@map("vendor_followers")
}

model VendorBankAccount {
  id                String   @id @default(cuid())
  iban              String
  accountHolderName String   @map("account_holder_name")
  accountNumber     String?  @map("account_number")
  bankName          String   @map("bank_name")
  createdAt         DateTime @default(now()) @map("created_at")
  isPrimary         Boolean  @default(false) @map("is_primary")
  updatedAt         DateTime @updatedAt @map("updated_at")
  vendorId          String   @map("vendor_id")
  vendor            Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@map("vendor_bank_accounts")
}

model VendorCategory {
  categoryId String   @map("category_id")
  createdAt  DateTime @default(now()) @map("created_at")
  vendorId   String   @map("vendor_id")
  vendor     Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@id([vendorId, categoryId])
  @@map("vendor_categories")
}

model BrandEcosystem {
  id               String    @id @default(cuid())
  name             String    @unique
  slug             String    @unique
  description      String?
  status           String    @default("ACTIVE")
  createdAt        DateTime  @default(now()) @map("created_at")
  internalCommRate Decimal   @default(4.0) @map("internal_comm_rate") @db.Decimal(5, 2)
  isBlindPool      Boolean   @default(true) @map("is_blind_pool")
  logoUrl          String?   @map("logo_url")
  ownerId          String    @unique @map("owner_id")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  owner            Vendor    @relation("EcosystemOwner", fields: [ownerId], references: [id])
  auditLogs        EcosystemAuditLog[]
  members          Vendor[]  @relation("EcosystemMembers")

  @@map("brand_ecosystems")
}

model EcosystemAuditLog {
  id          String          @id @default(cuid())
  action      String
  details     Json?
  severity    String          @default("INFO")
  createdAt   DateTime        @default(now()) @map("created_at")
  ecosystemId String?         @map("ecosystem_id")
  vendorId    String?         @map("vendor_id")
  ecosystem   BrandEcosystem? @relation(fields: [ecosystemId], references: [id])

  @@index([ecosystemId])
  @@index([vendorId])
  @@index([action])
  @@map("ecosystem_audit_logs")
}

model Subscription {
  id                 String    @id @default(cuid())
  companyId          String    @unique @map("company_id")
  planName           String    @map("plan_name")
  status             String    @default("ACTIVE")
  startDate          DateTime  @default(now()) @map("start_date")
  endDate            DateTime? @map("end_date")
  autoRenew          Boolean   @default(true) @map("auto_renew")
  features           Json?
  priceTL            Decimal   @map("price_tl") @db.Decimal(18, 2)
  priceBarter        Decimal   @map("price_barter") @db.Decimal(18, 2)
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")
  listingLimit       Int       @default(10) @map("listing_limit")
  commissionDiscount Decimal   @default(0) @map("commission_discount") @db.Decimal(5, 2)
  company            Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}
```

### DOSYA LİSTESİ — HER BİRİNİN TAM İÇERİĞİNİ YAZ

```
=== PRİSMA ŞEMA GÜNCELLEMESİ ===

DOSYA #1: apps/backend/prisma/schema.prisma (GÜNCELLE — yukarıdaki tüm vendor tablolarını ve enum'ları ekle)
- Mevcut Identity tabloları korunacak (User, UserProfile, UserAddress, RefreshToken, Session, LoginHistory, VerificationToken, SSOToken)
- Yeni vendor tabloları ekleniyor

=== DOMAIN KATMANI ===

DOSYA #2: apps/backend/src/modules/vendor/domain/enums/vendor-status.enum.ts
- VendorStatus: PENDING, APPROVED, REJECTED, SUSPENDED

DOSYA #3: apps/backend/src/modules/vendor/domain/enums/vendor-tier.enum.ts
- VendorTier: CORE, PLUS, PREMIUM, ELITE

DOSYA #4: apps/backend/src/modules/vendor/domain/enums/b2b-tier.enum.ts
- B2BTier: NONE, STARTER, GROWTH, ENTERPRISE

DOSYA #5: apps/backend/src/modules/vendor/domain/enums/ad-status.enum.ts
- AdStatus: PENDING, ACTIVE, PAUSED, REJECTED, EXPIRED

DOSYA #6: apps/backend/src/modules/vendor/domain/value-objects/tax-number.vo.ts
- TaxNumber extends ValueObject
- Türkiye vergi numarası validasyonu (10 veya 11 haneli)
- static create(value: string): Result<TaxNumber, DomainException>

DOSYA #7: apps/backend/src/modules/vendor/domain/value-objects/vendor-tier.vo.ts
- VendorTierVO extends ValueObject
- getCommissionRate(): tier'a göre komisyon oranı (CORE:%10, PLUS:%8, PREMIUM:%6, ELITE:%4)

DOSYA #8: apps/backend/src/modules/vendor/domain/value-objects/vendor-slug.vo.ts
- VendorSlug extends ValueObject
- Validasyon: lowercase, no spaces, URL-safe
- static fromStoreName(name: string): VendorSlug — otomatik slug üret

DOSYA #9: apps/backend/src/modules/vendor/domain/value-objects/iban.vo.ts
- IBAN extends ValueObject
- Türkiye IBAN formatı (TR + 24 karakter = 26 toplam)
- static create(value: string): Result<IBAN, DomainException>

DOSYA #10: apps/backend/src/modules/vendor/domain/entities/company.entity.ts
- Company extends AggregateRoot
- Props: taxNumber (TaxNumber VO), name, address, phone, email, website, logo, registrationNumber, taxOffice, representativeName, representativePhone, vatRate, status, companyType, tradeRegistryNumber, mersisNumber, kepAddress, verifiedAt, deletedAt
- static create(): yeni şirket oluştur
- verify(): verifiedAt set et
- softDelete(): deletedAt set et

DOSYA #11: apps/backend/src/modules/vendor/domain/entities/vendor.entity.ts
- Vendor extends AggregateRoot
- Props: userId, companyId, status (VendorStatus), tier (VendorTier), slug (VendorSlug), isVerified, rejectionReason, suspensionReason, ecosystemId, membershipTierId, lastAuditAt, verifiedAt
- static create(userId, companyId, slug): status PENDING + VendorRegisteredEvent
- approve(): status → APPROVED + VendorApprovedEvent
- reject(reason): status → REJECTED + VendorRejectedEvent
- suspend(reason): status → SUSPENDED + VendorSuspendedEvent
- upgradeTier(newTier): tier değiştir
- isActive(): status === APPROVED kontrolü
- joinEcosystem(ecosystemId): ecosystem'e katıl

DOSYA #12: apps/backend/src/modules/vendor/domain/entities/vendor-profile.entity.ts
- VendorProfile extends Entity
- Props: vendorId, storeName, description, logo, banner, supportEmail, isFeatured, featuredUntil, city, district
- static create(): profil oluştur
- update(): profil güncelle

DOSYA #13: apps/backend/src/modules/vendor/domain/entities/vendor-settings.entity.ts
- VendorSettings extends Entity
- Props: vendorId, listingLimit, commissionRate, deliveryTimeDays, minOrderAmount, returnPolicy, shippingPolicy, preferredCurrency, vatIncluded, vacationMode, vacationEndAt, autoFulfill, commissionAdjustments
- enableVacationMode(endDate): vacationMode = true
- disableVacationMode(): vacationMode = false

DOSYA #14: apps/backend/src/modules/vendor/domain/entities/vendor-b2b-data.entity.ts
DOSYA #15: apps/backend/src/modules/vendor/domain/entities/vendor-bank-account.entity.ts
- VendorBankAccount extends Entity
- Props: vendorId, iban (IBAN VO), accountHolderName, accountNumber, bankName, isPrimary
- setAsPrimary(): isPrimary = true

DOSYA #16: apps/backend/src/modules/vendor/domain/entities/vendor-metrics.entity.ts
DOSYA #17: apps/backend/src/modules/vendor/domain/entities/vendor-stats.entity.ts
DOSYA #18: apps/backend/src/modules/vendor/domain/entities/vendor-financials.entity.ts
DOSYA #19: apps/backend/src/modules/vendor/domain/entities/vendor-banner.entity.ts
DOSYA #20: apps/backend/src/modules/vendor/domain/entities/vendor-follower.entity.ts
DOSYA #21: apps/backend/src/modules/vendor/domain/entities/brand-ecosystem.entity.ts
- BrandEcosystem extends AggregateRoot
- Props: name, slug, description, status, ownerId, internalCommRate, isBlindPool, logoUrl
- static create(): ecosystem oluştur + EcosystemCreatedEvent
- inviteMember(vendorId): üye davet et
- removeMember(vendorId): üye çıkar
- setCommissionRate(rate): iç komisyon oranı

DOSYA #22: apps/backend/src/modules/vendor/domain/entities/subscription.entity.ts
DOSYA #23: apps/backend/src/modules/vendor/domain/entities/company-user.entity.ts

DOSYA #24: apps/backend/src/modules/vendor/domain/events/vendor-registered.event.ts
DOSYA #25: apps/backend/src/modules/vendor/domain/events/vendor-approved.event.ts
DOSYA #26: apps/backend/src/modules/vendor/domain/events/vendor-rejected.event.ts
DOSYA #27: apps/backend/src/modules/vendor/domain/events/vendor-suspended.event.ts
DOSYA #28: apps/backend/src/modules/vendor/domain/events/ecosystem-created.event.ts

DOSYA #29: apps/backend/src/modules/vendor/domain/repositories/company.repository.interface.ts
- ICompanyRepository: findByTaxNumber, findById, save, existsByTaxNumber

DOSYA #30: apps/backend/src/modules/vendor/domain/repositories/vendor.repository.interface.ts
- IVendorRepository: findByUserId, findBySlug, findByCompanyId, findById, save, list (paginated + filter by status/tier)

DOSYA #31: apps/backend/src/modules/vendor/domain/repositories/vendor-profile.repository.interface.ts
DOSYA #32: apps/backend/src/modules/vendor/domain/repositories/vendor-settings.repository.interface.ts
DOSYA #33: apps/backend/src/modules/vendor/domain/repositories/vendor-bank-account.repository.interface.ts
DOSYA #34: apps/backend/src/modules/vendor/domain/repositories/vendor-follower.repository.interface.ts
DOSYA #35: apps/backend/src/modules/vendor/domain/repositories/brand-ecosystem.repository.interface.ts
DOSYA #36: apps/backend/src/modules/vendor/domain/repositories/subscription.repository.interface.ts

=== APPLICATION KATMANI — DTOs ===

DOSYA #37: apps/backend/src/modules/vendor/application/dtos/create-company.dto.ts
- taxNumber (zorunlu), name (zorunlu), address, phone, email, website, registrationNumber, taxOffice, representativeName, representativePhone, companyType, tradeRegistryNumber, mersisNumber, kepAddress, vatRate

DOSYA #38: apps/backend/src/modules/vendor/application/dtos/register-vendor.dto.ts
- companyId (zorunlu), storeName (zorunlu), description, logo, supportEmail, city, district

DOSYA #39: apps/backend/src/modules/vendor/application/dtos/update-vendor-profile.dto.ts
DOSYA #40: apps/backend/src/modules/vendor/application/dtos/update-vendor-settings.dto.ts
DOSYA #41: apps/backend/src/modules/vendor/application/dtos/update-vendor-b2b.dto.ts
DOSYA #42: apps/backend/src/modules/vendor/application/dtos/add-bank-account.dto.ts
- iban (zorunlu), accountHolderName (zorunlu), bankName (zorunlu), accountNumber, isPrimary

DOSYA #43: apps/backend/src/modules/vendor/application/dtos/create-ecosystem.dto.ts
DOSYA #44: apps/backend/src/modules/vendor/application/dtos/create-banner.dto.ts
DOSYA #45: apps/backend/src/modules/vendor/application/dtos/create-subscription.dto.ts
DOSYA #46: apps/backend/src/modules/vendor/application/dtos/vendor-response.dto.ts
DOSYA #47: apps/backend/src/modules/vendor/application/dtos/vendor-profile-response.dto.ts
DOSYA #48: apps/backend/src/modules/vendor/application/dtos/vendor-stats-response.dto.ts
DOSYA #49: apps/backend/src/modules/vendor/application/dtos/company-response.dto.ts
DOSYA #50: apps/backend/src/modules/vendor/application/dtos/ecosystem-response.dto.ts

=== APPLICATION KATMANI — Commands ===

DOSYA #51: apps/backend/src/modules/vendor/application/commands/create-company.command.ts
DOSYA #52: apps/backend/src/modules/vendor/application/commands/create-company.handler.ts
- TaxNumber validasyonu + duplicate kontrolü
- Company.create(), kaydet

DOSYA #53: apps/backend/src/modules/vendor/application/commands/register-vendor.command.ts
DOSYA #54: apps/backend/src/modules/vendor/application/commands/register-vendor.handler.ts
- Company var mı kontrol, userId zaten vendor mı kontrol
- Slug üret (storeName'den)
- Vendor.create() + VendorProfile.create() + VendorSettings.create() (defaults)
- VendorRegistered event publish

DOSYA #55: apps/backend/src/modules/vendor/application/commands/approve-vendor.command.ts
DOSYA #56: apps/backend/src/modules/vendor/application/commands/approve-vendor.handler.ts
- @Roles('ADMIN') — sadece admin
- vendor.approve(), User role'ünü VENDOR yap (identity event gönder)
- VendorApproved event publish → financial-service vendor account oluştursun

DOSYA #57: apps/backend/src/modules/vendor/application/commands/reject-vendor.command.ts
DOSYA #58: apps/backend/src/modules/vendor/application/commands/reject-vendor.handler.ts

DOSYA #59: apps/backend/src/modules/vendor/application/commands/suspend-vendor.command.ts
DOSYA #60: apps/backend/src/modules/vendor/application/commands/suspend-vendor.handler.ts
- Vendor suspend + tüm listing'leri gizle event'i gönder

DOSYA #61: apps/backend/src/modules/vendor/application/commands/update-vendor-profile.command.ts
DOSYA #62: apps/backend/src/modules/vendor/application/commands/update-vendor-profile.handler.ts
DOSYA #63: apps/backend/src/modules/vendor/application/commands/update-vendor-settings.command.ts
DOSYA #64: apps/backend/src/modules/vendor/application/commands/update-vendor-settings.handler.ts
DOSYA #65: apps/backend/src/modules/vendor/application/commands/update-vendor-b2b.command.ts
DOSYA #66: apps/backend/src/modules/vendor/application/commands/update-vendor-b2b.handler.ts

DOSYA #67: apps/backend/src/modules/vendor/application/commands/add-bank-account.command.ts
DOSYA #68: apps/backend/src/modules/vendor/application/commands/add-bank-account.handler.ts
- IBAN validasyonu
- isPrimary ise diğerlerinin isPrimary'sini false yap

DOSYA #69: apps/backend/src/modules/vendor/application/commands/remove-bank-account.command.ts
DOSYA #70: apps/backend/src/modules/vendor/application/commands/remove-bank-account.handler.ts

DOSYA #71: apps/backend/src/modules/vendor/application/commands/toggle-vacation-mode.command.ts
DOSYA #72: apps/backend/src/modules/vendor/application/commands/toggle-vacation-mode.handler.ts

DOSYA #73: apps/backend/src/modules/vendor/application/commands/create-ecosystem.command.ts
DOSYA #74: apps/backend/src/modules/vendor/application/commands/create-ecosystem.handler.ts
DOSYA #75: apps/backend/src/modules/vendor/application/commands/invite-to-ecosystem.command.ts
DOSYA #76: apps/backend/src/modules/vendor/application/commands/invite-to-ecosystem.handler.ts

DOSYA #77: apps/backend/src/modules/vendor/application/commands/follow-vendor.command.ts
DOSYA #78: apps/backend/src/modules/vendor/application/commands/follow-vendor.handler.ts
DOSYA #79: apps/backend/src/modules/vendor/application/commands/unfollow-vendor.command.ts
DOSYA #80: apps/backend/src/modules/vendor/application/commands/unfollow-vendor.handler.ts

DOSYA #81: apps/backend/src/modules/vendor/application/commands/create-vendor-banner.command.ts
DOSYA #82: apps/backend/src/modules/vendor/application/commands/create-vendor-banner.handler.ts
DOSYA #83: apps/backend/src/modules/vendor/application/commands/create-subscription.command.ts
DOSYA #84: apps/backend/src/modules/vendor/application/commands/create-subscription.handler.ts

=== APPLICATION KATMANI — Queries ===

DOSYA #85: apps/backend/src/modules/vendor/application/queries/get-vendor.query.ts
DOSYA #86: apps/backend/src/modules/vendor/application/queries/get-vendor.handler.ts
DOSYA #87: apps/backend/src/modules/vendor/application/queries/get-vendor-by-slug.query.ts
DOSYA #88: apps/backend/src/modules/vendor/application/queries/get-vendor-by-slug.handler.ts
DOSYA #89: apps/backend/src/modules/vendor/application/queries/list-vendors.query.ts
DOSYA #90: apps/backend/src/modules/vendor/application/queries/list-vendors.handler.ts
- Paginated, filtrelenebilir: status, tier, city, search (storeName)
DOSYA #91: apps/backend/src/modules/vendor/application/queries/get-vendor-profile.query.ts
DOSYA #92: apps/backend/src/modules/vendor/application/queries/get-vendor-profile.handler.ts
DOSYA #93: apps/backend/src/modules/vendor/application/queries/get-vendor-settings.query.ts
DOSYA #94: apps/backend/src/modules/vendor/application/queries/get-vendor-settings.handler.ts
DOSYA #95: apps/backend/src/modules/vendor/application/queries/get-vendor-stats.query.ts
DOSYA #96: apps/backend/src/modules/vendor/application/queries/get-vendor-stats.handler.ts
DOSYA #97: apps/backend/src/modules/vendor/application/queries/get-vendor-metrics.query.ts
DOSYA #98: apps/backend/src/modules/vendor/application/queries/get-vendor-metrics.handler.ts
DOSYA #99: apps/backend/src/modules/vendor/application/queries/get-vendor-bank-accounts.query.ts
DOSYA #100: apps/backend/src/modules/vendor/application/queries/get-vendor-bank-accounts.handler.ts
DOSYA #101: apps/backend/src/modules/vendor/application/queries/get-vendor-followers.query.ts
DOSYA #102: apps/backend/src/modules/vendor/application/queries/get-vendor-followers.handler.ts
DOSYA #103: apps/backend/src/modules/vendor/application/queries/get-ecosystem.query.ts
DOSYA #104: apps/backend/src/modules/vendor/application/queries/get-ecosystem.handler.ts
DOSYA #105: apps/backend/src/modules/vendor/application/queries/get-company.query.ts
DOSYA #106: apps/backend/src/modules/vendor/application/queries/get-company.handler.ts

=== APPLICATION KATMANI — Event Handlers ===

DOSYA #107: apps/backend/src/modules/vendor/application/event-handlers/vendor-approved.handler.ts
- VendorApproved event → RabbitMQ publish (vendor.approved)
- Financial-service'e vendor account oluşturması için bilgi gönder

DOSYA #108: apps/backend/src/modules/vendor/application/event-handlers/vendor-suspended.handler.ts
- VendorSuspended event → RabbitMQ publish (vendor.suspended)

=== INFRASTRUCTURE KATMANI — Persistence ===

DOSYA #109: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/company.mapper.ts
DOSYA #110: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor.mapper.ts
DOSYA #111: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor-profile.mapper.ts
DOSYA #112: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor-settings.mapper.ts
DOSYA #113: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor-bank-account.mapper.ts
DOSYA #114: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor-follower.mapper.ts
DOSYA #115: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/brand-ecosystem.mapper.ts
DOSYA #116: apps/backend/src/modules/vendor/infrastructure/persistence/mappers/subscription.mapper.ts

DOSYA #117: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-company.repository.ts
DOSYA #118: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor.repository.ts
- findBySlug, findByUserId, findByCompanyId
- list: paginated + filter (status, tier, city)
- Soft delete: tüm sorgularda company.deletedAt === null

DOSYA #119: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor-profile.repository.ts
DOSYA #120: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor-settings.repository.ts
DOSYA #121: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor-bank-account.repository.ts
DOSYA #122: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor-follower.repository.ts
DOSYA #123: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-brand-ecosystem.repository.ts
DOSYA #124: apps/backend/src/modules/vendor/infrastructure/persistence/prisma-subscription.repository.ts

=== INFRASTRUCTURE KATMANI — Event Publisher ===

DOSYA #125: apps/backend/src/modules/vendor/infrastructure/event-publishers/vendor-event.publisher.ts
- RabbitMQ VENDOR_EXCHANGE = 'vendor.events'
- Routing keys: vendor.registered, vendor.approved, vendor.rejected, vendor.suspended, ecosystem.created

=== PRESENTATION KATMANI ===

DOSYA #126: apps/backend/src/modules/vendor/presentation/company.controller.ts
- POST /companies — authenticated, şirket oluştur
- GET /companies/:id — authenticated
- GET /companies/my — authenticated, kendi şirketi

DOSYA #127: apps/backend/src/modules/vendor/presentation/vendor.controller.ts
- POST /vendors/register — authenticated, vendor başvurusu
- GET /vendors — @Public(), vendor listesi (paginated)
- GET /vendors/:slug — @Public(), vendor detayı (slug ile)
- GET /vendors/me — authenticated, kendi vendor bilgisi

DOSYA #128: apps/backend/src/modules/vendor/presentation/vendor-profile.controller.ts
- GET /vendors/me/profile — authenticated vendor
- PUT /vendors/me/profile — authenticated vendor, profil güncelle

DOSYA #129: apps/backend/src/modules/vendor/presentation/vendor-settings.controller.ts
- GET /vendors/me/settings — authenticated vendor
- PUT /vendors/me/settings — authenticated vendor
- PATCH /vendors/me/vacation — authenticated vendor, vacation toggle

DOSYA #130: apps/backend/src/modules/vendor/presentation/vendor-bank-account.controller.ts
- GET /vendors/me/bank-accounts — authenticated vendor
- POST /vendors/me/bank-accounts — authenticated vendor
- DELETE /vendors/me/bank-accounts/:id — authenticated vendor
- PATCH /vendors/me/bank-accounts/:id/primary — authenticated vendor

DOSYA #131: apps/backend/src/modules/vendor/presentation/vendor-follower.controller.ts
- POST /vendors/:id/follow — authenticated user
- DELETE /vendors/:id/unfollow — authenticated user
- GET /vendors/:id/followers — @Public(), follower listesi
- GET /users/me/following — authenticated, takip ettiklerim

DOSYA #132: apps/backend/src/modules/vendor/presentation/ecosystem.controller.ts
- POST /ecosystems — authenticated vendor (PREMIUM/ELITE tier gerekli)
- GET /ecosystems/:id — @Public()
- POST /ecosystems/:id/invite — authenticated vendor (ecosystem owner)

DOSYA #133: apps/backend/src/modules/vendor/presentation/vendor-admin.controller.ts
- @Roles('ADMIN', 'SUPER_ADMIN')
- GET /admin/vendors — tüm vendor listesi (admin filtreler)
- POST /admin/vendors/:id/approve — vendor onayla
- POST /admin/vendors/:id/reject — vendor reddet
- POST /admin/vendors/:id/suspend — vendor askıya al
- PATCH /admin/vendors/:id/tier — tier değiştir
- GET /admin/vendors/:id/metrics — vendor metrikleri
- GET /admin/vendors/:id/stats — vendor istatistikleri

=== MODULE REGISTRATION ===

DOSYA #134: apps/backend/src/modules/vendor/vendor.module.ts
- NestJS Module
- imports: PrismaModule, CqrsModule, SharedMessagingModule
- providers: tüm repository'ler, command/query handler'lar, event handler'lar, VendorEventPublisher
- controllers: tüm controller'lar
- exports: gerekli servisler

DOSYA #135: apps/backend/src/app-components.ts (GÜNCELLE)
- MARKET grubuna VendorModule ekle

DOSYA #136: apps/backend/src/app.module.ts (GÜNCELLE)
- VendorModule import'u app-components üzerinden gelecek
```

### KONTROL

Tüm dosyaları yazdıktan sonra şunları kontrol et:
1. Her dosyanın başında tam path var mı?
2. Import path'leri @barterborsa/* kullanıyor mu?
3. Entity'ler shared-core'dan türüyor mu?
4. Repository'ler shared-persistence'dan türüyor mu?
5. CQRS decorator'ları doğru mu (@CommandHandler, @QueryHandler)?
6. Controller'larda @Roles() ve @CurrentUser() doğru mu?
7. User tablosuna relation EKLENMEMİŞ mi? (sadece userId string)
8. Financial tablolara relation EKLENMEMİŞ mi?
9. Prisma schema'da enum'lar tanımlı mı?
10. TaxNumber ve IBAN validasyonları doğru mu?
11. Slug üretimi URL-safe mi?
12. TypeScript strict mode'da derlenir mi?

Sorun varsa düzelt ve açıkla.

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

Bu prompt 136 dosya. Parçalı verme planı:

- Birinci mesaj: Dosya #1 — #36 (Prisma + Domain katmanı)
- İkinci mesaj: Dosya #37 — #84 (Application: DTOs + Commands)
- Üçüncü mesaj: Dosya #85 — #136 (Queries + Infrastructure + Presentation + Module)

Her parçada system prompt'u TEKRAR VER.

Sonraki prompt'lar:
- Faz 4B: Catalog + Inventory modülleri
- Faz 4C: Commerce + FinancialGateway

Gemini bitirince çıktıyı Claude'a gönder — TaxNumber/IBAN validasyonu, 
vendor onay akışı ve ecosystem iş kurallarını review edeceğim.
