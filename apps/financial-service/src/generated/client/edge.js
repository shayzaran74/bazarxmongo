
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/edge.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  balanceTL: 'balanceTL',
  barterBalance: 'barterBalance',
  lastXpAdsEarnedDate: 'lastXpAdsEarnedDate',
  userId: 'userId',
  xpAdsBalance: 'xpAdsBalance',
  xpCommissionBalance: 'xpCommissionBalance',
  xpPoints: 'xpPoints',
  xpTradeBalance: 'xpTradeBalance'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  type: 'type',
  currency: 'currency',
  balance: 'balance',
  status: 'status',
  availableBalance: 'availableBalance',
  blockedBalance: 'blockedBalance',
  createdAt: 'createdAt',
  creditLimit: 'creditLimit',
  isDirty: 'isDirty',
  lastReconciledAt: 'lastReconciledAt',
  ownerType: 'ownerType',
  updatedAt: 'updatedAt',
  userId: 'userId',
  vendorTier: 'vendorTier'
};

exports.Prisma.AccountTransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  direction: 'direction',
  amount: 'amount',
  description: 'description',
  status: 'status',
  metadata: 'metadata',
  accountId: 'accountId',
  createdAt: 'createdAt',
  idempotencyKey: 'idempotencyKey',
  referenceId: 'referenceId',
  referenceType: 'referenceType',
  settledAt: 'settledAt'
};

exports.Prisma.AccountHoldScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  reason: 'reason',
  status: 'status',
  notes: 'notes',
  accountId: 'accountId',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  expiresAt: 'expiresAt',
  idempotencyKey: 'idempotencyKey',
  referenceId: 'referenceId',
  referenceType: 'referenceType',
  releasedAt: 'releasedAt',
  releasedBy: 'releasedBy',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountTopUpRequestScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  notes: 'notes',
  accountId: 'accountId',
  createdAt: 'createdAt',
  paymentMethod: 'paymentMethod',
  paymentReference: 'paymentReference',
  processedAt: 'processedAt',
  processedBy: 'processedBy',
  rejectionReason: 'rejectionReason',
  updatedAt: 'updatedAt',
  userId: 'userId',
  status: 'status'
};

exports.Prisma.AccountWithdrawalRequestScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  iban: 'iban',
  accountHolder: 'accountHolder',
  accountId: 'accountId',
  bankName: 'bankName',
  createdAt: 'createdAt',
  notes: 'notes',
  processedAt: 'processedAt',
  processedBy: 'processedBy',
  rejectionReason: 'rejectionReason',
  updatedAt: 'updatedAt',
  userId: 'userId',
  status: 'status'
};

exports.Prisma.GeneralLedgerScalarFieldEnum = {
  id: 'id',
  type: 'type',
  payload: 'payload',
  note: 'note',
  actorId: 'actorId',
  amount: 'amount',
  createdAt: 'createdAt',
  creditAccountId: 'creditAccountId',
  debitAccountId: 'debitAccountId',
  refType: 'refType',
  referenceId: 'referenceId'
};

exports.Prisma.UserLedgerEntryScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  currency: 'currency',
  description: 'description',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  referenceId: 'referenceId',
  userId: 'userId'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  orderId: 'orderId',
  amount: 'amount',
  paymentType: 'paymentType',
  paymentMethod: 'paymentMethod',
  status: 'status',
  metadata: 'metadata',
  paidAt: 'paidAt',
  failedAt: 'failedAt',
  failureReason: 'failureReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  accountTransactionId: 'accountTransactionId'
};

exports.Prisma.EscrowScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  buyerId: 'buyerId',
  sellerId: 'sellerId',
  amount: 'amount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  releasedAt: 'releasedAt',
  payoutLog: 'payoutLog',
  releasedAmount: 'releasedAmount',
  status: 'status'
};

exports.Prisma.TransactionHistoryScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  amount: 'amount',
  xpAmount: 'xpAmount',
  type: 'type',
  status: 'status',
  referenceId: 'referenceId',
  createdAt: 'createdAt'
};

exports.Prisma.GiftCardScalarFieldEnum = {
  id: 'id',
  code: 'code',
  status: 'status',
  note: 'note',
  createdAt: 'createdAt',
  currentValue: 'currentValue',
  customerId: 'customerId',
  expiresAt: 'expiresAt',
  initialValue: 'initialValue',
  updatedAt: 'updatedAt'
};

exports.Prisma.GiftCardTransactionScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  note: 'note',
  createdAt: 'createdAt',
  giftCardId: 'giftCardId',
  orderId: 'orderId'
};

exports.Prisma.WithdrawalVerificationScalarFieldEnum = {
  id: 'id',
  token: 'token',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  isVerified: 'isVerified',
  userId: 'userId',
  verifiedAt: 'verifiedAt',
  withdrawalId: 'withdrawalId'
};

exports.Prisma.IdempotencyKeyScalarFieldEnum = {
  key: 'key',
  userId: 'userId',
  result: 'result',
  status: 'status',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.DownPaymentPolicyScalarFieldEnum = {
  id: 'id',
  percentage: 'percentage',
  active: 'active',
  categoryKey: 'categoryKey',
  createdAt: 'createdAt',
  maxAmount: 'maxAmount',
  minAmount: 'minAmount',
  refundDays: 'refundDays',
  requireBalance: 'requireBalance',
  updatedAt: 'updatedAt'
};

exports.Prisma.OutboxMessageScalarFieldEnum = {
  id: 'id',
  aggregateId: 'aggregateId',
  aggregateType: 'aggregateType',
  eventType: 'eventType',
  payload: 'payload',
  status: 'status',
  retryCount: 'retryCount',
  createdAt: 'createdAt',
  processedAt: 'processedAt'
};

exports.Prisma.MembershipTierScalarFieldEnum = {
  id: 'id',
  name: 'name',
  price: 'price',
  minXP: 'minXP',
  benefits: 'benefits',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TierBenefitScalarFieldEnum = {
  id: 'id',
  tier: 'tier',
  annualFee: 'annualFee',
  apiRatePerMin: 'apiRatePerMin',
  archiveAfterDays: 'archiveAfterDays',
  burnRate: 'burnRate',
  commissionBarter: 'commissionBarter',
  commissionCash: 'commissionCash',
  createdAt: 'createdAt',
  excelBatchLimit: 'excelBatchLimit',
  imageCountPerListing: 'imageCountPerListing',
  listingLimit: 'listingLimit',
  roiRate: 'roiRate',
  updatedAt: 'updatedAt',
  xpMultiplier: 'xpMultiplier'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  actorId: 'actorId',
  actorType: 'actorType',
  payload: 'payload',
  previousState: 'previousState',
  newState: 'newState',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  correlationId: 'correlationId',
  createdAt: 'createdAt'
};

exports.Prisma.CommissionRecordScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  tradeOfferId: 'tradeOfferId',
  vendorId: 'vendorId',
  vendorTier: 'vendorTier',
  baseAmount: 'baseAmount',
  commissionRate: 'commissionRate',
  commissionAmount: 'commissionAmount',
  commissionType: 'commissionType',
  status: 'status',
  collectedAt: 'collectedAt',
  createdAt: 'createdAt',
  idempotencyKey: 'idempotencyKey'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.AccountType = exports.$Enums.AccountType = {
  MAIN: 'MAIN',
  ESCROW: 'ESCROW',
  COMMISSION: 'COMMISSION',
  BARTER: 'BARTER',
  AD_BUDGET: 'AD_BUDGET',
  B2B_BARTER: 'B2B_BARTER',
  BONUS: 'BONUS',
  REFUND: 'REFUND',
  XP_ADS: 'XP_ADS',
  XP_COMMISSION: 'XP_COMMISSION',
  XP_TRADE: 'XP_TRADE'
};

exports.WalletCurrency = exports.$Enums.WalletCurrency = {
  TRY: 'TRY',
  BARTER: 'BARTER',
  USD: 'USD',
  EUR: 'EUR'
};

exports.AccountStatus = exports.$Enums.AccountStatus = {
  ACTIVE: 'ACTIVE',
  FROZEN: 'FROZEN',
  CLOSED: 'CLOSED',
  SUSPENDED: 'SUSPENDED'
};

exports.AccountOwnerType = exports.$Enums.AccountOwnerType = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
  PLATFORM: 'PLATFORM'
};

exports.VendorTier = exports.$Enums.VendorTier = {
  CORE: 'CORE',
  PLUS: 'PLUS',
  PREMIUM: 'PREMIUM',
  ELITE: 'ELITE'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER: 'TRANSFER',
  COMMISSION: 'COMMISSION',
  REFUND: 'REFUND',
  HOLD: 'HOLD',
  RELEASE: 'RELEASE',
  PAYMENT: 'PAYMENT',
  TOPUP: 'TOPUP',
  AD_SPEND: 'AD_SPEND',
  AD_EARNING: 'AD_EARNING',
  GIFT_CARD: 'GIFT_CARD',
  BARTER_TRADE: 'BARTER_TRADE',
  BONUS: 'BONUS',
  ADJUSTMENT: 'ADJUSTMENT'
};

exports.TransactionDirection = exports.$Enums.TransactionDirection = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REVERSED: 'REVERSED'
};

exports.HoldReason = exports.$Enums.HoldReason = {
  ESCROW: 'ESCROW',
  AUCTION_BID: 'AUCTION_BID',
  BARTER_COLLATERAL: 'BARTER_COLLATERAL',
  ORDER_RESERVE: 'ORDER_RESERVE',
  DISPUTE: 'DISPUTE',
  ADMIN_HOLD: 'ADMIN_HOLD',
  DOWN_PAYMENT: 'DOWN_PAYMENT'
};

exports.HoldStatus = exports.$Enums.HoldStatus = {
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  EXPIRED: 'EXPIRED',
  FORFEITED: 'FORFEITED',
  CANCELLED: 'CANCELLED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  IYZICO: 'IYZICO',
  BANK_TRANSFER: 'BANK_TRANSFER',
  WALLET: 'WALLET',
  BARTER: 'BARTER',
  GIFT_CARD: 'GIFT_CARD',
  MIXED: 'MIXED'
};

exports.TopUpStatus = exports.$Enums.TopUpStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.WithdrawalStatus = exports.$Enums.WithdrawalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED'
};

exports.LedgerType = exports.$Enums.LedgerType = {
  TRANSFER: 'TRANSFER',
  TRADE_SETTLEMENT: 'TRADE_SETTLEMENT',
  COMMISSION: 'COMMISSION',
  REFUND: 'REFUND',
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT',
  ESCROW_FUND: 'ESCROW_FUND',
  ESCROW_RELEASE: 'ESCROW_RELEASE',
  AD_SPEND: 'AD_SPEND',
  AD_EARNING: 'AD_EARNING',
  XP_CONVERSION: 'XP_CONVERSION',
  DOWN_PAYMENT: 'DOWN_PAYMENT',
  BONUS: 'BONUS'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

exports.EscrowStatus = exports.$Enums.EscrowStatus = {
  PENDING: 'PENDING',
  FUNDED: 'FUNDED',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
  PARTIALLY_RELEASED: 'PARTIALLY_RELEASED',
  CANCELLED: 'CANCELLED'
};

exports.GiftCardStatus = exports.$Enums.GiftCardStatus = {
  Active: 'Active',
  Redeemed: 'Redeemed',
  Expired: 'Expired',
  Cancelled: 'Cancelled'
};

exports.UserTier = exports.$Enums.UserTier = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
  DIAMOND: 'DIAMOND'
};

exports.Prisma.ModelName = {
  Wallet: 'Wallet',
  Account: 'Account',
  AccountTransaction: 'AccountTransaction',
  AccountHold: 'AccountHold',
  AccountTopUpRequest: 'AccountTopUpRequest',
  AccountWithdrawalRequest: 'AccountWithdrawalRequest',
  GeneralLedger: 'GeneralLedger',
  UserLedgerEntry: 'UserLedgerEntry',
  Payment: 'Payment',
  Escrow: 'Escrow',
  TransactionHistory: 'TransactionHistory',
  GiftCard: 'GiftCard',
  GiftCardTransaction: 'GiftCardTransaction',
  WithdrawalVerification: 'WithdrawalVerification',
  IdempotencyKey: 'IdempotencyKey',
  DownPaymentPolicy: 'DownPaymentPolicy',
  OutboxMessage: 'OutboxMessage',
  MembershipTier: 'MembershipTier',
  TierBenefit: 'TierBenefit',
  AuditLog: 'AuditLog',
  CommissionRecord: 'CommissionRecord'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/macbook/Desktop/bazarx/apps/financial-service/src/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/Users/macbook/Desktop/bazarx/apps/financial-service/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "FINANCIAL_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// apps/financial-service/prisma/schema.prisma\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/client\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"FINANCIAL_DATABASE_URL\")\n}\n\n// Wallet — ana cüzdan (XP, barter bakiye, TL bakiye)\nmodel Wallet {\n  id                  String               @id @default(cuid())\n  balanceTL           Decimal              @default(0) @map(\"balance_tl\") @db.Decimal(18, 2)\n  barterBalance       Decimal              @default(0.00) @map(\"barter_balance\") @db.Decimal(15, 2)\n  lastXpAdsEarnedDate DateTime?            @map(\"last_xp_ads_earned_date\")\n  userId              String               @unique @map(\"user_id\")\n  xpAdsBalance        Decimal              @default(0) @map(\"xp_ads_balance\") @db.Decimal(18, 2)\n  xpCommissionBalance Decimal              @default(0) @map(\"xp_commission_balance\") @db.Decimal(18, 2)\n  xpPoints            Int                  @default(0) @map(\"xp_points\")\n  xpTradeBalance      Decimal              @default(0) @map(\"xp_trade_balance\") @db.Decimal(18, 2)\n  transactions        TransactionHistory[]\n\n  @@map(\"wallets\")\n}\n\n// Account — hesap sistemi (TRY, Barter, vs.)\nmodel Account {\n  id                 String                     @id @default(cuid())\n  type               AccountType\n  currency           WalletCurrency             @default(TRY)\n  balance            Decimal                    @default(0) @db.Decimal(18, 2)\n  status             AccountStatus              @default(ACTIVE)\n  availableBalance   Decimal                    @default(0) @map(\"available_balance\") @db.Decimal(18, 2)\n  blockedBalance     Decimal                    @default(0) @map(\"blocked_balance\") @db.Decimal(18, 2)\n  createdAt          DateTime                   @default(now()) @map(\"created_at\")\n  creditLimit        Decimal                    @default(0) @map(\"credit_limit\") @db.Decimal(18, 2)\n  isDirty            Boolean                    @default(true) @map(\"is_dirty\")\n  lastReconciledAt   DateTime?                  @map(\"last_reconciled_at\")\n  ownerType          AccountOwnerType           @default(CUSTOMER) @map(\"owner_type\")\n  updatedAt          DateTime                   @updatedAt @map(\"updated_at\")\n  userId             String                     @map(\"user_id\")\n  vendorTier         VendorTier?                @map(\"vendor_tier\")\n  holds              AccountHold[]\n  topUpRequests      AccountTopUpRequest[]\n  transactions       AccountTransaction[]\n  withdrawalRequests AccountWithdrawalRequest[]\n\n  @@unique([userId, type])\n  @@index([ownerType])\n  @@map(\"accounts\")\n}\n\n// AccountTransaction — hesap hareketleri\nmodel AccountTransaction {\n  id             String               @id @default(cuid())\n  type           TransactionType\n  direction      TransactionDirection\n  amount         Decimal              @db.Decimal(18, 2)\n  description    String?\n  status         TransactionStatus    @default(COMPLETED)\n  metadata       Json?\n  accountId      String               @map(\"account_id\")\n  createdAt      DateTime             @default(now()) @map(\"created_at\")\n  idempotencyKey String?              @unique @map(\"idempotency_key\")\n  referenceId    String?              @map(\"reference_id\")\n  referenceType  String?              @map(\"reference_type\")\n  settledAt      DateTime?            @map(\"settled_at\")\n  account        Account              @relation(fields: [accountId], references: [id], onDelete: Cascade)\n\n  @@index([accountId, createdAt(sort: Desc)])\n  @@index([referenceId, referenceType])\n  @@index([referenceId, type])\n  @@map(\"account_transactions\")\n}\n\n// AccountHold — bloke edilmiş bakiye\nmodel AccountHold {\n  id             String     @id @default(cuid())\n  amount         Decimal    @db.Decimal(18, 2)\n  reason         HoldReason\n  status         HoldStatus @default(ACTIVE)\n  notes          String?\n  accountId      String     @map(\"account_id\")\n  createdAt      DateTime   @default(now()) @map(\"created_at\")\n  createdBy      String?    @map(\"created_by\")\n  expiresAt      DateTime?  @map(\"expires_at\")\n  idempotencyKey String?    @unique @map(\"idempotency_key\")\n  referenceId    String?    @map(\"reference_id\")\n  referenceType  String?    @map(\"reference_type\")\n  releasedAt     DateTime?  @map(\"released_at\")\n  releasedBy     String?    @map(\"released_by\")\n  updatedAt      DateTime   @updatedAt @map(\"updated_at\")\n  account        Account    @relation(fields: [accountId], references: [id], onDelete: Cascade)\n\n  @@index([accountId, status, expiresAt])\n  @@index([referenceType, referenceId])\n  @@map(\"account_holds\")\n}\n\n// AccountTopUpRequest — para yükleme talepleri\nmodel AccountTopUpRequest {\n  id               String        @id @default(cuid())\n  amount           Decimal       @db.Decimal(18, 2)\n  notes            String?\n  accountId        String?       @map(\"account_id\")\n  createdAt        DateTime      @default(now()) @map(\"created_at\")\n  paymentMethod    PaymentMethod @map(\"payment_method\")\n  paymentReference String?       @map(\"payment_reference\")\n  processedAt      DateTime?     @map(\"processed_at\")\n  processedBy      String?       @map(\"processed_by\")\n  rejectionReason  String?       @map(\"rejection_reason\")\n  updatedAt        DateTime      @updatedAt @map(\"updated_at\")\n  userId           String        @map(\"user_id\")\n  status           TopUpStatus   @default(PENDING)\n  account          Account?      @relation(fields: [accountId], references: [id])\n\n  @@index([userId])\n  @@index([accountId])\n  @@map(\"account_top_up_requests\")\n}\n\n// AccountWithdrawalRequest — para çekme talepleri\nmodel AccountWithdrawalRequest {\n  id              String           @id @default(cuid())\n  amount          Decimal          @db.Decimal(18, 2)\n  iban            String\n  accountHolder   String           @map(\"account_holder\")\n  accountId       String?          @map(\"account_id\")\n  bankName        String           @map(\"bank_name\")\n  createdAt       DateTime         @default(now()) @map(\"created_at\")\n  notes           String?\n  processedAt     DateTime?        @map(\"processed_at\")\n  processedBy     String?          @map(\"processed_by\")\n  rejectionReason String?          @map(\"rejection_reason\")\n  updatedAt       DateTime         @updatedAt @map(\"updated_at\")\n  userId          String           @map(\"user_id\")\n  status          WithdrawalStatus @default(PENDING)\n  account         Account?         @relation(fields: [accountId], references: [id])\n\n  @@index([userId])\n  @@index([accountId])\n  @@map(\"account_withdrawal_requests\")\n}\n\n// GeneralLedger — genel muhasebe defteri (çift kayıt)\nmodel GeneralLedger {\n  id              String     @default(cuid())\n  type            LedgerType\n  payload         Json?\n  note            String?\n  actorId         String?    @map(\"actor_id\")\n  amount          Decimal?   @db.Decimal(18, 2)\n  createdAt       DateTime   @default(now()) @map(\"created_at\")\n  creditAccountId String?    @map(\"credit_account_id\")\n  debitAccountId  String?    @map(\"debit_account_id\")\n  refType         String?    @map(\"ref_type\")\n  referenceId     String?    @map(\"reference_id\")\n\n  @@id([id, createdAt])\n  @@index([type, referenceId])\n  @@index([createdAt])\n  @@index([debitAccountId])\n  @@index([creditAccountId])\n  @@map(\"general_ledger\")\n}\n\n// UserLedgerEntry — kullanıcı bazlı muhasebe\nmodel UserLedgerEntry {\n  id          String          @id @default(cuid())\n  type        TransactionType\n  amount      Decimal         @db.Decimal(15, 2)\n  currency    WalletCurrency\n  description String?\n  createdAt   DateTime        @default(now()) @map(\"created_at\")\n  createdBy   String?         @map(\"created_by\")\n  referenceId String?         @map(\"reference_id\")\n  userId      String          @map(\"user_id\")\n\n  @@map(\"user_ledger_entries\")\n}\n\n// Payment — ödeme kayıtları\nmodel Payment {\n  id                   String         @id @default(cuid())\n  userId               String         @map(\"user_id\")\n  orderId              String?        @map(\"order_id\")\n  amount               Decimal        @db.Decimal(18, 2)\n  paymentType          String         @map(\"payment_type\")\n  paymentMethod        PaymentMethod? @map(\"payment_method\")\n  status               PaymentStatus  @default(PENDING)\n  metadata             Json?\n  paidAt               DateTime?      @map(\"paid_at\")\n  failedAt             DateTime?      @map(\"failed_at\")\n  failureReason        String?        @map(\"failure_reason\")\n  createdAt            DateTime       @default(now()) @map(\"created_at\")\n  updatedAt            DateTime       @updatedAt @map(\"updated_at\")\n  accountTransactionId String?        @map(\"account_transaction_id\")\n\n  @@index([userId])\n  @@index([orderId])\n  @@map(\"payments\")\n}\n\n// Escrow — emanet hesap\nmodel Escrow {\n  id             String       @id @default(cuid())\n  orderId        String       @unique @map(\"order_id\")\n  buyerId        String       @map(\"buyer_id\")\n  sellerId       String       @map(\"seller_id\")\n  amount         Decimal      @db.Decimal(18, 2)\n  createdAt      DateTime     @default(now()) @map(\"created_at\")\n  updatedAt      DateTime     @updatedAt @map(\"updated_at\")\n  releasedAt     DateTime?    @map(\"released_at\")\n  payoutLog      Json?        @map(\"payout_log\")\n  releasedAmount Decimal      @default(0) @map(\"released_amount\") @db.Decimal(18, 2)\n  status         EscrowStatus @default(PENDING)\n\n  @@index([buyerId])\n  @@index([sellerId])\n  @@map(\"escrows\")\n}\n\n// TransactionHistory — cüzdan işlem geçmişi\nmodel TransactionHistory {\n  id          String            @id @default(uuid())\n  walletId    String            @map(\"wallet_id\")\n  amount      Decimal           @db.Decimal(15, 2)\n  xpAmount    Int               @default(0) @map(\"xp_amount\")\n  type        String\n  status      TransactionStatus @default(PENDING)\n  referenceId String?           @map(\"reference_id\")\n  createdAt   DateTime          @default(now()) @map(\"created_at\")\n  wallet      Wallet            @relation(fields: [walletId], references: [id])\n\n  @@index([walletId])\n  @@index([createdAt])\n  @@map(\"transaction_history\")\n}\n\n// GiftCard — hediye kartı\nmodel GiftCard {\n  id           String                @id @default(cuid())\n  code         String                @unique\n  status       GiftCardStatus        @default(Active)\n  note         String?\n  createdAt    DateTime              @default(now()) @map(\"created_at\")\n  currentValue Decimal               @map(\"current_value\") @db.Decimal(18, 2)\n  customerId   String?               @map(\"customer_id\")\n  expiresAt    DateTime?             @map(\"expires_at\")\n  initialValue Decimal               @map(\"initial_value\") @db.Decimal(18, 2)\n  updatedAt    DateTime              @updatedAt @map(\"updated_at\")\n  transactions GiftCardTransaction[]\n\n  @@map(\"gift_cards\")\n}\n\n// GiftCardTransaction\nmodel GiftCardTransaction {\n  id         String   @id @default(cuid())\n  amount     Decimal  @db.Decimal(18, 2)\n  note       String?\n  createdAt  DateTime @default(now()) @map(\"created_at\")\n  giftCardId String   @map(\"gift_card_id\")\n  orderId    String?  @map(\"order_id\")\n  giftCard   GiftCard @relation(fields: [giftCardId], references: [id], onDelete: Cascade)\n\n  @@map(\"gift_card_transactions\")\n}\n\n// WithdrawalVerification\nmodel WithdrawalVerification {\n  id           String    @id @default(cuid())\n  token        String    @unique\n  createdAt    DateTime  @default(now()) @map(\"created_at\")\n  expiresAt    DateTime  @map(\"expires_at\")\n  isVerified   Boolean   @default(false) @map(\"is_verified\")\n  userId       String    @unique @map(\"user_id\")\n  verifiedAt   DateTime? @map(\"verified_at\")\n  withdrawalId String    @unique @map(\"withdrawal_id\")\n\n  @@index([userId])\n  @@index([token])\n  @@map(\"withdrawal_verifications\")\n}\n\n// IdempotencyKey\nmodel IdempotencyKey {\n  key       String   @id\n  userId    String?  @map(\"user_id\")\n  result    Json?\n  status    String   @default(\"COMPLETED\")\n  expiresAt DateTime @map(\"expires_at\")\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  @@index([expiresAt])\n  @@map(\"idempotency_keys\")\n}\n\n// DownPaymentPolicy\nmodel DownPaymentPolicy {\n  id             String   @id @default(uuid())\n  percentage     Decimal  @default(25.0) @db.Decimal(5, 2)\n  active         Boolean  @default(true)\n  categoryKey    String   @unique @map(\"category_key\")\n  createdAt      DateTime @default(now()) @map(\"created_at\")\n  maxAmount      Decimal? @map(\"max_amount\") @db.Decimal(19, 4)\n  minAmount      Decimal? @map(\"min_amount\") @db.Decimal(19, 4)\n  refundDays     Int      @default(3) @map(\"refund_days\")\n  requireBalance Boolean  @default(true) @map(\"require_balance\")\n  updatedAt      DateTime @updatedAt @map(\"updated_at\")\n\n  @@map(\"down_payment_policies\")\n}\n\n// OutboxMessage\nmodel OutboxMessage {\n  id            String    @id @default(cuid())\n  aggregateId   String    @map(\"aggregate_id\")\n  aggregateType String    @map(\"aggregate_type\")\n  eventType     String    @map(\"event_type\")\n  payload       Json\n  status        String    @default(\"PENDING\")\n  retryCount    Int       @default(0) @map(\"retry_count\")\n  createdAt     DateTime  @default(now()) @map(\"created_at\")\n  processedAt   DateTime? @map(\"processed_at\")\n\n  @@index([status, createdAt])\n  @@map(\"outbox_messages\")\n}\n\n// MembershipTier\nmodel MembershipTier {\n  id        String   @id @map(\"id\")\n  name      String   @unique @map(\"name\")\n  price     Decimal  @default(0) @map(\"price\") @db.Decimal(18, 2)\n  minXP     Int      @map(\"min_xp\")\n  benefits  Json     @map(\"benefits\")\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @default(now()) @updatedAt @map(\"updated_at\")\n\n  @@map(\"membership_tiers\")\n}\n\n// TierBenefit\nmodel TierBenefit {\n  id                   String   @id @default(cuid())\n  tier                 UserTier @unique\n  annualFee            Decimal  @map(\"annual_fee\") @db.Decimal(18, 2)\n  apiRatePerMin        Int      @map(\"api_rate_per_min\")\n  archiveAfterDays     Int      @map(\"archive_after_days\")\n  burnRate             Decimal  @map(\"burn_rate\") @db.Decimal(5, 2)\n  commissionBarter     Decimal  @map(\"commission_barter\") @db.Decimal(5, 2)\n  commissionCash       Decimal  @map(\"commission_cash\") @db.Decimal(5, 2)\n  createdAt            DateTime @default(now()) @map(\"created_at\")\n  excelBatchLimit      Int      @map(\"excel_batch_limit\")\n  imageCountPerListing Int      @map(\"image_count_per_listing\")\n  listingLimit         Int      @map(\"listing_limit\")\n  roiRate              Decimal  @map(\"roi_rate\") @db.Decimal(5, 2)\n  updatedAt            DateTime @updatedAt @map(\"updated_at\")\n  xpMultiplier         Decimal  @map(\"xp_multiplier\") @db.Decimal(5, 2)\n\n  @@map(\"tier_benefits\")\n}\n\n// AuditLog — tüm finansal işlemlerin değiştirilemez kaydı\nmodel AuditLog {\n  id            String   @id @default(cuid())\n  action        String // TOPUP, WITHDRAW, TRANSFER, HOLD, RELEASE, REFUND, COMMISSION\n  entityType    String   @map(\"entity_type\") // Account, Wallet, Escrow\n  entityId      String   @map(\"entity_id\")\n  actorId       String?  @map(\"actor_id\") // userId veya system\n  actorType     String   @default(\"USER\") @map(\"actor_type\") // USER, SYSTEM, ADMIN\n  payload       Json // işlem detayları\n  previousState Json?    @map(\"previous_state\") // önceki durum\n  newState      Json?    @map(\"new_state\") // sonraki durum\n  ipAddress     String?  @map(\"ip_address\")\n  userAgent     String?  @map(\"user_agent\")\n  correlationId String?  @map(\"correlation_id\")\n  createdAt     DateTime @default(now()) @map(\"created_at\")\n\n  @@index([entityType, entityId])\n  @@index([actorId])\n  @@index([action])\n  @@index([createdAt])\n  @@index([correlationId])\n  @@map(\"audit_logs\")\n}\n\n// CommissionRecord — komisyon hesaplama kayıtları\nmodel CommissionRecord {\n  id               String    @id @default(cuid())\n  orderId          String?   @map(\"order_id\")\n  tradeOfferId     String?   @map(\"trade_offer_id\")\n  vendorId         String    @map(\"vendor_id\")\n  vendorTier       String    @map(\"vendor_tier\")\n  baseAmount       Decimal   @map(\"base_amount\") @db.Decimal(18, 2)\n  commissionRate   Decimal   @map(\"commission_rate\") @db.Decimal(5, 2)\n  commissionAmount Decimal   @map(\"commission_amount\") @db.Decimal(18, 2)\n  commissionType   String    @map(\"commission_type\") // CASH, BARTER\n  status           String    @default(\"CALCULATED\") // CALCULATED, COLLECTED, FAILED\n  collectedAt      DateTime? @map(\"collected_at\")\n  createdAt        DateTime  @default(now()) @map(\"created_at\")\n  idempotencyKey   String?   @unique @map(\"idempotency_key\")\n\n  @@index([vendorId])\n  @@index([orderId])\n  @@index([tradeOfferId])\n  @@index([status])\n  @@map(\"commission_records\")\n}\n\nenum AccountType {\n  MAIN\n  ESCROW\n  COMMISSION\n  BARTER\n  AD_BUDGET\n  B2B_BARTER\n  BONUS\n  REFUND\n  XP_ADS\n  XP_COMMISSION\n  XP_TRADE\n}\n\nenum AccountStatus {\n  ACTIVE\n  FROZEN\n  CLOSED\n  SUSPENDED\n}\n\nenum AccountOwnerType {\n  CUSTOMER\n  VENDOR\n  PLATFORM\n}\n\nenum WalletCurrency {\n  TRY\n  BARTER\n  USD\n  EUR\n}\n\nenum TransactionType {\n  DEPOSIT\n  WITHDRAWAL\n  TRANSFER\n  COMMISSION\n  REFUND\n  HOLD\n  RELEASE\n  PAYMENT\n  TOPUP\n  AD_SPEND\n  AD_EARNING\n  GIFT_CARD\n  BARTER_TRADE\n  BONUS\n  ADJUSTMENT\n}\n\nenum TransactionDirection {\n  CREDIT\n  DEBIT\n}\n\nenum TransactionStatus {\n  PENDING\n  COMPLETED\n  FAILED\n  CANCELLED\n  REVERSED\n}\n\nenum HoldReason {\n  ESCROW\n  AUCTION_BID\n  BARTER_COLLATERAL\n  ORDER_RESERVE\n  DISPUTE\n  ADMIN_HOLD\n  DOWN_PAYMENT\n}\n\nenum HoldStatus {\n  ACTIVE\n  RELEASED\n  EXPIRED\n  FORFEITED\n  CANCELLED\n}\n\nenum PaymentMethod {\n  IYZICO\n  BANK_TRANSFER\n  WALLET\n  BARTER\n  GIFT_CARD\n  MIXED\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n  REFUNDED\n  CANCELLED\n  PARTIALLY_REFUNDED\n}\n\nenum TopUpStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  COMPLETED\n  CANCELLED\n}\n\nenum WithdrawalStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  COMPLETED\n  CANCELLED\n  VERIFICATION_REQUIRED\n}\n\nenum EscrowStatus {\n  PENDING\n  FUNDED\n  RELEASED\n  REFUNDED\n  DISPUTED\n  PARTIALLY_RELEASED\n  CANCELLED\n}\n\nenum GiftCardStatus {\n  Active\n  Redeemed\n  Expired\n  Cancelled\n}\n\nenum LedgerType {\n  TRANSFER\n  TRADE_SETTLEMENT\n  COMMISSION\n  REFUND\n  DEPOSIT\n  WITHDRAWAL\n  ADMIN_ADJUSTMENT\n  ESCROW_FUND\n  ESCROW_RELEASE\n  AD_SPEND\n  AD_EARNING\n  XP_CONVERSION\n  DOWN_PAYMENT\n  BONUS\n}\n\nenum VendorTier {\n  CORE\n  PLUS\n  PREMIUM\n  ELITE\n}\n\nenum UserTier {\n  BRONZE\n  SILVER\n  GOLD\n  PLATINUM\n  DIAMOND\n}\n",
  "inlineSchemaHash": "f32bb57fc6667cdfd508392326023e79fced4df699a2a63f54b2e8d01d9261b1",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Wallet\":{\"dbName\":\"wallets\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"balanceTL\",\"dbName\":\"balance_tl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"barterBalance\",\"dbName\":\"barter_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastXpAdsEarnedDate\",\"dbName\":\"last_xp_ads_earned_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"xpAdsBalance\",\"dbName\":\"xp_ads_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"xpCommissionBalance\",\"dbName\":\"xp_commission_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"xpPoints\",\"dbName\":\"xp_points\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"xpTradeBalance\",\"dbName\":\"xp_trade_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transactions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TransactionHistory\",\"relationName\":\"TransactionHistoryToWallet\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Account\":{\"dbName\":\"accounts\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AccountType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"WalletCurrency\",\"default\":\"TRY\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AccountStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"availableBalance\",\"dbName\":\"available_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"blockedBalance\",\"dbName\":\"blocked_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creditLimit\",\"dbName\":\"credit_limit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDirty\",\"dbName\":\"is_dirty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastReconciledAt\",\"dbName\":\"last_reconciled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownerType\",\"dbName\":\"owner_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AccountOwnerType\",\"default\":\"CUSTOMER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vendorTier\",\"dbName\":\"vendor_tier\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"VendorTier\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"holds\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AccountHold\",\"relationName\":\"AccountToAccountHold\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"topUpRequests\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AccountTopUpRequest\",\"relationName\":\"AccountToAccountTopUpRequest\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transactions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AccountTransaction\",\"relationName\":\"AccountToAccountTransaction\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"withdrawalRequests\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AccountWithdrawalRequest\",\"relationName\":\"AccountToAccountWithdrawalRequest\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"type\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"type\"]}],\"isGenerated\":false},\"AccountTransaction\":{\"dbName\":\"account_transactions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TransactionType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"direction\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TransactionDirection\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TransactionStatus\",\"default\":\"COMPLETED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accountId\",\"dbName\":\"account_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idempotencyKey\",\"dbName\":\"idempotency_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceId\",\"dbName\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceType\",\"dbName\":\"reference_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"settledAt\",\"dbName\":\"settled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"account\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Account\",\"relationName\":\"AccountToAccountTransaction\",\"relationFromFields\":[\"accountId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AccountHold\":{\"dbName\":\"account_holds\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"HoldReason\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"HoldStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accountId\",\"dbName\":\"account_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"dbName\":\"created_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idempotencyKey\",\"dbName\":\"idempotency_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceId\",\"dbName\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceType\",\"dbName\":\"reference_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"releasedAt\",\"dbName\":\"released_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"releasedBy\",\"dbName\":\"released_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"account\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Account\",\"relationName\":\"AccountToAccountHold\",\"relationFromFields\":[\"accountId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AccountTopUpRequest\":{\"dbName\":\"account_top_up_requests\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accountId\",\"dbName\":\"account_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentMethod\",\"dbName\":\"payment_method\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PaymentMethod\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentReference\",\"dbName\":\"payment_reference\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processedAt\",\"dbName\":\"processed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processedBy\",\"dbName\":\"processed_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rejectionReason\",\"dbName\":\"rejection_reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TopUpStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"account\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Account\",\"relationName\":\"AccountToAccountTopUpRequest\",\"relationFromFields\":[\"accountId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AccountWithdrawalRequest\":{\"dbName\":\"account_withdrawal_requests\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"iban\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accountHolder\",\"dbName\":\"account_holder\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accountId\",\"dbName\":\"account_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bankName\",\"dbName\":\"bank_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processedAt\",\"dbName\":\"processed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processedBy\",\"dbName\":\"processed_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rejectionReason\",\"dbName\":\"rejection_reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"WithdrawalStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"account\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Account\",\"relationName\":\"AccountToAccountWithdrawalRequest\",\"relationFromFields\":[\"accountId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GeneralLedger\":{\"dbName\":\"general_ledger\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LedgerType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"dbName\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creditAccountId\",\"dbName\":\"credit_account_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"debitAccountId\",\"dbName\":\"debit_account_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refType\",\"dbName\":\"ref_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceId\",\"dbName\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"id\",\"createdAt\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserLedgerEntry\":{\"dbName\":\"user_ledger_entries\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TransactionType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WalletCurrency\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"dbName\":\"created_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceId\",\"dbName\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Payment\":{\"dbName\":\"payments\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentType\",\"dbName\":\"payment_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentMethod\",\"dbName\":\"payment_method\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PaymentMethod\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PaymentStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paidAt\",\"dbName\":\"paid_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failedAt\",\"dbName\":\"failed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failureReason\",\"dbName\":\"failure_reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"accountTransactionId\",\"dbName\":\"account_transaction_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Escrow\":{\"dbName\":\"escrows\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"buyerId\",\"dbName\":\"buyer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sellerId\",\"dbName\":\"seller_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"releasedAt\",\"dbName\":\"released_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payoutLog\",\"dbName\":\"payout_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"releasedAmount\",\"dbName\":\"released_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EscrowStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TransactionHistory\":{\"dbName\":\"transaction_history\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"walletId\",\"dbName\":\"wallet_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"xpAmount\",\"dbName\":\"xp_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TransactionStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceId\",\"dbName\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"wallet\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Wallet\",\"relationName\":\"TransactionHistoryToWallet\",\"relationFromFields\":[\"walletId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GiftCard\":{\"dbName\":\"gift_cards\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"GiftCardStatus\",\"default\":\"Active\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentValue\",\"dbName\":\"current_value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerId\",\"dbName\":\"customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"initialValue\",\"dbName\":\"initial_value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"transactions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GiftCardTransaction\",\"relationName\":\"GiftCardToGiftCardTransaction\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GiftCardTransaction\":{\"dbName\":\"gift_card_transactions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"giftCardId\",\"dbName\":\"gift_card_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"giftCard\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GiftCard\",\"relationName\":\"GiftCardToGiftCardTransaction\",\"relationFromFields\":[\"giftCardId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WithdrawalVerification\":{\"dbName\":\"withdrawal_verifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isVerified\",\"dbName\":\"is_verified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verifiedAt\",\"dbName\":\"verified_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"withdrawalId\",\"dbName\":\"withdrawal_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"IdempotencyKey\":{\"dbName\":\"idempotency_keys\",\"fields\":[{\"name\":\"key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"result\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"COMPLETED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DownPaymentPolicy\":{\"dbName\":\"down_payment_policies\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"percentage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":25,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryKey\",\"dbName\":\"category_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxAmount\",\"dbName\":\"max_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minAmount\",\"dbName\":\"min_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refundDays\",\"dbName\":\"refund_days\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":3,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requireBalance\",\"dbName\":\"require_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OutboxMessage\":{\"dbName\":\"outbox_messages\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aggregateId\",\"dbName\":\"aggregate_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aggregateType\",\"dbName\":\"aggregate_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventType\",\"dbName\":\"event_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"retryCount\",\"dbName\":\"retry_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processedAt\",\"dbName\":\"processed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"MembershipTier\":{\"dbName\":\"membership_tiers\",\"fields\":[{\"name\":\"id\",\"dbName\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"dbName\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"dbName\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minXP\",\"dbName\":\"min_xp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"benefits\",\"dbName\":\"benefits\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TierBenefit\":{\"dbName\":\"tier_benefits\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tier\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserTier\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"annualFee\",\"dbName\":\"annual_fee\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"apiRatePerMin\",\"dbName\":\"api_rate_per_min\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"archiveAfterDays\",\"dbName\":\"archive_after_days\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"burnRate\",\"dbName\":\"burn_rate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commissionBarter\",\"dbName\":\"commission_barter\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commissionCash\",\"dbName\":\"commission_cash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"excelBatchLimit\",\"dbName\":\"excel_batch_limit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imageCountPerListing\",\"dbName\":\"image_count_per_listing\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"listingLimit\",\"dbName\":\"listing_limit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roiRate\",\"dbName\":\"roi_rate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"xpMultiplier\",\"dbName\":\"xp_multiplier\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AuditLog\":{\"dbName\":\"audit_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityType\",\"dbName\":\"entity_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityId\",\"dbName\":\"entity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"dbName\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorType\",\"dbName\":\"actor_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"USER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"previousState\",\"dbName\":\"previous_state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newState\",\"dbName\":\"new_state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"dbName\":\"ip_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"dbName\":\"user_agent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correlationId\",\"dbName\":\"correlation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CommissionRecord\":{\"dbName\":\"commission_records\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tradeOfferId\",\"dbName\":\"trade_offer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vendorId\",\"dbName\":\"vendor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vendorTier\",\"dbName\":\"vendor_tier\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"baseAmount\",\"dbName\":\"base_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commissionRate\",\"dbName\":\"commission_rate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commissionAmount\",\"dbName\":\"commission_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commissionType\",\"dbName\":\"commission_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"CALCULATED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"collectedAt\",\"dbName\":\"collected_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idempotencyKey\",\"dbName\":\"idempotency_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"AccountType\":{\"values\":[{\"name\":\"MAIN\",\"dbName\":null},{\"name\":\"ESCROW\",\"dbName\":null},{\"name\":\"COMMISSION\",\"dbName\":null},{\"name\":\"BARTER\",\"dbName\":null},{\"name\":\"AD_BUDGET\",\"dbName\":null},{\"name\":\"B2B_BARTER\",\"dbName\":null},{\"name\":\"BONUS\",\"dbName\":null},{\"name\":\"REFUND\",\"dbName\":null},{\"name\":\"XP_ADS\",\"dbName\":null},{\"name\":\"XP_COMMISSION\",\"dbName\":null},{\"name\":\"XP_TRADE\",\"dbName\":null}],\"dbName\":null},\"AccountStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"FROZEN\",\"dbName\":null},{\"name\":\"CLOSED\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null}],\"dbName\":null},\"AccountOwnerType\":{\"values\":[{\"name\":\"CUSTOMER\",\"dbName\":null},{\"name\":\"VENDOR\",\"dbName\":null},{\"name\":\"PLATFORM\",\"dbName\":null}],\"dbName\":null},\"WalletCurrency\":{\"values\":[{\"name\":\"TRY\",\"dbName\":null},{\"name\":\"BARTER\",\"dbName\":null},{\"name\":\"USD\",\"dbName\":null},{\"name\":\"EUR\",\"dbName\":null}],\"dbName\":null},\"TransactionType\":{\"values\":[{\"name\":\"DEPOSIT\",\"dbName\":null},{\"name\":\"WITHDRAWAL\",\"dbName\":null},{\"name\":\"TRANSFER\",\"dbName\":null},{\"name\":\"COMMISSION\",\"dbName\":null},{\"name\":\"REFUND\",\"dbName\":null},{\"name\":\"HOLD\",\"dbName\":null},{\"name\":\"RELEASE\",\"dbName\":null},{\"name\":\"PAYMENT\",\"dbName\":null},{\"name\":\"TOPUP\",\"dbName\":null},{\"name\":\"AD_SPEND\",\"dbName\":null},{\"name\":\"AD_EARNING\",\"dbName\":null},{\"name\":\"GIFT_CARD\",\"dbName\":null},{\"name\":\"BARTER_TRADE\",\"dbName\":null},{\"name\":\"BONUS\",\"dbName\":null},{\"name\":\"ADJUSTMENT\",\"dbName\":null}],\"dbName\":null},\"TransactionDirection\":{\"values\":[{\"name\":\"CREDIT\",\"dbName\":null},{\"name\":\"DEBIT\",\"dbName\":null}],\"dbName\":null},\"TransactionStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"REVERSED\",\"dbName\":null}],\"dbName\":null},\"HoldReason\":{\"values\":[{\"name\":\"ESCROW\",\"dbName\":null},{\"name\":\"AUCTION_BID\",\"dbName\":null},{\"name\":\"BARTER_COLLATERAL\",\"dbName\":null},{\"name\":\"ORDER_RESERVE\",\"dbName\":null},{\"name\":\"DISPUTE\",\"dbName\":null},{\"name\":\"ADMIN_HOLD\",\"dbName\":null},{\"name\":\"DOWN_PAYMENT\",\"dbName\":null}],\"dbName\":null},\"HoldStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"RELEASED\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null},{\"name\":\"FORFEITED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"PaymentMethod\":{\"values\":[{\"name\":\"IYZICO\",\"dbName\":null},{\"name\":\"BANK_TRANSFER\",\"dbName\":null},{\"name\":\"WALLET\",\"dbName\":null},{\"name\":\"BARTER\",\"dbName\":null},{\"name\":\"GIFT_CARD\",\"dbName\":null},{\"name\":\"MIXED\",\"dbName\":null}],\"dbName\":null},\"PaymentStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"REFUNDED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"PARTIALLY_REFUNDED\",\"dbName\":null}],\"dbName\":null},\"TopUpStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"APPROVED\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"WithdrawalStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"APPROVED\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"VERIFICATION_REQUIRED\",\"dbName\":null}],\"dbName\":null},\"EscrowStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"FUNDED\",\"dbName\":null},{\"name\":\"RELEASED\",\"dbName\":null},{\"name\":\"REFUNDED\",\"dbName\":null},{\"name\":\"DISPUTED\",\"dbName\":null},{\"name\":\"PARTIALLY_RELEASED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"GiftCardStatus\":{\"values\":[{\"name\":\"Active\",\"dbName\":null},{\"name\":\"Redeemed\",\"dbName\":null},{\"name\":\"Expired\",\"dbName\":null},{\"name\":\"Cancelled\",\"dbName\":null}],\"dbName\":null},\"LedgerType\":{\"values\":[{\"name\":\"TRANSFER\",\"dbName\":null},{\"name\":\"TRADE_SETTLEMENT\",\"dbName\":null},{\"name\":\"COMMISSION\",\"dbName\":null},{\"name\":\"REFUND\",\"dbName\":null},{\"name\":\"DEPOSIT\",\"dbName\":null},{\"name\":\"WITHDRAWAL\",\"dbName\":null},{\"name\":\"ADMIN_ADJUSTMENT\",\"dbName\":null},{\"name\":\"ESCROW_FUND\",\"dbName\":null},{\"name\":\"ESCROW_RELEASE\",\"dbName\":null},{\"name\":\"AD_SPEND\",\"dbName\":null},{\"name\":\"AD_EARNING\",\"dbName\":null},{\"name\":\"XP_CONVERSION\",\"dbName\":null},{\"name\":\"DOWN_PAYMENT\",\"dbName\":null},{\"name\":\"BONUS\",\"dbName\":null}],\"dbName\":null},\"VendorTier\":{\"values\":[{\"name\":\"CORE\",\"dbName\":null},{\"name\":\"PLUS\",\"dbName\":null},{\"name\":\"PREMIUM\",\"dbName\":null},{\"name\":\"ELITE\",\"dbName\":null}],\"dbName\":null},\"UserTier\":{\"values\":[{\"name\":\"BRONZE\",\"dbName\":null},{\"name\":\"SILVER\",\"dbName\":null},{\"name\":\"GOLD\",\"dbName\":null},{\"name\":\"PLATINUM\",\"dbName\":null},{\"name\":\"DIAMOND\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    FINANCIAL_DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['FINANCIAL_DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.FINANCIAL_DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

