// packages/shared/shared-core/src/common/constants.ts
// BazarX paylaşılan sabitler — zaman, iş kuralları, limit değerleri

// ─── Zaman Sabitleri (ms) ───────────────────────────────────────
export const MS_SECOND = 1_000
export const MS_MINUTE = 60 * MS_SECOND
export const MS_HOUR = 60 * MS_MINUTE
export const MS_DAY = 24 * MS_HOUR
export const MS_WEEK = 7 * MS_DAY

// Sipariş
export const ORDER_PAYMENT_EXPIRY_MS = 30 * MS_MINUTE // Sipariş ödeme süresi
export const ORDER_EXPIRY_CHECK_INTERVAL_MS = 5 * MS_MINUTE // expiry kontrolü

// Token
export const TOKEN_BLACKLIST_TTL_MS = 7 * MS_WEEK // Refresh token blacklist

// Takas
export const TRADE_OFFER_DEFAULT_TTL_MS = 7 * MS_DAY // Teklif varsayılan süresi

// Abonelik
export const SUBSCRIPTION_CHECK_INTERVAL_MS = 60 * MS_MINUTE // Abonelik kontrolü

// Güven skoru
export const TRUST_SCORE_RECALC_INTERVAL_MS = 24 * MS_HOUR // Günlük güncelleme
export const TRUST_SCORE_INITIAL_DELAY_MS = 30_000 // İlk çalışma gecikmesi

// Outbox
export const OUTBOX_POLL_INTERVAL_MS = 5_000 // Mesaj polling
export const OUTBOX_BATCH_SIZE = 100 // Batch işleme
export const OUTBOX_MAX_RETRIES = 3 // Maks retry

// ─── Komisyon Oranları (%) ─────────────────────────────────────
export const COMMISSION_RATES = {
  CORE: 12.0,
  PRIME: 10.0,
  ELITE: 8.0,
  APEX: 6.0,
} as const

export const GROUP_COMMISSION_RATES = {
  CORE: 9.0,
  PRIME: 8.0,
  ELITE: 7.0,
  APEX: 6.0,
} as const

// ─── XP Kuralları ───────────────────────────────────────────────
export const XP_SUBSIDY_MAX_PCT = 0.50 // Komisyon subsidize max %50
export const ADVERTISING_XP_MAX_PCT = 0.25 // Reklam XP max %25
export const POOL_DEPOSIT_XP_MAX_PCT = 0.25 // Havuz depo XP max %25
export const POOL_DEPOSIT_QUOTA_MAX_PCT = 0.30 // Havuz kota max %30

// ─── Vendor Tier Eşikleri ──────────────────────────────────────
export const VENDOR_ANNUAL_FEES = {
  CORE: 12_000,
  PRIME: 48_000,
  ELITE: 120_000,
  APEX: 300_000,
} as const

export const VENDOR_POOL_LIMITS = {
  CORE: 150_000,
  PRIME: 500_000,
  ELITE: 1_500_000,
  APEX: 10_000_000,
} as const

export const VENDOR_XP_EARN_RATES = {
  CORE: 50,
  PRIME: 70,
  ELITE: 85,
  APEX: 100,
} as const

// ─── Loyalty XP Seviyeleri ─────────────────────────────────────
export const LOYALTY_XP_LEVELS = [1_000, 5_000, 15_000, 50_000] as const

export const LOYALTY_TIER_THRESHOLDS = {
  BRONZE: 1_000,
  SILVER: 5_000,
  GOLD: 25_000,
  PLATINUM: 100_000,
  DIAMOND: 500_000,
} as const

// ─── Sayfalama ──────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_AUDIT_LOG_LIMIT = 10
export const DEFAULT_TOP_PRODUCTS_LIMIT = 5

// ─── Resilience ────────────────────────────────────────────────
export const CIRCUIT_BREAKER_TIMEOUT_MS = 3_000
export const CIRCUIT_BREAKER_RESET_MS = 30_000
export const CIRCUIT_BREAKER_ERROR_THRESHOLD_PCT = 50

export const GRPC_DEFAULT_TIMEOUT_MS = 5_000

// ─── Sipariş Numarası ───────────────────────────────────────────
export const ORDER_NUMBER_MIN = 10_000
export const ORDER_NUMBER_MAX = 99_999

// ─── Reklâm XP TTL ─────────────────────────────────────────────
export const ADVERTISING_XP_TTL_MONTHS = 6