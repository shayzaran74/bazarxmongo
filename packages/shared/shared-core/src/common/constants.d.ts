export declare const MS_SECOND = 1000;
export declare const MS_MINUTE: number;
export declare const MS_HOUR: number;
export declare const MS_DAY: number;
export declare const MS_WEEK: number;
export declare const ORDER_PAYMENT_EXPIRY_MS: number;
export declare const ORDER_EXPIRY_CHECK_INTERVAL_MS: number;
export declare const TOKEN_BLACKLIST_TTL_MS: number;
export declare const TRADE_OFFER_DEFAULT_TTL_MS: number;
export declare const SUBSCRIPTION_CHECK_INTERVAL_MS: number;
export declare const TRUST_SCORE_RECALC_INTERVAL_MS: number;
export declare const TRUST_SCORE_INITIAL_DELAY_MS = 30000;
export declare const OUTBOX_POLL_INTERVAL_MS = 5000;
export declare const OUTBOX_BATCH_SIZE = 100;
export declare const OUTBOX_MAX_RETRIES = 3;
export declare const COMMISSION_RATES: {
    readonly CORE: 12;
    readonly PRIME: 10;
    readonly ELITE: 8;
    readonly APEX: 6;
};
export declare const GROUP_COMMISSION_RATES: {
    readonly CORE: 9;
    readonly PRIME: 8;
    readonly ELITE: 7;
    readonly APEX: 6;
};
export declare const XP_SUBSIDY_MAX_PCT = 0.5;
export declare const ADVERTISING_XP_MAX_PCT = 0.25;
export declare const POOL_DEPOSIT_XP_MAX_PCT = 0.25;
export declare const POOL_DEPOSIT_QUOTA_MAX_PCT = 0.3;
export declare const VENDOR_ANNUAL_FEES: {
    readonly CORE: 12000;
    readonly PRIME: 48000;
    readonly ELITE: 120000;
    readonly APEX: 300000;
};
export declare const VENDOR_POOL_LIMITS: {
    readonly CORE: 150000;
    readonly PRIME: 500000;
    readonly ELITE: 1500000;
    readonly APEX: 10000000;
};
export declare const VENDOR_XP_EARN_RATES: {
    readonly CORE: 50;
    readonly PRIME: 70;
    readonly ELITE: 85;
    readonly APEX: 100;
};
export declare const LOYALTY_XP_LEVELS: readonly [1000, 5000, 15000, 50000];
export declare const LOYALTY_TIER_THRESHOLDS: {
    readonly BRONZE: 1000;
    readonly SILVER: 5000;
    readonly GOLD: 25000;
    readonly PLATINUM: 100000;
    readonly DIAMOND: 500000;
};
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const DEFAULT_AUDIT_LOG_LIMIT = 10;
export declare const DEFAULT_TOP_PRODUCTS_LIMIT = 5;
export declare const CIRCUIT_BREAKER_TIMEOUT_MS = 3000;
export declare const CIRCUIT_BREAKER_RESET_MS = 30000;
export declare const CIRCUIT_BREAKER_ERROR_THRESHOLD_PCT = 50;
export declare const GRPC_DEFAULT_TIMEOUT_MS = 5000;
export declare const ORDER_NUMBER_MIN = 10000;
export declare const ORDER_NUMBER_MAX = 99999;
export declare const ADVERTISING_XP_TTL_MONTHS = 6;
