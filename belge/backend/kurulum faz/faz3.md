# Gemini Prompt — FAZ 3: Financial Service

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT (her fazda tekrar ver)

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun BAĞIMSIZ financial servisini yazıyorsun.

MİMARİ KARARLAR (ASLA sorgulamayacaksın):

- Framework: NestJS 10+ / Fastify adapter
- TypeScript strict mode
- PostgreSQL 16 — Prisma ORM — AYRI VERİTABANI (barterborsa_financial)
- Auth: İnter-service gRPC çağrıları (backend'den gelir), REST sadece admin
- DDD: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern
- CQRS: NestJS CQRS modülü ile Command/Query ayrımı
- İletişim: gRPC (senkron — bakiye, ödeme) + RabbitMQ (asenkron — komisyon, mutabakat)
- Güvenlik: Idempotency key zorunlu, double-entry ledger, immutable audit log
- Package prefix: @barterborsa/*

FAZ 1'DE OLUŞTURULAN SHARED PAKETLER (bunları kullanacaksın):

@barterborsa/shared-core:
  - Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent
  - IRepository<T>, IReadRepository<T>, IWriteRepository<T>
  - IUseCase<TInput, TOutput>, Command, Query
  - PaginationInput, PaginatedResult<T>
  - DomainException, NotFoundException, ConflictException
  - Result<T, E>, Ok(), Err(), isOk(), isErr()

@barterborsa/shared-persistence:
  - PrismaModule, PrismaService, BasePrismaRepository<T>, PrismaUnitOfWork
  - OutboxModule, OutboxEntity, OutboxPublisherService

@barterborsa/shared-messaging:
  - RabbitMQModule, RabbitMQService, IntegrationEvent, IEventBus
  - FINANCIAL_EXCHANGE: payment.completed, payment.failed, wallet.topup, commission.calculated
  - COMMERCE_EXCHANGE: order.created, order.completed, order.cancelled
  - IDENTITY_EXCHANGE: user.registered
  - DELIVERY_EXCHANGE: shipment.delivered

@barterborsa/shared-security:
  - EncryptionService, HashingService, RateLimitGuard

@barterborsa/shared-nest:
  - @Idempotent(), ResponseTransformInterceptor, GlobalExceptionFilter

@barterborsa/shared-observability:
  - LoggerModule, StructuredLogger, HealthModule

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. Kendi mimari önerini ekleme
4. TypeScript strict mode
5. Import'larda @barterborsa/* workspace alias kullan
6. Kod yorumlarını Türkçe yaz
7. Her dosya ÇALIŞIR, DERLENEBILIR, eksiksiz olacak
8. Tüm finansal amount'lar Decimal türünde — ASLA float/number kullanma
9. Her write endpoint'te idempotency key ZORUNLU
10. Double-entry ledger: her işlem hem debit hem credit kaydı oluşturacak
11. Audit log: tüm finansal işlemler append-only log'a yazılacak
```

### GÖREV

```
FAZ 3: Financial Service'i bağımsız bir NestJS uygulaması olarak yaz.

Bu servis AYRI bir veritabanına (barterborsa_financial) bağlıdır.
Backend ile iletişim: gRPC (senkron) + RabbitMQ (asenkron)

Servis 4 modülden oluşur:
1. Wallet — Cüzdan yönetimi, bakiye, topup, transfer, withdraw
2. Ledger — Çift kayıt muhasebe (double-entry), her işlem debit+credit
3. Commission — Komisyon hesaplama, tier-based oranlar
4. Escrow — Emanet hesap, barter/auction/order için hold/release/refund

Servis yapısı:

apps/financial-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── modules/
│   │   ├── wallet/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── create-wallet.command.ts
│   │   │   │   │   ├── create-wallet.handler.ts
│   │   │   │   │   ├── topup-wallet.command.ts
│   │   │   │   │   ├── topup-wallet.handler.ts
│   │   │   │   │   ├── withdraw-wallet.command.ts
│   │   │   │   │   ├── withdraw-wallet.handler.ts
│   │   │   │   │   ├── transfer-funds.command.ts
│   │   │   │   │   ├── transfer-funds.handler.ts
│   │   │   │   │   ├── process-topup-request.command.ts
│   │   │   │   │   ├── process-topup-request.handler.ts
│   │   │   │   │   ├── process-withdrawal-request.command.ts
│   │   │   │   │   └── process-withdrawal-request.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-balance.query.ts
│   │   │   │   │   ├── get-balance.handler.ts
│   │   │   │   │   ├── get-account.query.ts
│   │   │   │   │   ├── get-account.handler.ts
│   │   │   │   │   ├── get-transactions.query.ts
│   │   │   │   │   ├── get-transactions.handler.ts
│   │   │   │   │   ├── get-topup-requests.query.ts
│   │   │   │   │   ├── get-topup-requests.handler.ts
│   │   │   │   │   ├── get-withdrawal-requests.query.ts
│   │   │   │   │   └── get-withdrawal-requests.handler.ts
│   │   │   │   ├── event-handlers/
│   │   │   │   │   └── user-registered.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── topup-wallet.dto.ts
│   │   │   │       ├── withdraw-wallet.dto.ts
│   │   │   │       ├── transfer-funds.dto.ts
│   │   │   │       ├── wallet-response.dto.ts
│   │   │   │       ├── account-response.dto.ts
│   │   │   │       └── transaction-response.dto.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── wallet.entity.ts
│   │   │   │   │   ├── account.entity.ts
│   │   │   │   │   ├── account-transaction.entity.ts
│   │   │   │   │   ├── account-hold.entity.ts
│   │   │   │   │   ├── topup-request.entity.ts
│   │   │   │   │   └── withdrawal-request.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── money.vo.ts
│   │   │   │   │   ├── account-type.vo.ts
│   │   │   │   │   └── iban.vo.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── wallet-created.event.ts
│   │   │   │   │   ├── wallet-topped-up.event.ts
│   │   │   │   │   ├── funds-transferred.event.ts
│   │   │   │   │   ├── withdrawal-requested.event.ts
│   │   │   │   │   └── hold-placed.event.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── wallet.repository.interface.ts
│   │   │   │   │   ├── account.repository.interface.ts
│   │   │   │   │   ├── account-transaction.repository.interface.ts
│   │   │   │   │   └── account-hold.repository.interface.ts
│   │   │   │   └── enums/
│   │   │   │       ├── account-type.enum.ts
│   │   │   │       ├── account-status.enum.ts
│   │   │   │       ├── transaction-type.enum.ts
│   │   │   │       ├── transaction-direction.enum.ts
│   │   │   │       ├── transaction-status.enum.ts
│   │   │   │       ├── hold-reason.enum.ts
│   │   │   │       ├── hold-status.enum.ts
│   │   │   │       ├── wallet-currency.enum.ts
│   │   │   │       ├── payment-method.enum.ts
│   │   │   │       ├── topup-status.enum.ts
│   │   │   │       └── withdrawal-status.enum.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── prisma-wallet.repository.ts
│   │   │   │   │   ├── prisma-account.repository.ts
│   │   │   │   │   ├── prisma-account-transaction.repository.ts
│   │   │   │   │   ├── prisma-account-hold.repository.ts
│   │   │   │   │   └── mappers/
│   │   │   │   │       ├── wallet.mapper.ts
│   │   │   │   │       ├── account.mapper.ts
│   │   │   │   │       ├── account-transaction.mapper.ts
│   │   │   │   │       └── account-hold.mapper.ts
│   │   │   │   └── payment-providers/
│   │   │   │       ├── payment-provider.interface.ts
│   │   │   │       └── iyzico.adapter.ts
│   │   │   ├── presentation/
│   │   │   │   ├── wallet.controller.ts
│   │   │   │   ├── account.controller.ts
│   │   │   │   └── wallet.grpc.controller.ts
│   │   │   └── wallet.module.ts
│   │   │
│   │   ├── ledger/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── record-entry.command.ts
│   │   │   │   │   ├── record-entry.handler.ts
│   │   │   │   │   ├── reconcile.command.ts
│   │   │   │   │   └── reconcile.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-ledger-entries.query.ts
│   │   │   │   │   ├── get-ledger-entries.handler.ts
│   │   │   │   │   ├── get-balance-sheet.query.ts
│   │   │   │   │   └── get-balance-sheet.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── record-entry.dto.ts
│   │   │   │       ├── ledger-entry-response.dto.ts
│   │   │   │       └── balance-sheet-response.dto.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── general-ledger-entry.entity.ts
│   │   │   │   │   └── user-ledger-entry.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   └── ledger-type.vo.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── general-ledger.repository.interface.ts
│   │   │   │   │   └── user-ledger.repository.interface.ts
│   │   │   │   └── enums/
│   │   │   │       └── ledger-type.enum.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── prisma-general-ledger.repository.ts
│   │   │   │       ├── prisma-user-ledger.repository.ts
│   │   │   │       └── mappers/
│   │   │   │           ├── general-ledger.mapper.ts
│   │   │   │           └── user-ledger.mapper.ts
│   │   │   ├── presentation/
│   │   │   │   └── ledger.controller.ts
│   │   │   └── ledger.module.ts
│   │   │
│   │   ├── commission/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── calculate-commission.command.ts
│   │   │   │   │   └── calculate-commission.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-commission-rates.query.ts
│   │   │   │   │   └── get-commission-rates.handler.ts
│   │   │   │   ├── event-handlers/
│   │   │   │   │   ├── order-completed.handler.ts
│   │   │   │   │   └── barter-completed.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── calculate-commission.dto.ts
│   │   │   │       └── commission-response.dto.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── commission-record.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   └── commission-rate.vo.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   └── commission.repository.interface.ts
│   │   │   │   └── services/
│   │   │   │       └── commission-calculator.service.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── prisma-commission.repository.ts
│   │   │   │       └── mappers/
│   │   │   │           └── commission.mapper.ts
│   │   │   ├── presentation/
│   │   │   │   └── commission.controller.ts
│   │   │   └── commission.module.ts
│   │   │
│   │   └── escrow/
│   │       ├── application/
│   │       │   ├── commands/
│   │       │   │   ├── create-escrow.command.ts
│   │       │   │   ├── create-escrow.handler.ts
│   │       │   │   ├── hold-funds.command.ts
│   │       │   │   ├── hold-funds.handler.ts
│   │       │   │   ├── release-funds.command.ts
│   │       │   │   ├── release-funds.handler.ts
│   │       │   │   ├── refund-funds.command.ts
│   │       │   │   └── refund-funds.handler.ts
│   │       │   ├── queries/
│   │       │   │   ├── get-escrow.query.ts
│   │       │   │   └── get-escrow.handler.ts
│   │       │   ├── event-handlers/
│   │       │   │   ├── order-created.handler.ts
│   │       │   │   ├── barter-accepted.handler.ts
│   │       │   │   └── shipment-delivered.handler.ts
│   │       │   └── dtos/
│   │       │       ├── create-escrow.dto.ts
│   │       │       └── escrow-response.dto.ts
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── escrow.entity.ts
│   │       │   ├── events/
│   │       │   │   ├── escrow-created.event.ts
│   │       │   │   ├── funds-held.event.ts
│   │       │   │   ├── funds-released.event.ts
│   │       │   │   └── funds-refunded.event.ts
│   │       │   ├── repositories/
│   │       │   │   └── escrow.repository.interface.ts
│   │       │   └── enums/
│   │       │       └── escrow-status.enum.ts
│   │       ├── infrastructure/
│   │       │   └── persistence/
│   │       │       ├── prisma-escrow.repository.ts
│   │       │       └── mappers/
│   │       │           └── escrow.mapper.ts
│   │       ├── presentation/
│   │       │   ├── escrow.controller.ts
│   │       │   └── escrow.grpc.controller.ts
│   │       └── escrow.module.ts
│   │
│   ├── common/
│   │   ├── idempotency/
│   │   │   ├── idempotency.guard.ts
│   │   │   ├── idempotency.store.ts
│   │   │   └── idempotency.interceptor.ts
│   │   ├── audit/
│   │   │   ├── audit-log.interceptor.ts
│   │   │   ├── audit-log.entity.ts
│   │   │   └── audit-log.repository.ts
│   │   └── saga/
│   │       ├── saga-step.interface.ts
│   │       └── saga-orchestrator.ts
│   │
│   ├── grpc/
│   │   └── financial.proto
│   │
│   └── config/
│       ├── app.config.ts
│       ├── database.config.ts
│       ├── grpc.config.ts
│       ├── iyzico.config.ts
│       ├── redis.config.ts
│       └── rabbitmq.config.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### MEVCUT PRİSMA ŞEMASI — BUNU REFERANS AL

Financial service AYRI veritabanı kullanır (barterborsa_financial). Mevcut tablolar aşağıdadır.
Bu tabloları AYNEN koru ama şu düzenlemeleri yap:

1. User relation'larını KALDIR — bu servis User tablosuna sahip değil, sadece userId string referansı tutar
2. Diğer modüllere (Order, Listing, AdCampaign vb.) ait relation'ları KALDIR — sadece referenceId/referenceType ile referans ver
3. AccountHold'daki AuctionParticipation, SwapSession, TradeOffer relation'larını KALDIR — bunlar referenceId/referenceType ile izlenecek
4. idempotencyKey alanları zaten var — bunları koru
5. OutboxMessage tablosunu koru — outbox pattern için gerekli
6. AuditLog tablosu EKLE (yeni) — tüm finansal işlemler için immutable audit log
7. CommissionRecord tablosu EKLE (yeni) — komisyon hesaplama kayıtları
8. DownPaymentPolicy tablosunu koru
9. GiftCard ve GiftCardTransaction tablolarını koru
10. MembershipTier, Membership, TierBenefit tablolarını koru
11. WithdrawalVerification tablosunu koru
12. IdempotencyKey tablosunu koru

Mevcut tablolar (User ve cross-module relation'ları temizlenmiş hali):

```prisma
// Wallet — ana cüzdan (XP, barter bakiye, TL bakiye)
model Wallet {
  id                  String               @id @default(cuid())
  balanceTL           Decimal              @default(0) @map("balance_tl") @db.Decimal(18, 2)
  barterBalance       Decimal              @default(0.00) @map("barter_balance") @db.Decimal(15, 2)
  lastXpAdsEarnedDate DateTime?            @map("last_xp_ads_earned_date")
  userId              String               @unique @map("user_id")
  xpAdsBalance        Decimal              @default(0) @map("xp_ads_balance") @db.Decimal(18, 2)
  xpCommissionBalance Decimal              @default(0) @map("xp_commission_balance") @db.Decimal(18, 2)
  xpPoints            Int                  @default(0) @map("xp_points")
  xpTradeBalance      Decimal              @default(0) @map("xp_trade_balance") @db.Decimal(18, 2)
  transactions        TransactionHistory[]
  @@map("wallets")
}

// Account — hesap sistemi (TRY, Barter, vs.)
model Account {
  id                 String                     @id @default(cuid())
  type               AccountType
  currency           WalletCurrency             @default(TRY)
  balance            Decimal                    @default(0) @db.Decimal(18, 2)
  status             AccountStatus              @default(ACTIVE)
  availableBalance   Decimal                    @default(0) @map("available_balance") @db.Decimal(18, 2)
  blockedBalance     Decimal                    @default(0) @map("blocked_balance") @db.Decimal(18, 2)
  createdAt          DateTime                   @default(now()) @map("created_at")
  creditLimit        Decimal                    @default(0) @map("credit_limit") @db.Decimal(18, 2)
  isDirty            Boolean                    @default(true) @map("is_dirty")
  lastReconciledAt   DateTime?                  @map("last_reconciled_at")
  ownerType          AccountOwnerType           @default(CUSTOMER) @map("owner_type")
  updatedAt          DateTime                   @updatedAt @map("updated_at")
  userId             String                     @map("user_id")
  vendorTier         VendorTier?                @map("vendor_tier")
  holds              AccountHold[]
  topUpRequests      AccountTopUpRequest[]
  transactions       AccountTransaction[]
  withdrawalRequests AccountWithdrawalRequest[]
  @@unique([userId, type])
  @@index([ownerType])
  @@map("accounts")
}

// AccountTransaction — hesap hareketleri
model AccountTransaction {
  id             String               @id @default(cuid())
  type           TransactionType
  direction      TransactionDirection
  amount         Decimal              @db.Decimal(18, 2)
  description    String?
  status         TransactionStatus    @default(COMPLETED)
  metadata       Json?
  accountId      String               @map("account_id")
  createdAt      DateTime             @default(now()) @map("created_at")
  idempotencyKey String?              @unique @map("idempotency_key")
  referenceId    String?              @map("reference_id")
  referenceType  String?              @map("reference_type")
  settledAt      DateTime?            @map("settled_at")
  account        Account              @relation(fields: [accountId], references: [id], onDelete: Cascade)
  @@index([accountId, createdAt(sort: Desc)])
  @@index([referenceId, referenceType])
  @@index([referenceId, type])
  @@map("account_transactions")
}

// AccountHold — bloke edilmiş bakiye
model AccountHold {
  id                    String                @id @default(cuid())
  amount                Decimal               @db.Decimal(18, 2)
  reason                HoldReason
  status                HoldStatus            @default(ACTIVE)
  notes                 String?
  accountId             String                @map("account_id")
  createdAt             DateTime              @default(now()) @map("created_at")
  createdBy             String?               @map("created_by")
  expiresAt             DateTime?             @map("expires_at")
  idempotencyKey        String?               @unique @map("idempotency_key")
  referenceId           String?               @map("reference_id")
  referenceType         String?               @map("reference_type")
  releasedAt            DateTime?             @map("released_at")
  releasedBy            String?               @map("released_by")
  updatedAt             DateTime              @updatedAt @map("updated_at")
  account               Account               @relation(fields: [accountId], references: [id], onDelete: Cascade)
  @@index([accountId, status, expiresAt])
  @@index([referenceType, referenceId])
  @@map("account_holds")
}

// AccountTopUpRequest — para yükleme talepleri
model AccountTopUpRequest {
  id               String        @id @default(cuid())
  amount           Decimal       @db.Decimal(18, 2)
  notes            String?
  accountId        String?       @map("account_id")
  createdAt        DateTime      @default(now()) @map("created_at")
  paymentMethod    PaymentMethod @map("payment_method")
  paymentReference String?       @map("payment_reference")
  processedAt      DateTime?     @map("processed_at")
  processedBy      String?       @map("processed_by")
  rejectionReason  String?       @map("rejection_reason")
  updatedAt        DateTime      @updatedAt @map("updated_at")
  userId           String        @map("user_id")
  status           TopUpStatus   @default(PENDING)
  account          Account?      @relation(fields: [accountId], references: [id])
  @@index([userId])
  @@index([accountId])
  @@map("account_top_up_requests")
}

// AccountWithdrawalRequest — para çekme talepleri
model AccountWithdrawalRequest {
  id              String           @id @default(cuid())
  amount          Decimal          @db.Decimal(18, 2)
  iban            String
  accountHolder   String           @map("account_holder")
  accountId       String?          @map("account_id")
  bankName        String           @map("bank_name")
  createdAt       DateTime         @default(now()) @map("created_at")
  notes           String?
  processedAt     DateTime?        @map("processed_at")
  processedBy     String?          @map("processed_by")
  rejectionReason String?          @map("rejection_reason")
  updatedAt       DateTime         @updatedAt @map("updated_at")
  userId          String           @map("user_id")
  status          WithdrawalStatus @default(PENDING)
  account         Account?         @relation(fields: [accountId], references: [id])
  @@index([userId])
  @@index([accountId])
  @@map("account_withdrawal_requests")
}

// GeneralLedger — genel muhasebe defteri (çift kayıt)
model GeneralLedger {
  id              String     @default(cuid())
  type            LedgerType
  payload         Json?
  note            String?
  actorId         String?    @map("actor_id")
  amount          Decimal?   @db.Decimal(18, 2)
  createdAt       DateTime   @default(now()) @map("created_at")
  creditAccountId String?    @map("credit_account_id")
  debitAccountId  String?    @map("debit_account_id")
  refType         String?    @map("ref_type")
  referenceId     String?    @map("reference_id")
  @@id([id, createdAt])
  @@index([type, referenceId])
  @@index([createdAt])
  @@index([debitAccountId])
  @@index([creditAccountId])
  @@map("general_ledger")
}

// UserLedgerEntry — kullanıcı bazlı muhasebe
model UserLedgerEntry {
  id          String          @id @default(cuid())
  type        TransactionType
  amount      Decimal         @db.Decimal(15, 2)
  currency    WalletCurrency
  description String?
  createdAt   DateTime        @default(now()) @map("created_at")
  createdBy   String?         @map("created_by")
  referenceId String?         @map("reference_id")
  userId      String          @map("user_id")
  @@map("user_ledger_entries")
}

// Payment — ödeme kayıtları
model Payment {
  id                   String              @id @default(cuid())
  userId               String              @map("user_id")
  orderId              String?             @map("order_id")
  amount               Decimal             @db.Decimal(18, 2)
  paymentType          String              @map("payment_type")
  paymentMethod        PaymentMethod?      @map("payment_method")
  status               PaymentStatus       @default(PENDING)
  metadata             Json?
  paidAt               DateTime?           @map("paid_at")
  failedAt             DateTime?           @map("failed_at")
  failureReason        String?             @map("failure_reason")
  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  accountTransactionId String?             @map("account_transaction_id")
  @@index([userId])
  @@index([orderId])
  @@map("payments")
}

// Escrow — emanet hesap
model Escrow {
  id             String       @id @default(cuid())
  orderId        String       @unique @map("order_id")
  buyerId        String       @map("buyer_id")
  sellerId       String       @map("seller_id")
  amount         Decimal      @db.Decimal(18, 2)
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")
  releasedAt     DateTime?    @map("released_at")
  payoutLog      Json?        @map("payout_log")
  releasedAmount Decimal      @default(0) @map("released_amount") @db.Decimal(18, 2)
  status         EscrowStatus @default(PENDING)
  @@index([buyerId])
  @@index([sellerId])
  @@map("escrows")
}

// TransactionHistory — cüzdan işlem geçmişi
model TransactionHistory {
  id          String            @id @default(uuid())
  walletId    String            @map("wallet_id")
  amount      Decimal           @db.Decimal(15, 2)
  xpAmount    Int               @default(0) @map("xp_amount")
  type        String
  status      TransactionStatus @default(PENDING)
  referenceId String?           @map("reference_id")
  createdAt   DateTime          @default(now()) @map("created_at")
  wallet      Wallet            @relation(fields: [walletId], references: [id])
  @@index([walletId])
  @@index([createdAt])
  @@map("transaction_history")
}

// GiftCard — hediye kartı
model GiftCard {
  id           String                @id @default(cuid())
  code         String                @unique
  status       GiftCardStatus        @default(Active)
  note         String?
  createdAt    DateTime              @default(now()) @map("created_at")
  currentValue Decimal               @map("current_value") @db.Decimal(18, 2)
  customerId   String?               @map("customer_id")
  expiresAt    DateTime?             @map("expires_at")
  initialValue Decimal               @map("initial_value") @db.Decimal(18, 2)
  updatedAt    DateTime              @updatedAt @map("updated_at")
  transactions GiftCardTransaction[]
  @@map("gift_cards")
}

// GiftCardTransaction
model GiftCardTransaction {
  id         String   @id @default(cuid())
  amount     Decimal  @db.Decimal(18, 2)
  note       String?
  createdAt  DateTime @default(now()) @map("created_at")
  giftCardId String   @map("gift_card_id")
  orderId    String?  @map("order_id")
  giftCard   GiftCard @relation(fields: [giftCardId], references: [id], onDelete: Cascade)
  @@map("gift_card_transactions")
}

// WithdrawalVerification
model WithdrawalVerification {
  id           String    @id @default(cuid())
  token        String    @unique
  createdAt    DateTime  @default(now()) @map("created_at")
  expiresAt    DateTime  @map("expires_at")
  isVerified   Boolean   @default(false) @map("is_verified")
  userId       String    @unique @map("user_id")
  verifiedAt   DateTime? @map("verified_at")
  withdrawalId String    @unique @map("withdrawal_id")
  @@index([userId])
  @@index([token])
  @@map("withdrawal_verifications")
}

// IdempotencyKey
model IdempotencyKey {
  key       String   @id
  userId    String?  @map("user_id")
  result    Json?
  status    String   @default("COMPLETED")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  @@index([expiresAt])
  @@map("idempotency_keys")
}

// DownPaymentPolicy
model DownPaymentPolicy {
  id             String   @id @default(uuid())
  percentage     Decimal  @default(25.0) @db.Decimal(5, 2)
  active         Boolean  @default(true)
  categoryKey    String   @unique @map("category_key")
  createdAt      DateTime @default(now()) @map("created_at")
  maxAmount      Decimal? @map("max_amount") @db.Decimal(19, 4)
  minAmount      Decimal? @map("min_amount") @db.Decimal(19, 4)
  refundDays     Int      @default(3) @map("refund_days")
  requireBalance Boolean  @default(true) @map("require_balance")
  updatedAt      DateTime @updatedAt @map("updated_at")
  @@map("down_payment_policies")
}

// OutboxMessage
model OutboxMessage {
  id            String    @id @default(cuid())
  aggregateId   String    @map("aggregate_id")
  aggregateType String    @map("aggregate_type")
  eventType     String    @map("event_type")
  payload       Json
  status        String    @default("PENDING")
  retryCount    Int       @default(0) @map("retry_count")
  createdAt     DateTime  @default(now()) @map("created_at")
  processedAt   DateTime? @map("processed_at")
  @@index([status, createdAt])
  @@map("outbox_messages")
}

// MembershipTier
model MembershipTier {
  id        String   @id @map("id")
  name      String   @unique @map("name")
  price     Decimal  @default(0) @map("price") @db.Decimal(18, 2)
  minXP     Int      @map("min_xp")
  benefits  Json     @map("benefits")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")
  @@map("membership_tiers")
}

// TierBenefit
model TierBenefit {
  id                   String   @id @default(cuid())
  tier                 UserTier @unique
  annualFee            Decimal  @map("annual_fee") @db.Decimal(18, 2)
  apiRatePerMin        Int      @map("api_rate_per_min")
  archiveAfterDays     Int      @map("archive_after_days")
  burnRate             Decimal  @map("burn_rate") @db.Decimal(5, 2)
  commissionBarter     Decimal  @map("commission_barter") @db.Decimal(5, 2)
  commissionCash       Decimal  @map("commission_cash") @db.Decimal(5, 2)
  createdAt            DateTime @default(now()) @map("created_at")
  excelBatchLimit      Int      @map("excel_batch_limit")
  imageCountPerListing Int      @map("image_count_per_listing")
  listingLimit         Int      @map("listing_limit")
  roiRate              Decimal  @map("roi_rate") @db.Decimal(5, 2)
  updatedAt            DateTime @updatedAt @map("updated_at")
  xpMultiplier         Decimal  @map("xp_multiplier") @db.Decimal(5, 2)
  @@map("tier_benefits")
}

// === YENİ TABLOLAR (EKLENECEK) ===

// AuditLog — tüm finansal işlemlerin değiştirilemez kaydı
model AuditLog {
  id            String   @id @default(cuid())
  action        String                    // TOPUP, WITHDRAW, TRANSFER, HOLD, RELEASE, REFUND, COMMISSION
  entityType    String   @map("entity_type")    // Account, Wallet, Escrow
  entityId      String   @map("entity_id")
  actorId       String?  @map("actor_id")       // userId veya system
  actorType     String   @default("USER") @map("actor_type") // USER, SYSTEM, ADMIN
  payload       Json                             // işlem detayları
  previousState Json?    @map("previous_state")  // önceki durum
  newState      Json?    @map("new_state")       // sonraki durum
  ipAddress     String?  @map("ip_address")
  userAgent     String?  @map("user_agent")
  correlationId String?  @map("correlation_id")
  createdAt     DateTime @default(now()) @map("created_at")
  // NOT: updatedAt YOK — bu tablo APPEND-ONLY, güncelleme yapılamaz
  @@index([entityType, entityId])
  @@index([actorId])
  @@index([action])
  @@index([createdAt])
  @@index([correlationId])
  @@map("audit_logs")
}

// CommissionRecord — komisyon hesaplama kayıtları
model CommissionRecord {
  id               String   @id @default(cuid())
  orderId          String?  @map("order_id")
  tradeOfferId     String?  @map("trade_offer_id")
  vendorId         String   @map("vendor_id")
  vendorTier       String   @map("vendor_tier")
  baseAmount       Decimal  @map("base_amount") @db.Decimal(18, 2)
  commissionRate   Decimal  @map("commission_rate") @db.Decimal(5, 2)
  commissionAmount Decimal  @map("commission_amount") @db.Decimal(18, 2)
  commissionType   String   @map("commission_type")   // CASH, BARTER
  status           String   @default("CALCULATED")     // CALCULATED, COLLECTED, FAILED
  collectedAt      DateTime? @map("collected_at")
  createdAt        DateTime @default(now()) @map("created_at")
  idempotencyKey   String?  @unique @map("idempotency_key")
  @@index([vendorId])
  @@index([orderId])
  @@index([tradeOfferId])
  @@index([status])
  @@map("commission_records")
}
```

Enum'lar (mevcut):

```prisma
enum AccountType {
  MAIN
  ESCROW
  COMMISSION
  BARTER
  AD_BUDGET
  B2B_BARTER
  BONUS
  REFUND
  XP_ADS
  XP_COMMISSION
  XP_TRADE
}

enum AccountStatus { ACTIVE FROZEN CLOSED SUSPENDED }
enum AccountOwnerType { CUSTOMER VENDOR PLATFORM }
enum WalletCurrency { TRY BARTER USD EUR }
enum TransactionType { DEPOSIT WITHDRAWAL TRANSFER COMMISSION REFUND HOLD RELEASE PAYMENT TOPUP AD_SPEND AD_EARNING GIFT_CARD BARTER_TRADE BONUS ADJUSTMENT }
enum TransactionDirection { CREDIT DEBIT }
enum TransactionStatus { PENDING COMPLETED FAILED CANCELLED REVERSED }
enum HoldReason { ESCROW AUCTION_BID BARTER_COLLATERAL ORDER_RESERVE DISPUTE ADMIN_HOLD DOWN_PAYMENT }
enum HoldStatus { ACTIVE RELEASED EXPIRED FORFEITED CANCELLED }
enum PaymentMethod { IYZICO BANK_TRANSFER WALLET BARTER GIFT_CARD MIXED }
enum PaymentStatus { PENDING COMPLETED FAILED REFUNDED CANCELLED PARTIALLY_REFUNDED }
enum TopUpStatus { PENDING APPROVED REJECTED COMPLETED CANCELLED }
enum WithdrawalStatus { PENDING APPROVED REJECTED COMPLETED CANCELLED VERIFICATION_REQUIRED }
enum EscrowStatus { PENDING FUNDED RELEASED REFUNDED DISPUTED PARTIALLY_RELEASED CANCELLED }
enum GiftCardStatus { Active Redeemed Expired Cancelled }
enum LedgerType { TRANSFER TRADE_SETTLEMENT COMMISSION REFUND DEPOSIT WITHDRAWAL ADMIN_ADJUSTMENT ESCROW_FUND ESCROW_RELEASE AD_SPEND AD_EARNING XP_CONVERSION DOWN_PAYMENT BONUS }
enum VendorTier { CORE PLUS PREMIUM ELITE }
enum UserTier { BRONZE SILVER GOLD PLATINUM DIAMOND }
```

### DOSYA LİSTESİ — HER BİRİNİN TAM İÇERİĞİNİ YAZ

```
=== PROJE KONFIGÜRASYONU ===

DOSYA #1: apps/financial-service/package.json
- name: @barterborsa/financial-service
- dependencies: @nestjs/core, @nestjs/platform-fastify, @nestjs/cqrs, @nestjs/microservices,
  @grpc/grpc-js, @grpc/proto-loader, @prisma/client, prisma, ioredis, decimal.js
- workspace dependencies: @barterborsa/shared-core, shared-persistence, shared-messaging,
  shared-observability, shared-security, shared-nest

DOSYA #2: apps/financial-service/tsconfig.json
DOSYA #3: apps/financial-service/nest-cli.json

DOSYA #4: apps/financial-service/prisma/schema.prisma
- datasource: postgresql (barterborsa_financial veritabanı)
- Yukarıdaki TÜM tabloları ve enum'ları dahil et
- User relation'ları YOK — sadece userId string

DOSYA #5: apps/financial-service/src/main.ts
- NestFactory.create ile FastifyAdapter
- gRPC microservice ekle (port 50051)
- REST port: 3004
- Global pipes, filters, interceptors
- Graceful shutdown

DOSYA #6: apps/financial-service/src/app.module.ts
- Import: PrismaModule, RabbitMQModule, LoggerModule, HealthModule
- Import: WalletModule, LedgerModule, CommissionModule, EscrowModule
- Config module ile .env

=== gRPC PROTO ===

DOSYA #7: apps/financial-service/src/grpc/financial.proto
- package: barterborsa.financial
- service WalletService:
  - GetBalance (userId) → BalanceResponse (balanceTL, barterBalance, availableBalance, blockedBalance)
  - CreateWallet (userId) → WalletResponse
  - TopupWallet (userId, amount, idempotencyKey, paymentMethod) → TransactionResponse
  - TransferFunds (fromUserId, toUserId, amount, idempotencyKey, description) → TransactionResponse
  - GetAccount (userId, accountType) → AccountResponse
- service EscrowService:
  - CreateEscrow (orderId, buyerId, sellerId, amount, idempotencyKey) → EscrowResponse
  - HoldFunds (accountId, amount, reason, referenceId, referenceType, idempotencyKey) → HoldResponse
  - ReleaseFunds (holdId, idempotencyKey) → HoldResponse
  - RefundFunds (escrowId, amount, idempotencyKey) → EscrowResponse

=== COMMON (idempotency, audit, saga) ===

DOSYA #8: apps/financial-service/src/common/idempotency/idempotency.guard.ts
- x-idempotency-key header'dan key oku
- IdempotencyKey tablosundan kontrol et
- Key varsa ve COMPLETED ise → cached result döndür (HTTP 200)
- Key yoksa → devam et, işlem sonunda kaydet

DOSYA #9: apps/financial-service/src/common/idempotency/idempotency.store.ts
- IdempotencyStore — Prisma ile IdempotencyKey CRUD
- set(key, userId, result, ttl): kaydet
- get(key): bul
- Expired key'leri temizle (cron)

DOSYA #10: apps/financial-service/src/common/idempotency/idempotency.interceptor.ts
- NestJS interceptor — response'u otomatik idempotency store'a kaydet

DOSYA #11: apps/financial-service/src/common/audit/audit-log.entity.ts
- AuditLogEntry — domain entity

DOSYA #12: apps/financial-service/src/common/audit/audit-log.repository.ts
- AuditLogRepository — Prisma ile AuditLog INSERT only (update/delete YOK)

DOSYA #13: apps/financial-service/src/common/audit/audit-log.interceptor.ts
- Her finansal endpoint'e otomatik audit log yaz
- Önceki state ve sonraki state'i kaydet

DOSYA #14: apps/financial-service/src/common/saga/saga-step.interface.ts
- ISagaStep: execute(), compensate() metodları
- Her adımın başarısız olması durumunda geri alma mantığı

DOSYA #15: apps/financial-service/src/common/saga/saga-orchestrator.ts
- SagaOrchestrator — adımları sırayla çalıştır
- Bir adım başarısız olursa önceki tüm adımların compensate()'ini çağır

=== CONFIG ===

DOSYA #16: apps/financial-service/src/config/app.config.ts
DOSYA #17: apps/financial-service/src/config/database.config.ts
DOSYA #18: apps/financial-service/src/config/grpc.config.ts
DOSYA #19: apps/financial-service/src/config/iyzico.config.ts
DOSYA #20: apps/financial-service/src/config/redis.config.ts
DOSYA #21: apps/financial-service/src/config/rabbitmq.config.ts

=== WALLET MODULE ===

// Domain
DOSYA #22: apps/financial-service/src/modules/wallet/domain/enums/account-type.enum.ts
DOSYA #23: apps/financial-service/src/modules/wallet/domain/enums/account-status.enum.ts
DOSYA #24: apps/financial-service/src/modules/wallet/domain/enums/transaction-type.enum.ts
DOSYA #25: apps/financial-service/src/modules/wallet/domain/enums/transaction-direction.enum.ts
DOSYA #26: apps/financial-service/src/modules/wallet/domain/enums/transaction-status.enum.ts
DOSYA #27: apps/financial-service/src/modules/wallet/domain/enums/hold-reason.enum.ts
DOSYA #28: apps/financial-service/src/modules/wallet/domain/enums/hold-status.enum.ts
DOSYA #29: apps/financial-service/src/modules/wallet/domain/enums/wallet-currency.enum.ts
DOSYA #30: apps/financial-service/src/modules/wallet/domain/enums/payment-method.enum.ts
DOSYA #31: apps/financial-service/src/modules/wallet/domain/enums/topup-status.enum.ts
DOSYA #32: apps/financial-service/src/modules/wallet/domain/enums/withdrawal-status.enum.ts

DOSYA #33: apps/financial-service/src/modules/wallet/domain/value-objects/money.vo.ts
- Money extends ValueObject
- Props: amount (Decimal), currency (WalletCurrency)
- add(), subtract(), multiply(), isPositive(), isZero()
- ASLA float kullanma — Decimal.js ile hesapla

DOSYA #34: apps/financial-service/src/modules/wallet/domain/value-objects/account-type.vo.ts
DOSYA #35: apps/financial-service/src/modules/wallet/domain/value-objects/iban.vo.ts
- IBAN extends ValueObject
- Türkiye IBAN formatı validasyonu (TR + 2 kontrol + 5 banka + 1 anahtar + 16 hesap = 26 karakter)

DOSYA #36: apps/financial-service/src/modules/wallet/domain/entities/wallet.entity.ts
- Wallet extends AggregateRoot
- Props: userId, balanceTL (Decimal), barterBalance (Decimal), xpPoints, xp sub-balances
- static create(userId): yeni cüzdan
- topup(amount): TL bakiye artır
- deductTL(amount): TL bakiye azalt — yetersiz bakiye kontrolü
- addBarterBalance(amount): barter bakiye artır

DOSYA #37: apps/financial-service/src/modules/wallet/domain/entities/account.entity.ts
- Account extends AggregateRoot
- Props: userId, type, currency, balance, availableBalance, blockedBalance, status, creditLimit, ownerType, vendorTier
- static create(userId, type, currency): yeni hesap
- credit(amount): bakiye artır + availableBalance artır
- debit(amount): bakiye azalt + availableBalance azalt — yetersiz bakiye kontrolü
- hold(amount): availableBalance azalt + blockedBalance artır
- releaseHold(amount): blockedBalance azalt + availableBalance artır
- freeze(): hesap dondur
- reconcile(): isDirty = false, lastReconciledAt = now

DOSYA #38: apps/financial-service/src/modules/wallet/domain/entities/account-transaction.entity.ts
- AccountTransaction extends Entity
- Props: accountId, type, direction, amount, description, status, metadata, idempotencyKey, referenceId, referenceType, settledAt

DOSYA #39: apps/financial-service/src/modules/wallet/domain/entities/account-hold.entity.ts
- AccountHold extends Entity
- Props: accountId, amount, reason, status, notes, createdBy, expiresAt, idempotencyKey, referenceId, referenceType, releasedAt, releasedBy
- release(releasedBy): status → RELEASED, releasedAt set
- expire(): status → EXPIRED
- forfeit(): status → FORFEITED

DOSYA #40: apps/financial-service/src/modules/wallet/domain/entities/topup-request.entity.ts
DOSYA #41: apps/financial-service/src/modules/wallet/domain/entities/withdrawal-request.entity.ts

DOSYA #42: apps/financial-service/src/modules/wallet/domain/events/wallet-created.event.ts
DOSYA #43: apps/financial-service/src/modules/wallet/domain/events/wallet-topped-up.event.ts
DOSYA #44: apps/financial-service/src/modules/wallet/domain/events/funds-transferred.event.ts
DOSYA #45: apps/financial-service/src/modules/wallet/domain/events/withdrawal-requested.event.ts
DOSYA #46: apps/financial-service/src/modules/wallet/domain/events/hold-placed.event.ts

DOSYA #47: apps/financial-service/src/modules/wallet/domain/repositories/wallet.repository.interface.ts
DOSYA #48: apps/financial-service/src/modules/wallet/domain/repositories/account.repository.interface.ts
- findByUserId(userId): Account[]
- findByUserIdAndType(userId, type): Account | null
DOSYA #49: apps/financial-service/src/modules/wallet/domain/repositories/account-transaction.repository.interface.ts
DOSYA #50: apps/financial-service/src/modules/wallet/domain/repositories/account-hold.repository.interface.ts

// Application — DTOs
DOSYA #51: apps/financial-service/src/modules/wallet/application/dtos/topup-wallet.dto.ts
DOSYA #52: apps/financial-service/src/modules/wallet/application/dtos/withdraw-wallet.dto.ts
DOSYA #53: apps/financial-service/src/modules/wallet/application/dtos/transfer-funds.dto.ts
DOSYA #54: apps/financial-service/src/modules/wallet/application/dtos/wallet-response.dto.ts
DOSYA #55: apps/financial-service/src/modules/wallet/application/dtos/account-response.dto.ts
DOSYA #56: apps/financial-service/src/modules/wallet/application/dtos/transaction-response.dto.ts

// Application — Commands
DOSYA #57: apps/financial-service/src/modules/wallet/application/commands/create-wallet.command.ts
DOSYA #58: apps/financial-service/src/modules/wallet/application/commands/create-wallet.handler.ts
- userId ile Wallet + MAIN Account oluştur
- Audit log yaz
- İdempotent: aynı userId ile tekrar çağrılırsa mevcut wallet'ı döndür

DOSYA #59: apps/financial-service/src/modules/wallet/application/commands/topup-wallet.command.ts
DOSYA #60: apps/financial-service/src/modules/wallet/application/commands/topup-wallet.handler.ts
- İdempotency key kontrolü
- Iyzico ile ödeme al (payment provider interface)
- Prisma transaction içinde:
  1. Account.credit(amount)
  2. AccountTransaction kaydet (DEPOSIT, CREDIT)
  3. GeneralLedger'a çift kayıt: debit: CASH_IN, credit: USER_ACCOUNT
  4. Payment kaydı oluştur
  5. Wallet.topup(amount) — eski cüzdan uyumluluk
  6. Outbox'a WalletToppedUp event'i
- Audit log yaz

DOSYA #61: apps/financial-service/src/modules/wallet/application/commands/withdraw-wallet.command.ts
DOSYA #62: apps/financial-service/src/modules/wallet/application/commands/withdraw-wallet.handler.ts
- IBAN validasyonu
- Bakiye kontrolü (availableBalance >= amount)
- Hold oluştur (ADMIN_HOLD reason ile)
- AccountWithdrawalRequest oluştur
- WithdrawalVerification oluştur — email ile doğrulama
- Admin onayı sonrası: hold release, account debit, ledger kaydı

DOSYA #63: apps/financial-service/src/modules/wallet/application/commands/transfer-funds.command.ts
DOSYA #64: apps/financial-service/src/modules/wallet/application/commands/transfer-funds.handler.ts
- fromUser ve toUser bakiye kontrolü
- Prisma transaction içinde:
  1. fromAccount.debit(amount)
  2. toAccount.credit(amount)
  3. İki AccountTransaction kaydet (DEBIT + CREDIT)
  4. GeneralLedger: debit: fromAccount, credit: toAccount
  5. Outbox: FundsTransferred event

DOSYA #65: apps/financial-service/src/modules/wallet/application/commands/process-topup-request.command.ts
DOSYA #66: apps/financial-service/src/modules/wallet/application/commands/process-topup-request.handler.ts
- Admin tarafından topup request onay/red

DOSYA #67: apps/financial-service/src/modules/wallet/application/commands/process-withdrawal-request.command.ts
DOSYA #68: apps/financial-service/src/modules/wallet/application/commands/process-withdrawal-request.handler.ts
- Admin tarafından withdrawal request onay/red
- Onay → hold release + account debit + banka transfer başlat

// Application — Queries
DOSYA #69: apps/financial-service/src/modules/wallet/application/queries/get-balance.query.ts
DOSYA #70: apps/financial-service/src/modules/wallet/application/queries/get-balance.handler.ts
DOSYA #71: apps/financial-service/src/modules/wallet/application/queries/get-account.query.ts
DOSYA #72: apps/financial-service/src/modules/wallet/application/queries/get-account.handler.ts
DOSYA #73: apps/financial-service/src/modules/wallet/application/queries/get-transactions.query.ts
DOSYA #74: apps/financial-service/src/modules/wallet/application/queries/get-transactions.handler.ts
- Paginated, filtrelenebilir (type, direction, status, dateRange)
DOSYA #75: apps/financial-service/src/modules/wallet/application/queries/get-topup-requests.query.ts
DOSYA #76: apps/financial-service/src/modules/wallet/application/queries/get-topup-requests.handler.ts
DOSYA #77: apps/financial-service/src/modules/wallet/application/queries/get-withdrawal-requests.query.ts
DOSYA #78: apps/financial-service/src/modules/wallet/application/queries/get-withdrawal-requests.handler.ts

// Application — Event Handlers
DOSYA #79: apps/financial-service/src/modules/wallet/application/event-handlers/user-registered.handler.ts
- RabbitMQ'dan user.registered event'i dinle
- Otomatik olarak CreateWalletCommand dispatch et

// Infrastructure — Persistence
DOSYA #80: apps/financial-service/src/modules/wallet/infrastructure/persistence/mappers/wallet.mapper.ts
DOSYA #81: apps/financial-service/src/modules/wallet/infrastructure/persistence/mappers/account.mapper.ts
DOSYA #82: apps/financial-service/src/modules/wallet/infrastructure/persistence/mappers/account-transaction.mapper.ts
DOSYA #83: apps/financial-service/src/modules/wallet/infrastructure/persistence/mappers/account-hold.mapper.ts
DOSYA #84: apps/financial-service/src/modules/wallet/infrastructure/persistence/prisma-wallet.repository.ts
DOSYA #85: apps/financial-service/src/modules/wallet/infrastructure/persistence/prisma-account.repository.ts
- findByUserIdAndType implementasyonu
- Pessimistic locking desteği (SELECT FOR UPDATE — Prisma raw query)
DOSYA #86: apps/financial-service/src/modules/wallet/infrastructure/persistence/prisma-account-transaction.repository.ts
DOSYA #87: apps/financial-service/src/modules/wallet/infrastructure/persistence/prisma-account-hold.repository.ts

// Infrastructure — Payment Providers
DOSYA #88: apps/financial-service/src/modules/wallet/infrastructure/payment-providers/payment-provider.interface.ts
- IPaymentProvider: initiatePayment, verifyPayment, refundPayment
DOSYA #89: apps/financial-service/src/modules/wallet/infrastructure/payment-providers/iyzico.adapter.ts
- IyzicoAdapter implements IPaymentProvider
- @iyzico/iyzipay SDK kullan
- initiatePayment: Iyzico checkout form oluştur
- verifyPayment: callback'ten gelen token'ı doğrula
- refundPayment: iade işlemi

// Presentation
DOSYA #90: apps/financial-service/src/modules/wallet/presentation/wallet.controller.ts
- REST endpoints (admin & authenticated user)
- GET /wallets/me — kendi cüzdan bilgisi
- POST /wallets/topup — @Idempotent(), para yükle
- POST /wallets/withdraw — @Idempotent(), para çek
- POST /wallets/transfer — @Idempotent(), transfer
- GET /wallets/transactions — işlem geçmişi (paginated)
- GET /wallets/topup-requests — topup talepleri
- GET /wallets/withdrawal-requests — çekim talepleri

DOSYA #91: apps/financial-service/src/modules/wallet/presentation/account.controller.ts
- GET /accounts — hesap listesi
- GET /accounts/:type — belirli hesap türü
- GET /accounts/:id/transactions — hesap hareketleri
- GET /accounts/:id/holds — aktif hold'lar
- Admin endpoints:
  - POST /admin/topup-requests/:id/approve — @Roles('ADMIN')
  - POST /admin/topup-requests/:id/reject — @Roles('ADMIN')
  - POST /admin/withdrawal-requests/:id/approve — @Roles('ADMIN')
  - POST /admin/withdrawal-requests/:id/reject — @Roles('ADMIN')

DOSYA #92: apps/financial-service/src/modules/wallet/presentation/wallet.grpc.controller.ts
- gRPC WalletService implementasyonu
- @GrpcMethod() decorator'ları
- GetBalance, CreateWallet, TopupWallet, TransferFunds, GetAccount

DOSYA #93: apps/financial-service/src/modules/wallet/wallet.module.ts

=== LEDGER MODULE ===

DOSYA #94: apps/financial-service/src/modules/ledger/domain/enums/ledger-type.enum.ts
DOSYA #95: apps/financial-service/src/modules/ledger/domain/entities/general-ledger-entry.entity.ts
- GeneralLedgerEntry extends Entity
- Props: type, debitAccountId, creditAccountId, amount, actorId, note, payload, refType, referenceId
- IMMUTABLE — oluşturulduktan sonra değiştirilemez

DOSYA #96: apps/financial-service/src/modules/ledger/domain/entities/user-ledger-entry.entity.ts
DOSYA #97: apps/financial-service/src/modules/ledger/domain/value-objects/ledger-type.vo.ts
DOSYA #98: apps/financial-service/src/modules/ledger/domain/repositories/general-ledger.repository.interface.ts
- create(): tek metod — güncelleme/silme YOK
- findByAccount(accountId): hesaba ait kayıtlar
- findByReference(refType, referenceId): referansa ait kayıtlar
- getBalanceSheet(): debit/credit toplamları
DOSYA #99: apps/financial-service/src/modules/ledger/domain/repositories/user-ledger.repository.interface.ts

DOSYA #100: apps/financial-service/src/modules/ledger/application/commands/record-entry.command.ts
DOSYA #101: apps/financial-service/src/modules/ledger/application/commands/record-entry.handler.ts
- Double-entry: her çağrıda HEM debit HEM credit oluşturulmalı
- debit toplamı === credit toplamı kontrolü (invariant)

DOSYA #102: apps/financial-service/src/modules/ledger/application/commands/reconcile.command.ts
DOSYA #103: apps/financial-service/src/modules/ledger/application/commands/reconcile.handler.ts
- Account balance vs ledger toplamı karşılaştır
- Uyumsuzluk varsa alert oluştur, isDirty = true yap

DOSYA #104: apps/financial-service/src/modules/ledger/application/queries/get-ledger-entries.query.ts
DOSYA #105: apps/financial-service/src/modules/ledger/application/queries/get-ledger-entries.handler.ts
DOSYA #106: apps/financial-service/src/modules/ledger/application/queries/get-balance-sheet.query.ts
DOSYA #107: apps/financial-service/src/modules/ledger/application/queries/get-balance-sheet.handler.ts

DOSYA #108: apps/financial-service/src/modules/ledger/application/dtos/record-entry.dto.ts
DOSYA #109: apps/financial-service/src/modules/ledger/application/dtos/ledger-entry-response.dto.ts
DOSYA #110: apps/financial-service/src/modules/ledger/application/dtos/balance-sheet-response.dto.ts

DOSYA #111: apps/financial-service/src/modules/ledger/infrastructure/persistence/prisma-general-ledger.repository.ts
- INSERT only — update/delete metodu YOK
DOSYA #112: apps/financial-service/src/modules/ledger/infrastructure/persistence/prisma-user-ledger.repository.ts
DOSYA #113: apps/financial-service/src/modules/ledger/infrastructure/persistence/mappers/general-ledger.mapper.ts
DOSYA #114: apps/financial-service/src/modules/ledger/infrastructure/persistence/mappers/user-ledger.mapper.ts
DOSYA #115: apps/financial-service/src/modules/ledger/presentation/ledger.controller.ts
- @Roles('ADMIN') — sadece admin erişimi
- GET /ledger — genel muhasebe kayıtları (paginated, filtrelenebilir)
- GET /ledger/balance-sheet — bilanço
- POST /ledger/reconcile — mutabakat çalıştır
DOSYA #116: apps/financial-service/src/modules/ledger/ledger.module.ts

=== COMMISSION MODULE ===

DOSYA #117: apps/financial-service/src/modules/commission/domain/entities/commission-record.entity.ts
DOSYA #118: apps/financial-service/src/modules/commission/domain/value-objects/commission-rate.vo.ts
- CommissionRate extends ValueObject
- Props: cashRate (Decimal), barterRate (Decimal)
- Tier'a göre farklı oranlar hesapla
DOSYA #119: apps/financial-service/src/modules/commission/domain/repositories/commission.repository.interface.ts
DOSYA #120: apps/financial-service/src/modules/commission/domain/services/commission-calculator.service.ts
- calculateForOrder(vendorTier, baseAmount, commissionType): CommissionResult
- TierBenefit tablosundan vendor tier'a göre oran al
- CORE: %10, PLUS: %8, PREMIUM: %6, ELITE: %4 (cash)
- Barter komisyon oranları farklı

DOSYA #121: apps/financial-service/src/modules/commission/application/commands/calculate-commission.command.ts
DOSYA #122: apps/financial-service/src/modules/commission/application/commands/calculate-commission.handler.ts
- Komisyon hesapla, CommissionRecord kaydet
- Vendor account'tan komisyon düş (DEBIT)
- Platform COMMISSION account'a ekle (CREDIT)
- Ledger'a çift kayıt yaz

DOSYA #123: apps/financial-service/src/modules/commission/application/queries/get-commission-rates.query.ts
DOSYA #124: apps/financial-service/src/modules/commission/application/queries/get-commission-rates.handler.ts

DOSYA #125: apps/financial-service/src/modules/commission/application/event-handlers/order-completed.handler.ts
- RabbitMQ'dan order.completed event'i dinle
- CalculateCommissionCommand dispatch et

DOSYA #126: apps/financial-service/src/modules/commission/application/event-handlers/barter-completed.handler.ts
- RabbitMQ'dan barter.completed event'i dinle
- Barter komisyon hesapla

DOSYA #127: apps/financial-service/src/modules/commission/application/dtos/calculate-commission.dto.ts
DOSYA #128: apps/financial-service/src/modules/commission/application/dtos/commission-response.dto.ts

DOSYA #129: apps/financial-service/src/modules/commission/infrastructure/persistence/prisma-commission.repository.ts
DOSYA #130: apps/financial-service/src/modules/commission/infrastructure/persistence/mappers/commission.mapper.ts
DOSYA #131: apps/financial-service/src/modules/commission/presentation/commission.controller.ts
- @Roles('ADMIN')
- GET /commissions — komisyon kayıtları (paginated)
- GET /commissions/rates — güncel komisyon oranları
- GET /commissions/vendor/:vendorId — vendor bazlı komisyon özeti
DOSYA #132: apps/financial-service/src/modules/commission/commission.module.ts

=== ESCROW MODULE ===

DOSYA #133: apps/financial-service/src/modules/escrow/domain/enums/escrow-status.enum.ts
DOSYA #134: apps/financial-service/src/modules/escrow/domain/entities/escrow.entity.ts
- Escrow extends AggregateRoot
- Props: orderId, buyerId, sellerId, amount, status, releasedAmount, payoutLog
- static create(): status = PENDING
- fund(): status PENDING → FUNDED, buyer account'tan hold
- release(amount): FUNDED → RELEASED/PARTIALLY_RELEASED
- refund(): → REFUNDED, buyer'a geri iade
- dispute(): → DISPUTED

DOSYA #135: apps/financial-service/src/modules/escrow/domain/events/escrow-created.event.ts
DOSYA #136: apps/financial-service/src/modules/escrow/domain/events/funds-held.event.ts
DOSYA #137: apps/financial-service/src/modules/escrow/domain/events/funds-released.event.ts
DOSYA #138: apps/financial-service/src/modules/escrow/domain/events/funds-refunded.event.ts
DOSYA #139: apps/financial-service/src/modules/escrow/domain/repositories/escrow.repository.interface.ts

DOSYA #140: apps/financial-service/src/modules/escrow/application/commands/create-escrow.command.ts
DOSYA #141: apps/financial-service/src/modules/escrow/application/commands/create-escrow.handler.ts
DOSYA #142: apps/financial-service/src/modules/escrow/application/commands/hold-funds.command.ts
DOSYA #143: apps/financial-service/src/modules/escrow/application/commands/hold-funds.handler.ts
- Account'tan availableBalance düş, blockedBalance artır
- AccountHold kaydı oluştur
- Ledger'a kayıt

DOSYA #144: apps/financial-service/src/modules/escrow/application/commands/release-funds.command.ts
DOSYA #145: apps/financial-service/src/modules/escrow/application/commands/release-funds.handler.ts
- Saga pattern kullan:
  Step 1: Hold'u release et (blockedBalance azalt)
  Step 2: Seller account'a credit et
  Step 3: Komisyon hesapla ve düş
  Step 4: Ledger'a çift kayıt
  Step 5: Outbox'a FundsReleased event
  Herhangi bir adım başarısız → tüm adımları geri al

DOSYA #146: apps/financial-service/src/modules/escrow/application/commands/refund-funds.command.ts
DOSYA #147: apps/financial-service/src/modules/escrow/application/commands/refund-funds.handler.ts

DOSYA #148: apps/financial-service/src/modules/escrow/application/queries/get-escrow.query.ts
DOSYA #149: apps/financial-service/src/modules/escrow/application/queries/get-escrow.handler.ts

DOSYA #150: apps/financial-service/src/modules/escrow/application/event-handlers/order-created.handler.ts
- RabbitMQ: order.created → CreateEscrow + HoldFunds
DOSYA #151: apps/financial-service/src/modules/escrow/application/event-handlers/barter-accepted.handler.ts
- RabbitMQ: barter.accepted → iki taraf için de hold oluştur (collateral)
DOSYA #152: apps/financial-service/src/modules/escrow/application/event-handlers/shipment-delivered.handler.ts
- RabbitMQ: shipment.delivered → ReleaseFunds (dispute window sonrası)

DOSYA #153: apps/financial-service/src/modules/escrow/application/dtos/create-escrow.dto.ts
DOSYA #154: apps/financial-service/src/modules/escrow/application/dtos/escrow-response.dto.ts

DOSYA #155: apps/financial-service/src/modules/escrow/infrastructure/persistence/prisma-escrow.repository.ts
DOSYA #156: apps/financial-service/src/modules/escrow/infrastructure/persistence/mappers/escrow.mapper.ts

DOSYA #157: apps/financial-service/src/modules/escrow/presentation/escrow.controller.ts
- GET /escrows/:id — escrow detayı
- GET /escrows/order/:orderId — siparişe ait escrow
- Admin:
  - POST /admin/escrows/:id/release — @Roles('ADMIN'), manuel release
  - POST /admin/escrows/:id/refund — @Roles('ADMIN'), manuel refund

DOSYA #158: apps/financial-service/src/modules/escrow/presentation/escrow.grpc.controller.ts
- gRPC EscrowService implementasyonu

DOSYA #159: apps/financial-service/src/modules/escrow/escrow.module.ts
```

### KONTROL

Tüm dosyaları yazdıktan sonra şunları kontrol et:
1. Her dosyanın başında tam path var mı?
2. Tüm amount hesaplamaları Decimal ile mi yapılıyor (float/number YASAK)?
3. Tüm write endpoint'lerde idempotency key zorunlu mu?
4. Double-entry: her finansal işlemde debit === credit kontrolü var mı?
5. Audit log: tüm finansal mutasyonlarda log yazılıyor mu?
6. Ledger repository'de UPDATE/DELETE metodu YOK mu?
7. AuditLog repository'de UPDATE/DELETE metodu YOK mu?
8. gRPC proto dosyası ile gRPC controller'lar uyumlu mu?
9. RabbitMQ event handler'ları doğru exchange ve routing key kullanıyor mu?
10. Prisma transaction kullanılması gereken yerlerde ($transaction) kullanılmış mı?
11. Saga pattern'da compensate() mantığı tanımlı mı?
12. TypeScript strict mode'da derlenir mi?

Sorun varsa düzelt ve açıkla.

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (Gemini'ye yapıştırma, senin için)

Bu prompt 159 dosya içeriyor — en büyük faz. Gemini kesinlikle kesecek.
Parçalı verme planı:

- Birinci mesaj: Dosya #1 — #21 (config + proto + common)
- İkinci mesaj: Dosya #22 — #56 (wallet domain + DTOs)
- Üçüncü mesaj: Dosya #57 — #93 (wallet commands + queries + infra + presentation)
- Dördüncü mesaj: Dosya #94 — #132 (ledger + commission modülleri)
- Beşinci mesaj: Dosya #133 — #159 (escrow modülü)

Her parçada system prompt'u TEKRAR VER.
Her parçanın başına "Devam ediyoruz. Dosya #XX'ten başla." yaz.

Gemini yazdıktan sonra çıktıyı Claude'a gönder, review edeyim:
- Double-entry tutarlılığı
- Saga compensate mantığı
- Idempotency uygulaması
- gRPC ↔ controller uyumu
- Decimal kullanımı (float sızması var mı)
