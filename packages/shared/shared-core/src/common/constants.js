"use strict";
// packages/shared/shared-core/src/common/constants.ts
// BazarX paylaşılan sabitler — zaman, iş kuralları, limit değerleri
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADVERTISING_XP_TTL_MONTHS = exports.ORDER_NUMBER_MAX = exports.ORDER_NUMBER_MIN = exports.GRPC_DEFAULT_TIMEOUT_MS = exports.CIRCUIT_BREAKER_ERROR_THRESHOLD_PCT = exports.CIRCUIT_BREAKER_RESET_MS = exports.CIRCUIT_BREAKER_TIMEOUT_MS = exports.DEFAULT_TOP_PRODUCTS_LIMIT = exports.DEFAULT_AUDIT_LOG_LIMIT = exports.DEFAULT_PAGE_SIZE = exports.LOYALTY_TIER_THRESHOLDS = exports.LOYALTY_XP_LEVELS = exports.VENDOR_XP_EARN_RATES = exports.VENDOR_POOL_LIMITS = exports.VENDOR_ANNUAL_FEES = exports.POOL_DEPOSIT_QUOTA_MAX_PCT = exports.POOL_DEPOSIT_XP_MAX_PCT = exports.ADVERTISING_XP_MAX_PCT = exports.XP_SUBSIDY_MAX_PCT = exports.GROUP_COMMISSION_RATES = exports.COMMISSION_RATES = exports.OUTBOX_MAX_RETRIES = exports.OUTBOX_BATCH_SIZE = exports.OUTBOX_POLL_INTERVAL_MS = exports.TRUST_SCORE_INITIAL_DELAY_MS = exports.TRUST_SCORE_RECALC_INTERVAL_MS = exports.SUBSCRIPTION_CHECK_INTERVAL_MS = exports.TRADE_OFFER_DEFAULT_TTL_MS = exports.TOKEN_BLACKLIST_TTL_MS = exports.ORDER_EXPIRY_CHECK_INTERVAL_MS = exports.ORDER_PAYMENT_EXPIRY_MS = exports.MS_WEEK = exports.MS_DAY = exports.MS_HOUR = exports.MS_MINUTE = exports.MS_SECOND = void 0;
// ─── Zaman Sabitleri (ms) ───────────────────────────────────────
exports.MS_SECOND = 1_000;
exports.MS_MINUTE = 60 * exports.MS_SECOND;
exports.MS_HOUR = 60 * exports.MS_MINUTE;
exports.MS_DAY = 24 * exports.MS_HOUR;
exports.MS_WEEK = 7 * exports.MS_DAY;
// Sipariş
exports.ORDER_PAYMENT_EXPIRY_MS = 30 * exports.MS_MINUTE; // Sipariş ödeme süresi
exports.ORDER_EXPIRY_CHECK_INTERVAL_MS = 5 * exports.MS_MINUTE; // expiry kontrolü
// Token
exports.TOKEN_BLACKLIST_TTL_MS = 7 * exports.MS_WEEK; // Refresh token blacklist
// Takas
exports.TRADE_OFFER_DEFAULT_TTL_MS = 7 * exports.MS_DAY; // Teklif varsayılan süresi
// Abonelik
exports.SUBSCRIPTION_CHECK_INTERVAL_MS = 60 * exports.MS_MINUTE; // Abonelik kontrolü
// Güven skoru
exports.TRUST_SCORE_RECALC_INTERVAL_MS = 24 * exports.MS_HOUR; // Günlük güncelleme
exports.TRUST_SCORE_INITIAL_DELAY_MS = 30_000; // İlk çalışma gecikmesi
// Outbox
exports.OUTBOX_POLL_INTERVAL_MS = 5_000; // Mesaj polling
exports.OUTBOX_BATCH_SIZE = 100; // Batch işleme
exports.OUTBOX_MAX_RETRIES = 3; // Maks retry
// ─── Komisyon Oranları (%) ─────────────────────────────────────
exports.COMMISSION_RATES = {
    CORE: 12.0,
    PRIME: 10.0,
    ELITE: 8.0,
    APEX: 6.0,
};
exports.GROUP_COMMISSION_RATES = {
    CORE: 9.0,
    PRIME: 8.0,
    ELITE: 7.0,
    APEX: 6.0,
};
// ─── XP Kuralları ───────────────────────────────────────────────
exports.XP_SUBSIDY_MAX_PCT = 0.50; // Komisyon subsidize max %50
exports.ADVERTISING_XP_MAX_PCT = 0.25; // Reklam XP max %25
exports.POOL_DEPOSIT_XP_MAX_PCT = 0.25; // Havuz depo XP max %25
exports.POOL_DEPOSIT_QUOTA_MAX_PCT = 0.30; // Havuz kota max %30
// ─── Vendor Tier Eşikleri ──────────────────────────────────────
exports.VENDOR_ANNUAL_FEES = {
    CORE: 12_000,
    PRIME: 48_000,
    ELITE: 120_000,
    APEX: 300_000,
};
exports.VENDOR_POOL_LIMITS = {
    CORE: 150_000,
    PRIME: 500_000,
    ELITE: 1_500_000,
    APEX: 10_000_000,
};
exports.VENDOR_XP_EARN_RATES = {
    CORE: 50,
    PRIME: 70,
    ELITE: 85,
    APEX: 100,
};
// ─── Loyalty XP Seviyeleri ─────────────────────────────────────
exports.LOYALTY_XP_LEVELS = [1_000, 5_000, 15_000, 50_000];
exports.LOYALTY_TIER_THRESHOLDS = {
    BRONZE: 1_000,
    SILVER: 5_000,
    GOLD: 25_000,
    PLATINUM: 100_000,
    DIAMOND: 500_000,
};
// ─── Sayfalama ──────────────────────────────────────────────────
exports.DEFAULT_PAGE_SIZE = 20;
exports.DEFAULT_AUDIT_LOG_LIMIT = 10;
exports.DEFAULT_TOP_PRODUCTS_LIMIT = 5;
// ─── Resilience ────────────────────────────────────────────────
exports.CIRCUIT_BREAKER_TIMEOUT_MS = 3_000;
exports.CIRCUIT_BREAKER_RESET_MS = 30_000;
exports.CIRCUIT_BREAKER_ERROR_THRESHOLD_PCT = 50;
exports.GRPC_DEFAULT_TIMEOUT_MS = 5_000;
// ─── Sipariş Numarası ───────────────────────────────────────────
exports.ORDER_NUMBER_MIN = 10_000;
exports.ORDER_NUMBER_MAX = 99_999;
// ─── Reklâm XP TTL ─────────────────────────────────────────────
exports.ADVERTISING_XP_TTL_MONTHS = 6;
//# sourceMappingURL=constants.js.map