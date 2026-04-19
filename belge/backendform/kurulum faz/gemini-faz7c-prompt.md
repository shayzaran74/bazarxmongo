# Gemini Prompt — FAZ 7C: Loyalty/XP + Analytics Modülleri (SON MODÜLLER)

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun backend'ini yazıyorsun. Bu SON MODÜLLER — bunlarla backend tamamlanacak.

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

TAMAMLANAN TÜM MODÜLLER:
- Faz 1: Shared paketler (core, persistence, messaging, observability, security, nest)
- Faz 2: Identity & Auth
- Faz 3: Financial Service (ayrı servis)
- Faz 4: Vendor, Catalog, Inventory, Commerce, FinancialGateway
- Faz 5: Barter, Auction, Lottery
- Faz 6: Delivery Service (ayrı servis, MongoDB)
- Faz 7A: Communication (Chat, Notification, Complaint)
- Faz 7B: Content, Advertising

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
6. User tablosuna relation EKLEME — sadece userId string
7. Decimal kullan, float YASAK
8. Bu SON fazda app-components.ts'deki SUPPORT grubunu TAM dolduracaksın
```

### GÖREV

```
FAZ 7C: Loyalty/XP ve Analytics modüllerini yaz.

Loyalty/XP modülü kullanıcı sadakat ve deneyim puanı sistemini kapsar:
- XP kazanma (sipariş, barter, görev tamamlama, giriş bonusu, reklam izleme)
- XP harcama (indirim olarak kullanma, limitlere tabi)
- UserLevel: seviye sistemi (level + lifetimeXp ile tier belirleme)
- Mission: görev sistemi (görev tamamla → XP kazan)
- MilestoneTracker: haftalık/aylık hedef takibi
- LoyaltyTierHistory: tier geçmişi (BRONZE → SILVER → GOLD → PLATINUM → DIAMOND)
- XP Batch: XP'lerin kaynak bazlı takibi ve sona erme (expire)

Analytics modülü platform veri analizi:
- AnalyticsEvent: kullanıcı etkileşim olayları (page view, click, search, purchase)
- ProductActivity: ürün bazlı aktivite takibi
- Dashboard endpoint'leri: admin için özet istatistikler

=== LOYALTY/XP İŞ KURALLARI ===

XP KAZANMA:
- İlk sipariş: 500 XP bonus
- Her sipariş: sipariş tutarının %2'si kadar XP (1 TL = 1 XP)
- Barter takas tamamlama: takas değerinin %3'ü kadar XP
- Günlük giriş bonusu: 10 XP (günde 1 kez, lastLoginBonusAt kontrolü)
- Görev tamamlama: Mission.xpReward kadar XP
- Reklam izleme: kampanya bazlı XP
- Referral: davet edilen kullanıcı ilk siparişini verdiğinde 200 XP

XP HARCAMA (Spending Limits):
- XpSpendingLimitRule tablosundan kural al (vendorTier + loyaltyTier bazlı)
- maxSpendPercentage: sipariş tutarının max %'si XP ile ödenebilir
- dailyLimit, weeklyLimit, monthlyLimit: dönemsel limitler
- minCartAmount: minimum sepet tutarı (altında XP kullanılamaz)
- xpToTlRate: 1 XP = X TL dönüşüm oranı

XP BATCH SİSTEMİ:
- Her XP kazanımı bir batch oluşturur (sourceType: ORDER, BARTER, MISSION, LOGIN, AD, REFERRAL)
- Her batch'in sona erme tarihi var (expiresAt — genellikle 6 ay)
- XP harcanırken FIFO sırası ile en eski batch'ten düşülür
- Süresi dolan batch'ler otomatik burned (isBurned = true)

SEVİYE SİSTEMİ:
- UserLevel: currentXp, lifetimeXp, level, tierId
- Level hesaplama: lifetimeXp'ye göre (0-999: L1, 1000-4999: L2, 5000-14999: L3, ...)
- Tier belirleme: MembershipTier tablosundan minXP'ye göre
  - BRONZE: 0 XP
  - SILVER: 1000 XP
  - GOLD: 5000 XP
  - PLATINUM: 25000 XP
  - DIAMOND: 100000 XP
- Tier değiştiğinde LoyaltyTierHistory kaydı

MİLESTONE SİSTEMİ:
- MilestoneTracker: kullanıcı bazlı haftalık/aylık hedef takibi
- Haftalık: weeklyOrderCount >= 3 → bonus XP (weeklyBonusGiven kontrolü)
- Aylık: monthlySpendTotal >= 1000 TL → bonus XP (monthlyBonusGiven kontrolü)
- Periyot başlangıcı kontrol: yeni hafta/ay başladıysa sıfırla

GÖREV SİSTEMİ:
- Mission: key, title, description, xpReward, rewardType, isActive, metadata
- UserMission: userId + missionId, status (IN_PROGRESS/COMPLETED/CLAIMED), progress (JSON)
- Görev tipleri (metadata.type ile): FIRST_ORDER, COMPLETE_PROFILE, FIRST_BARTER, INVITE_FRIEND, WEEKLY_LOGIN_STREAK
- Progress tracking: metadata.target (hedef) ve progress.current (mevcut) karşılaştırma
- Görev tamamlanınca: status COMPLETED, completedAt set
- Ödül claim edilince: status CLAIMED, claimedAt set, XP ver

=== ANALYTICS İŞ KURALLARI ===

- AnalyticsEvent: her kullanıcı etkileşimi kaydedilir
  eventType: PAGE_VIEW, PRODUCT_VIEW, SEARCH, ADD_TO_CART, PURCHASE, BARTER_VIEW, AD_CLICK, AD_IMPRESSION
- Session bazlı takip (sessionId)
- UTM parametreleri (source, medium, campaign, referrer)
- ProductActivity: ürün bazlı aktivite (view, click, cart, purchase)
- Dashboard: admin için toplu istatistikler (günlük/haftalık/aylık)

Modül yapıları:

apps/backend/src/modules/loyalty/
├── application/
│   ├── commands/
│   │   ├── earn-xp.command.ts
│   │   ├── earn-xp.handler.ts
│   │   ├── spend-xp.command.ts
│   │   ├── spend-xp.handler.ts
│   │   ├── grant-login-bonus.command.ts
│   │   ├── grant-login-bonus.handler.ts
│   │   ├── create-mission.command.ts
│   │   ├── create-mission.handler.ts
│   │   ├── update-mission.command.ts
│   │   ├── update-mission.handler.ts
│   │   ├── start-mission.command.ts
│   │   ├── start-mission.handler.ts
│   │   ├── update-mission-progress.command.ts
│   │   ├── update-mission-progress.handler.ts
│   │   ├── complete-mission.command.ts
│   │   ├── complete-mission.handler.ts
│   │   ├── claim-mission-reward.command.ts
│   │   ├── claim-mission-reward.handler.ts
│   │   ├── check-milestones.command.ts
│   │   ├── check-milestones.handler.ts
│   │   ├── expire-xp-batches.command.ts
│   │   ├── expire-xp-batches.handler.ts
│   │   ├── recalculate-level.command.ts
│   │   └── recalculate-level.handler.ts
│   ├── queries/
│   │   ├── get-user-level.query.ts
│   │   ├── get-user-level.handler.ts
│   │   ├── get-xp-balance.query.ts
│   │   ├── get-xp-balance.handler.ts
│   │   ├── get-xp-history.query.ts
│   │   ├── get-xp-history.handler.ts
│   │   ├── get-spending-limits.query.ts
│   │   ├── get-spending-limits.handler.ts
│   │   ├── get-missions.query.ts
│   │   ├── get-missions.handler.ts
│   │   ├── get-user-missions.query.ts
│   │   ├── get-user-missions.handler.ts
│   │   ├── get-milestone-progress.query.ts
│   │   ├── get-milestone-progress.handler.ts
│   │   ├── get-tier-benefits.query.ts
│   │   ├── get-tier-benefits.handler.ts
│   │   ├── get-loyalty-tier-history.query.ts
│   │   └── get-loyalty-tier-history.handler.ts
│   ├── event-handlers/
│   │   ├── order-completed-xp.handler.ts
│   │   ├── barter-completed-xp.handler.ts
│   │   ├── user-logged-in-xp.handler.ts
│   │   └── referral-first-order-xp.handler.ts
│   ├── services/
│   │   ├── xp-calculator.service.ts
│   │   ├── level-calculator.service.ts
│   │   ├── spending-limit.service.ts
│   │   └── milestone-checker.service.ts
│   └── dtos/
│       ├── earn-xp.dto.ts
│       ├── spend-xp.dto.ts
│       ├── create-mission.dto.ts
│       ├── update-mission-progress.dto.ts
│       ├── user-level-response.dto.ts
│       ├── xp-balance-response.dto.ts
│       ├── xp-transaction-response.dto.ts
│       ├── spending-limits-response.dto.ts
│       ├── mission-response.dto.ts
│       ├── user-mission-response.dto.ts
│       ├── milestone-progress-response.dto.ts
│       ├── tier-benefits-response.dto.ts
│       └── loyalty-tier-history-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── user-level.entity.ts
│   │   ├── xp-transaction.entity.ts
│   │   ├── xp-batch.entity.ts
│   │   ├── mission.entity.ts
│   │   ├── user-mission.entity.ts
│   │   ├── milestone-tracker.entity.ts
│   │   ├── loyalty-tier-history.entity.ts
│   │   ├── xp-distribution-rule.entity.ts
│   │   ├── xp-spending-limit-rule.entity.ts
│   │   └── platinum-mission-log.entity.ts
│   ├── value-objects/
│   │   ├── xp-amount.vo.ts
│   │   ├── loyalty-tier.vo.ts
│   │   └── mission-progress.vo.ts
│   ├── events/
│   │   ├── xp-earned.event.ts
│   │   ├── xp-spent.event.ts
│   │   ├── level-up.event.ts
│   │   ├── tier-changed.event.ts
│   │   ├── mission-completed.event.ts
│   │   ├── milestone-achieved.event.ts
│   │   └── xp-batch-expired.event.ts
│   ├── repositories/
│   │   ├── user-level.repository.interface.ts
│   │   ├── xp-transaction.repository.interface.ts
│   │   ├── xp-batch.repository.interface.ts
│   │   ├── mission.repository.interface.ts
│   │   ├── user-mission.repository.interface.ts
│   │   ├── milestone-tracker.repository.interface.ts
│   │   ├── loyalty-tier-history.repository.interface.ts
│   │   ├── xp-distribution-rule.repository.interface.ts
│   │   └── xp-spending-limit-rule.repository.interface.ts
│   └── enums/
│       ├── xp-source-type.enum.ts
│       ├── loyalty-tier.enum.ts
│       ├── mission-status.enum.ts
│       └── reward-type.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-user-level.repository.ts
│   │   ├── prisma-xp-transaction.repository.ts
│   │   ├── prisma-xp-batch.repository.ts
│   │   ├── prisma-mission.repository.ts
│   │   ├── prisma-user-mission.repository.ts
│   │   ├── prisma-milestone-tracker.repository.ts
│   │   ├── prisma-loyalty-tier-history.repository.ts
│   │   ├── prisma-xp-distribution-rule.repository.ts
│   │   ├── prisma-xp-spending-limit-rule.repository.ts
│   │   └── mappers/
│   │       ├── user-level.mapper.ts
│   │       ├── xp-transaction.mapper.ts
│   │       ├── xp-batch.mapper.ts
│   │       ├── mission.mapper.ts
│   │       ├── user-mission.mapper.ts
│   │       ├── milestone-tracker.mapper.ts
│   │       ├── loyalty-tier-history.mapper.ts
│   │       ├── xp-distribution-rule.mapper.ts
│   │       └── xp-spending-limit-rule.mapper.ts
│   ├── cron/
│   │   ├── xp-batch-expiry.cron.ts
│   │   └── milestone-reset.cron.ts
│   └── event-publishers/
│       └── loyalty-event.publisher.ts
├── presentation/
│   ├── xp.controller.ts
│   ├── mission.controller.ts
│   ├── milestone.controller.ts
│   ├── tier.controller.ts
│   └── loyalty-admin.controller.ts
└── loyalty.module.ts

apps/backend/src/modules/analytics/
├── application/
│   ├── commands/
│   │   ├── track-event.command.ts
│   │   ├── track-event.handler.ts
│   │   ├── track-product-activity.command.ts
│   │   └── track-product-activity.handler.ts
│   ├── queries/
│   │   ├── get-dashboard-stats.query.ts
│   │   ├── get-dashboard-stats.handler.ts
│   │   ├── get-product-analytics.query.ts
│   │   ├── get-product-analytics.handler.ts
│   │   ├── get-revenue-report.query.ts
│   │   ├── get-revenue-report.handler.ts
│   │   ├── get-user-activity-report.query.ts
│   │   ├── get-user-activity-report.handler.ts
│   │   ├── get-vendor-performance.query.ts
│   │   └── get-vendor-performance.handler.ts
│   └── dtos/
│       ├── track-event.dto.ts
│       ├── track-product-activity.dto.ts
│       ├── dashboard-stats-response.dto.ts
│       ├── product-analytics-response.dto.ts
│       ├── revenue-report-response.dto.ts
│       ├── user-activity-response.dto.ts
│       └── vendor-performance-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── analytics-event.entity.ts
│   │   └── product-activity.entity.ts
│   ├── repositories/
│   │   ├── analytics-event.repository.interface.ts
│   │   └── product-activity.repository.interface.ts
│   └── enums/
│       ├── event-type.enum.ts
│       └── activity-type.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-analytics-event.repository.ts
│   │   ├── prisma-product-activity.repository.ts
│   │   └── mappers/
│   │       ├── analytics-event.mapper.ts
│   │       └── product-activity.mapper.ts
│   └── event-publishers/
│       └── analytics-event.publisher.ts
├── presentation/
│   ├── tracking.controller.ts
│   └── analytics-admin.controller.ts
└── analytics.module.ts
```

### PRİSMA ŞEMASI

Backend Prisma şemasına ekle (mevcut tablolara DOKUNMA):

```prisma
// === LOYALTY ENUMS ===

enum LoyaltyTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
}

// === LOYALTY TABLES ===

model UserLevel {
  id               String          @id @default(cuid())
  userId           String          @unique @map("user_id")
  currentXp        Int             @default(0) @map("current_xp")
  lifetimeXp       Int             @default(0) @map("lifetime_xp")
  level            Int             @default(1) @map("level")
  tierId           String?         @map("tier_id")
  lastLoginBonusAt DateTime?       @map("last_login_bonus_at")
  isFirstOrder     Boolean         @default(true) @map("is_first_order")
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")
  membershipTier   MembershipTier? @relation(fields: [tierId], references: [id])

  @@index([userId])
  @@map("user_levels")
}

model XpTransaction {
  id            String   @default(cuid())
  userId        String   @map("user_id")
  amount        Int
  type          String   @map("type")
  description   String?
  referenceId   String?  @map("reference_id")
  referenceType String?  @map("reference_type")
  metadata      Json?
  createdAt     DateTime @default(now()) @map("created_at")

  @@id([id, createdAt])
  @@index([userId])
  @@map("xp_transactions")
}

model XpBatch {
  id             String   @id @default(uuid())
  accountId      String   @map("account_id")
  originalAmount Decimal  @map("original_amount") @db.Decimal(18, 4)
  currentBalance Decimal  @map("current_balance") @db.Decimal(18, 4)
  sourceType     String   @map("source_type")
  sourceRefId    String?  @map("source_ref_id")
  createdAt      DateTime @default(now()) @map("created_at")
  expiresAt      DateTime @map("expires_at")
  isBurned       Boolean  @default(false) @map("is_burned")

  @@index([accountId])
  @@index([expiresAt])
  @@map("xp_batches")
}

model Mission {
  id           String        @id @default(cuid())
  key          String        @unique @map("key")
  title        String
  description  String?
  xpReward     Int           @default(0) @map("xp_reward")
  rewardType   String?       @default("XP") @map("reward_type")
  isActive     Boolean       @default(true) @map("is_active")
  metadata     Json?
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  userMissions UserMission[]

  @@map("missions")
}

model UserMission {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  missionId   String    @map("mission_id")
  status      String    @default("IN_PROGRESS") @map("status")
  progress    Json?     @map("progress")
  completedAt DateTime? @map("completed_at")
  claimedAt   DateTime? @map("claimed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  mission     Mission   @relation(fields: [missionId], references: [id], onDelete: Cascade)

  @@unique([userId, missionId])
  @@index([userId, status])
  @@map("user_missions")
}

model MilestoneTracker {
  id                 String    @id @default(cuid())
  userId             String    @unique @map("user_id")
  weeklyOrderCount   Int       @default(0) @map("weekly_order_count")
  weeklyPeriodStart  DateTime? @map("weekly_period_start")
  weeklyBonusGiven   Boolean   @default(false) @map("weekly_bonus_given")
  monthlySpendTotal  Decimal   @default(0) @db.Decimal(18, 2) @map("monthly_spend_total")
  monthlyPeriodStart DateTime? @map("monthly_period_start")
  monthlyBonusGiven  Boolean   @default(false) @map("monthly_bonus_given")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@map("milestone_trackers")
}

model LoyaltyTierHistory {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  fromTier    String?  @map("from_tier")
  toTier      String   @map("to_tier")
  reason      String?
  triggeredBy String?  @map("triggered_by")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("loyalty_tier_history")
}

model XpDistributionRule {
  id               String      @id @default(cuid())
  city             String?
  vendorTier       VendorTier? @map("vendor_tier")
  commissionRate   Decimal?    @map("commission_rate") @db.Decimal(5, 2)
  adSpendRate      Decimal?    @map("ad_spend_rate") @db.Decimal(5, 2)
  serviceRate      Decimal?    @map("service_rate") @db.Decimal(5, 2)
  priority         Int         @default(0)
  isActive         Boolean     @default(true) @map("is_active")
  createdAt        DateTime    @default(now()) @map("created_at")
  updatedAt        DateTime    @updatedAt @map("updated_at")
  distributionType String?     @map("distribution_type")
  name             String?

  @@index([city])
  @@index([vendorTier])
  @@map("xp_distribution_rules")
}

model XpSpendingLimitRule {
  id                  String       @id @default(cuid())
  vendorTier          VendorTier?  @map("vendor_tier")
  maxSpendPerTx       Decimal?     @map("max_spend_per_tx") @db.Decimal(18, 2)
  monthlyVolumeLimit  Decimal?     @map("monthly_volume_limit") @db.Decimal(18, 2)
  priority            Int          @default(0)
  isActive            Boolean      @default(true) @map("is_active")
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")
  dailyLimit          Decimal?     @map("daily_limit") @db.Decimal(18, 2)
  loyaltyTier         LoyaltyTier? @map("loyalty_tier")
  maxSpendPercentage  Decimal?     @map("max_spend_percentage") @db.Decimal(5, 2)
  minCartAmount       Decimal?     @map("min_cart_amount") @db.Decimal(18, 2)
  monthlyLimit        Decimal?     @map("monthly_limit") @db.Decimal(18, 2)
  weeklyLimit         Decimal?     @map("weekly_limit") @db.Decimal(18, 2)
  weeklyVolumeLimit   Decimal?     @map("weekly_volume_limit") @db.Decimal(18, 2)
  xpToTlRate          Decimal?     @map("xp_to_tl_rate") @db.Decimal(18, 2)

  @@index([vendorTier])
  @@map("xp_spending_limit_rules")
}

model PlatinumMissionLog {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  missionId   String    @map("mission_id")
  vendorId    String?   @map("vendor_id")
  totalAmount Decimal?  @map("total_amount") @db.Decimal(18, 2)
  orderCount  Int?      @map("order_count")
  xpEarned    Int?      @map("xp_earned")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@index([userId, vendorId])
  @@map("platinum_mission_logs")
}

// === ANALYTICS TABLES ===

model AnalyticsEvent {
  id               String   @id @default(cuid())
  referrer         String?
  source           String?
  medium           String?
  campaign         String?
  metadata         Json?
  catalogProductId String?  @map("catalog_product_id")
  categoryId       String?  @map("category_id")
  eventSource      String?  @map("event_source")
  eventType        String   @map("event_type")
  intent           String?
  ipAddress        String?  @map("ip_address")
  listingId        String?  @map("listing_id")
  path             String?
  sessionId        String?  @map("session_id")
  timestamp        DateTime @default(now())
  userAgent        String?  @map("user_agent")
  userId           String?  @map("user_id")
  vendorId         String?  @map("vendor_id")

  @@index([eventType])
  @@index([userId])
  @@index([sessionId])
  @@index([timestamp])
  @@map("analytics_events")
}

model ProductActivity {
  id               String   @id @default(cuid())
  type             String
  catalogProductId String?  @map("catalog_product_id")
  createdAt        DateTime @default(now()) @map("created_at")
  listingId        String?  @map("listing_id")
  metadata         Json?
  userId           String?  @map("user_id")

  @@index([listingId])
  @@index([catalogProductId])
  @@index([type])
  @@index([createdAt])
  @@map("product_activities")
}
```

### DOSYA LİSTESİ

Yukarıdaki klasör yapısındaki HER DOSYANIN tam içeriğini yaz.

=== LOYALTY MODULE DETAYLARI ===

DOMAIN ENTITIES:

UserLevel extends Entity:
- Props: userId, currentXp, lifetimeXp, level, tierId, lastLoginBonusAt, isFirstOrder
- static create(userId): level 1, currentXp 0, lifetimeXp 0, isFirstOrder true
- addXp(amount): currentXp += amount, lifetimeXp += amount
- spendXp(amount): currentXp -= amount (validation: currentXp >= amount)
- recalculateLevel(levelCalculator): yeni level hesapla
- grantLoginBonus(): lastLoginBonusAt = now
- markFirstOrderUsed(): isFirstOrder = false
- canReceiveLoginBonus(): lastLoginBonusAt bugünden önce mi

XpTransaction extends Entity (append-only):
- Props: userId, amount (int, + veya -), type, description, referenceId, referenceType, metadata
- static createEarning(userId, amount, type, ref): pozitif amount
- static createSpending(userId, amount, ref): negatif amount

XpBatch extends Entity:
- Props: accountId, originalAmount (Decimal), currentBalance (Decimal), sourceType, sourceRefId, expiresAt, isBurned
- static create(accountId, amount, sourceType, expiresAt): batch oluştur
- deduct(amount): currentBalance -= amount (validation: currentBalance >= amount)
- burn(): isBurned = true, currentBalance = 0
- isExpired(): expiresAt < now

Mission extends AggregateRoot:
- Props: key (unique), title, description, xpReward, rewardType, isActive, metadata
- static create(): görev oluştur
- activate() / deactivate()

UserMission extends Entity:
- Props: userId, missionId, status (IN_PROGRESS/COMPLETED/CLAIMED), progress (MissionProgress VO), completedAt, claimedAt
- static start(userId, missionId): status IN_PROGRESS
- updateProgress(current): progress.current güncelle
- isComplete(): progress.current >= progress.target
- complete(): status COMPLETED, completedAt = now + MissionCompletedEvent
- claimReward(): status CLAIMED, claimedAt = now

MilestoneTracker extends Entity:
- Props: userId, weeklyOrderCount, weeklyPeriodStart, weeklyBonusGiven, monthlySpendTotal, monthlyPeriodStart, monthlyBonusGiven
- incrementWeeklyOrder(): weeklyOrderCount++
- addMonthlySpend(amount): monthlySpendTotal += amount
- checkWeeklyMilestone(): weeklyOrderCount >= 3 && !weeklyBonusGiven → MilestoneAchievedEvent
- checkMonthlyMilestone(): monthlySpendTotal >= 1000 && !monthlyBonusGiven → MilestoneAchievedEvent
- resetWeekly(): yeni hafta başladıysa sıfırla
- resetMonthly(): yeni ay başladıysa sıfırla

APPLICATION SERVICES:

xp-calculator.service.ts:
- calculateOrderXp(orderAmount, isFirstOrder): XP hesapla
  isFirstOrder ise 500 bonus + %2
  değilse sadece %2
- calculateBarterXp(tradeValue): %3
- calculateLoginBonus(): 10 XP
- calculateReferralBonus(): 200 XP

level-calculator.service.ts:
- calculateLevel(lifetimeXp): lifetimeXp'ye göre level belirle
  L1: 0-999, L2: 1000-4999, L3: 5000-14999, L4: 15000-49999, L5: 50000+
- determineTier(lifetimeXp): tier belirle
  BRONZE: 0, SILVER: 1000, GOLD: 5000, PLATINUM: 25000, DIAMOND: 100000

spending-limit.service.ts:
- getApplicableLimits(vendorTier, loyaltyTier): uygun spending rule'ları al
- validateSpending(userId, amount, cartTotal, limits): harcama limitlerini kontrol
  - maxSpendPercentage kontrolü
  - daily/weekly/monthly limit kontrolü (XpTransaction'lardan toplam hesapla)
  - minCartAmount kontrolü
- calculateXpToTl(xpAmount, limits): XP→TL dönüşüm

milestone-checker.service.ts:
- checkAndUpdateMilestones(userId, orderAmount?): haftalık/aylık kontrol
- Periyot kontrolü: weeklyPeriodStart bu haftanın başı mı, değilse resetle

CRON JOBS:

xp-batch-expiry.cron.ts:
- @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
- expiresAt ≤ now ve isBurned = false olan batch'leri bul
- Her birini burn() yap
- XpBatchExpired event

milestone-reset.cron.ts:
- @Cron(CronExpression.EVERY_DAY_AT_1AM)
- Pazartesi günü ise: tüm tracker'ların haftalık değerlerini sıfırla
- Ayın 1'i ise: tüm tracker'ların aylık değerlerini sıfırla

EVENT HANDLERS (RabbitMQ):

order-completed-xp.handler.ts:
- commerce.events / order.completed dinle
- XP hesapla (xpCalculator), earnXp command dispatch
- MilestoneTracker güncelle (incrementWeeklyOrder, addMonthlySpend)
- İlk sipariş ise bonus XP + isFirstOrder = false

barter-completed-xp.handler.ts:
- barter.events / swap.completed dinle
- Barter XP hesapla, earnXp dispatch

user-logged-in-xp.handler.ts:
- identity.events / user.logged_in dinle (eğer bu event yoksa, login sırasında doğrudan çağrılabilir)
- canReceiveLoginBonus() kontrolü, bonus ver

referral-first-order-xp.handler.ts:
- order.completed + user.referredById varsa → referral bonus

EARN-XP COMMAND HANDLER (kritik):
1. UserLevel getir (yoksa oluştur)
2. XpTransaction kaydet (earning)
3. XpBatch oluştur (sourceType, expiresAt = now + 6 ay)
4. UserLevel.addXp(amount)
5. Level recalculate → level değiştiyse LevelUpEvent
6. Tier recalculate → tier değiştiyse TierChangedEvent + LoyaltyTierHistory kaydet
7. Tüm işlem Prisma transaction içinde

SPEND-XP COMMAND HANDLER (kritik):
1. SpendingLimitService.validateSpending() → geçerli mi kontrol
2. FIFO ile XpBatch'lerden düş (en eski batch'ten başla):
   - Süresi dolmamış, balance > 0 olan batch'leri sırala (createdAt ASC)
   - Her batch'ten min(batch.currentBalance, remaining) kadar düş
   - Remaining = 0 olana kadar devam
3. XpTransaction kaydet (spending, negatif amount)
4. UserLevel.spendXp(amount)
5. Tüm işlem Prisma transaction içinde

CONTROLLERS:

xp.controller.ts:
- GET /xp/balance — authenticated, XP bakiye + detay
- GET /xp/history — authenticated, XP işlem geçmişi (paginated)
- GET /xp/spending-limits — authenticated, harcama limitleri
- POST /xp/earn — @Roles('ADMIN'), manuel XP ver

mission.controller.ts:
- GET /missions — authenticated, aktif görevler
- GET /missions/my — authenticated, kullanıcının görevleri + progress
- POST /missions/:id/start — authenticated, göreve başla
- POST /missions/:id/claim — authenticated, ödül al

milestone.controller.ts:
- GET /milestones — authenticated, milestone durumu (haftalık/aylık)

tier.controller.ts:
- GET /tiers — @Public(), tier listesi + benefits
- GET /tiers/my — authenticated, mevcut tier + geçmiş
- GET /tiers/history — authenticated, tier değişim geçmişi

loyalty-admin.controller.ts:
- @Roles('ADMIN')
- GET /admin/loyalty/stats — XP dağılım istatistikleri
- POST /admin/loyalty/missions — görev oluştur
- PUT /admin/loyalty/missions/:id — görev güncelle
- GET /admin/loyalty/spending-rules — harcama kuralları
- PUT /admin/loyalty/spending-rules/:id — kural güncelle
- GET /admin/loyalty/distribution-rules — dağıtım kuralları
- POST /admin/loyalty/grant-xp — kullanıcıya manuel XP ver
- POST /admin/loyalty/expire-batches — süresi dolan batch'leri manuel çalıştır

=== ANALYTICS MODULE DETAYLARI ===

DOMAIN:

AnalyticsEvent extends Entity (append-only):
- Props: eventType, userId, sessionId, path, ipAddress, userAgent, listingId, catalogProductId, categoryId, vendorId, source, medium, campaign, referrer, intent, eventSource, metadata
- static track(): event oluştur
- NOT: Bu tablo yoğun yazılır, okuma nadirdir. Performans için index'ler minimal tutuldu.

ProductActivity extends Entity (append-only):
- Props: type (VIEW, CLICK, CART_ADD, PURCHASE, WISHLIST), userId, listingId, catalogProductId, metadata
- static track(): aktivite kaydet

EventType enum: PAGE_VIEW, PRODUCT_VIEW, SEARCH, ADD_TO_CART, REMOVE_FROM_CART, PURCHASE, BARTER_VIEW, BARTER_OFFER, AD_CLICK, AD_IMPRESSION, LOGIN, REGISTER, CHECKOUT_START, CHECKOUT_COMPLETE

APPLICATION:

track-event command + handler:
- Event kaydet (append-only)
- Performans: batch insert destekle (birden fazla event tek seferde)

track-product-activity command + handler:
- Ürün aktivitesi kaydet

Dashboard queries:
- get-dashboard-stats:
  - Bugünkü: toplam sipariş, gelir, yeni kullanıcı, aktif kullanıcı
  - Haftalık trend: günlük sipariş/gelir dizisi
  - Aylık: toplam gelir, sipariş sayısı, ortalama sipariş tutarı

- get-product-analytics:
  - Ürün bazlı: view count, cart add count, purchase count, conversion rate
  - Dönemsel filtre (last 7d, 30d, 90d)

- get-revenue-report:
  - Günlük/haftalık/aylık gelir raporu
  - Kategori bazlı gelir dağılımı
  - Vendor bazlı gelir sıralaması

- get-user-activity-report:
  - Aktif kullanıcı trendi
  - Session bazlı analiz
  - Retention (tekrar ziyaret) oranı

- get-vendor-performance:
  - Vendor bazlı: sipariş sayısı, gelir, iade oranı, ortalama teslimat süresi, rating

CONTROLLERS:

tracking.controller.ts:
- POST /analytics/track — @Public(), event kaydet (frontend'den çağrılır)
  - Rate limiting: IP başına dakikada max 60 event
  - Validation: eventType zorunlu
- POST /analytics/track/batch — @Public(), toplu event kaydet

analytics-admin.controller.ts:
- @Roles('ADMIN')
- GET /admin/analytics/dashboard — genel dashboard
- GET /admin/analytics/products — ürün analitiği
- GET /admin/analytics/revenue — gelir raporu (dateRange filtre)
- GET /admin/analytics/users — kullanıcı aktivitesi
- GET /admin/analytics/vendors — vendor performansı
- GET /admin/analytics/events — ham event listesi (paginated, filtrelenebilir)

=== MODULE REGISTRATION (FİNAL) ===

loyalty.module.ts:
- imports: CqrsModule, PrismaModule, RabbitMQModule, ScheduleModule.forRoot()
- providers: tüm repository'ler, handler'lar, services, cron jobs, LoyaltyEventPublisher
- controllers: tüm controller'lar

analytics.module.ts:
- imports: CqrsModule, PrismaModule
- providers: repository'ler, handler'lar
- controllers: tracking, analytics-admin

app-components.ts (FİNAL GÜNCELLEME):
```typescript
export const CORE = [IdentityModule, FinancialGatewayModule];
export const MARKET = [VendorModule, CatalogModule, InventoryModule, CommerceModule];
export const EXCHANGE = [BarterModule, AuctionModule];
export const SUPPORT = [CommunicationModule, ContentModule, AdvertisingModule, LoyaltyModule, AnalyticsModule];
```

### EK GÖREV

Tüm dosyaları yazdıktan sonra:
1. `pnpm build` hatasız derlenmeli
2. `grep -rn "as any\|: any" apps/backend/src/modules/loyalty/ --include="*.ts" | wc -l` → 0
3. `grep -rn "as any\|: any" apps/backend/src/modules/analytics/ --include="*.ts" | wc -l` → 0
4. app-components.ts'deki 4 grup (CORE, MARKET, EXCHANGE, SUPPORT) TAM dolu olmalı
5. @nestjs/schedule dependency eklenmeli (cron jobs için)

### KONTROL

1. `any` tipi SIFIR mı?
2. IEventBus KULLANILMAMIŞ mı?
3. XP earn: UserLevel + XpTransaction + XpBatch hepsi tek transaction'da mı?
4. XP spend: FIFO batch deduction doğru mu (en eski batch'ten)?
5. Spending limits: daily/weekly/monthly kontrol var mı?
6. Level up: lifetimeXp'ye göre level hesaplanıyor mu?
7. Tier change: LoyaltyTierHistory kaydı oluşturuluyor mu?
8. Login bonus: günde 1 kez kontrolü var mı (lastLoginBonusAt)?
9. İlk sipariş bonus: isFirstOrder kontrolü var mı?
10. XP batch expiry: cron job günlük çalışıyor mu?
11. Milestone reset: haftalık Pazartesi, aylık 1'inde sıfırlanıyor mu?
12. Analytics tracking: rate limiting var mı?
13. Dashboard queries: dateRange filtre destekliyor mu?
14. Decimal kullanımı — float sızmamış mı?
15. TypeScript strict mode derlenir mi?
16. app-components.ts SUPPORT grubu tam mı?

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

Parçalı verme planı:

- Birinci mesaj: System prompt + Prisma + Loyalty Domain (entities, VOs, events, repos, enums)
- İkinci mesaj: Loyalty Application (services + commands + queries + event handlers + DTOs)
- Üçüncü mesaj: Loyalty Infrastructure + Presentation + Cron Jobs
- Dördüncü mesaj: Analytics Module tam (domain + application + infrastructure + presentation)
- Beşinci mesaj: Module Registration (loyalty.module, analytics.module, app-components FİNAL)

Her parçada system prompt'u TEKRAR VER.

🎉 BU SON FAZ! Tamamlandığında backend'in TÜM modülleri yerinde olacak:
CORE: Identity, FinancialGateway
MARKET: Vendor, Catalog, Inventory, Commerce
EXCHANGE: Barter, Auction
SUPPORT: Communication, Content, Advertising, Loyalty, Analytics
+ Ayrı servisler: Financial Service (gRPC), Delivery Service (MongoDB)
