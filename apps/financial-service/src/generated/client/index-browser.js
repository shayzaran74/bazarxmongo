
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
  EFT: 'EFT',
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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
