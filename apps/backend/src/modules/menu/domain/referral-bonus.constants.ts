// apps/backend/src/modules/menu/domain/referral-bonus.constants.ts
// BazarX-GO §7 — Referans Bonus Algoritması
// 3. referansın üye olmasıyla bonus devreye girer.

import { TIER_MIN_CATEGORY } from './menu-category.constants';

/** §7 Tier haritası (aidat aralığına göre eşleştirme) */
const REFERRAL_TIER_MAP: { tier: string; min: number; max: number }[] = [
  { tier: 'BRONZE_P1',  min: 0,     max: 398  },
  { tier: 'BRONZE_P2',  min: 399,   max: 698  },
  { tier: 'SILVER_P1',  min: 699,   max: 998  },
  { tier: 'SILVER_P2',  min: 999,   max: 1_498 },
  { tier: 'GOLD_P1',    min: 1_499, max: 1_998 },
  { tier: 'GOLD_P2',    min: 1_999, max: 2_998 },
  { tier: 'DIAMOND_P1', min: 2_999, max: 4_998 },
  { tier: 'DIAMOND_P2', min: 4_999, max: Infinity },
];

const TIER_ORDER = [
  'BRONZE_P1', 'BRONZE_P2', 'SILVER_P1', 'SILVER_P2',
  'GOLD_P1',   'GOLD_P2',   'DIAMOND_P1', 'DIAMOND_P2',
];

/** Referans hakları: ay → hak sayısı */
export const REFERRAL_RIGHTS_PER_MONTH = (subscriptionMonth: number): number =>
  subscriptionMonth === 1 ? 3 : 1;

/** §7 — 3 referansın toplam aidatına en yakın tier */
export function findTierByTotal(totalAidat: number): string {
  for (const entry of [...REFERRAL_TIER_MAP].reverse()) {
    if (totalAidat >= entry.min) return entry.tier;
  }
  return 'BRONZE_P1';
}

/**
 * §7 — Bonus tier: eşleşen tier'ın bir altı.
 * BRONZE_P1 için alt tier yok — BRONZE_P1 bonus kategorisinden verilir.
 */
export function getBonusTier(matchedTier: string): string {
  const idx = TIER_ORDER.indexOf(matchedTier);
  if (idx <= 0) return 'BRONZE_P1';
  return TIER_ORDER[idx - 1];
}

/**
 * §7 Ana algoritma — 3 referansın aidatlarından bonus menü kategorisini hesapla.
 *
 * Örnek:
 *   3 × BRONZE_P1 (3×199=597₺) → en yakın tier: BRONZE_P2 → bonus tier: BRONZE_P1 → kategori 6
 *   2×BRONZE_P2 + 1×SILVER_P1 (798+699=1.497₺) → en yakın: GOLD_P1 → bonus: SILVER_P2 → kategori 3
 */
export function calculateReferralBonus(paidAmounts: number[]): {
  total:           number;
  matchedTier:     string;
  bonusTier:       string;
  bonusCategory:   number;
} {
  const total       = paidAmounts.reduce((s, a) => s + a, 0);
  const matchedTier = findTierByTotal(total);
  const bonusTier   = getBonusTier(matchedTier);
  const bonusCategory = TIER_MIN_CATEGORY[bonusTier] ?? 6;

  return { total, matchedTier, bonusTier, bonusCategory };
}

/** §7 XP kazanımı */
export const REFERRAL_XP = {
  toReferrer: 20,  // her referansta
  toReferee:  10,  // karşılama bonusu
};

/** Bonus menü geçerlilik süresi (gün) */
export const REFERRAL_BONUS_TTL_DAYS = 45;
