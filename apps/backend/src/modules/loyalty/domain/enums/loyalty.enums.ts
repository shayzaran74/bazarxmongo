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

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND'
}

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
