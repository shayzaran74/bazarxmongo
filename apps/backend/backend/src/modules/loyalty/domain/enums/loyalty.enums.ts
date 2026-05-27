// apps/backend/src/modules/loyalty/domain/enums/loyalty.enums.ts

export enum XpSourceType {
  ORDER = 'ORDER',
  BARTER = 'BARTER',
  MISSION = 'MISSION',
  LOGIN = 'LOGIN',
  AD = 'AD',
  REFERRAL = 'REFERRAL',
  ADMIN_MANUAL = 'ADMIN_MANUAL'
}

// XP tabanlı başarı seviyesi (loyalty progression)
export enum LoyaltyTier {
  BRONZE   = 'BRONZE',
  SILVER   = 'SILVER',
  GOLD     = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND  = 'DIAMOND',
}

// Master Plan v4.3 — Ücretli abonelik kademeleri (B2C)
// Her kademenin aylık aidatı ve 2× menü hakkı var
export enum SubscriptionTier {
  BRONZE_P1   = 'BRONZE_P1',    // 199₺/ay
  BRONZE_P2   = 'BRONZE_P2',    // 399₺/ay
  SILVER_P1   = 'SILVER_P1',    // 699₺/ay
  SILVER_P2   = 'SILVER_P2',    // 999₺/ay
  GOLD_P1     = 'GOLD_P1',      // 1.499₺/ay
  GOLD_P2     = 'GOLD_P2',      // 1.999₺/ay
  DIAMOND_P1  = 'DIAMOND_P1',   // 2.999₺/ay
  DIAMOND_P2  = 'DIAMOND_P2',   // 4.999₺/ay
}

// Abonelik aylık ücretleri (₺)
export const SUBSCRIPTION_FEES: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BRONZE_P1]:  199,
  [SubscriptionTier.BRONZE_P2]:  399,
  [SubscriptionTier.SILVER_P1]:  699,
  [SubscriptionTier.SILVER_P2]:  999,
  [SubscriptionTier.GOLD_P1]:    1_499,
  [SubscriptionTier.GOLD_P2]:    1_999,
  [SubscriptionTier.DIAMOND_P1]: 2_999,
  [SubscriptionTier.DIAMOND_P2]: 4_999,
};

// Aylık breakeven ciro eşiği (5× aidat)
export const SUBSCRIPTION_BREAKEVEN: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BRONZE_P1]:  4_975,
  [SubscriptionTier.BRONZE_P2]:  7_980,
  [SubscriptionTier.SILVER_P1]:  11_650,
  [SubscriptionTier.SILVER_P2]:  14_271,
  [SubscriptionTier.GOLD_P1]:    18_738,
  [SubscriptionTier.GOLD_P2]:    22_211,
  [SubscriptionTier.DIAMOND_P1]: 29_990,
  [SubscriptionTier.DIAMOND_P2]: 41_658,
};

export enum MissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLAIMED = 'CLAIMED'
}

export enum RewardType {
  XP = 'XP',
  DISCOUNT = 'DISCOUNT',
  BADGE = 'BADGE'
}
