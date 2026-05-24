// apps/backend/src/modules/vendor/domain/constants/ecosystem.constants.ts

export const ECOSYSTEM_MEMBERSHIP_LIMITS: Record<string, number> = {
  CORE: 2,
  PRIME: 5,
  ELITE: 10,
  APEX: 0, // APEX kendi ekosistemini kurar, başkasına üye olamaz
} as const;

export const ECOSYSTEM_MEMBERSHIP_LIMIT_TOKEN = 'ECOSYSTEM_MEMBERSHIP_LIMITS';

export const TIER_UPGRADE_MAP: Record<string, string | null> = {
  CORE: 'PRIME',
  PRIME: 'ELITE',
  ELITE: 'APEX',
  APEX: null,
};