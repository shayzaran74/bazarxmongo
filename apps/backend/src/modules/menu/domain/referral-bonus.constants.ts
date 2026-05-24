// apps/backend/src/modules/menu/domain/referral-bonus.constants.ts
// BazarX-GO §7 — Referans Bonus Algoritması
// 3. referansın üye olmasıyla bonus devreye girer.
// Düzeltme 2: Yukarı yuvarlama — findTierByReferralTotal ceiling algoritması.

import { TIER_MIN_CATEGORY } from './menu-category.constants';

/** §7 Tier haritası (aidat aralığına göre eşleştirme) — bonusTier her satırda */
const REFERRAL_TIER_MAP: { tier: string; minAidat: number; maxAidat: number; bonusTier: string | null }[] = [
  { tier: 'BRONZE_P1',  minAidat: 0,     maxAidat: 398,   bonusTier: null },
  { tier: 'BRONZE_P2',  minAidat: 399,   maxAidat: 698,   bonusTier: 'BRONZE_P1' },
  { tier: 'SILVER_P1',  minAidat: 699,   maxAidat: 998,   bonusTier: 'BRONZE_P2' },
  { tier: 'SILVER_P2',  minAidat: 999,   maxAidat: 1_498, bonusTier: 'SILVER_P1' },
  { tier: 'GOLD_P1',    minAidat: 1_499, maxAidat: 1_998, bonusTier: 'SILVER_P2' },
  { tier: 'GOLD_P2',    minAidat: 1_999, maxAidat: 2_998, bonusTier: 'GOLD_P1' },
  { tier: 'DIAMOND_P1', minAidat: 2_999, maxAidat: 4_998, bonusTier: 'GOLD_P2' },
  { tier: 'DIAMOND_P2', minAidat: 4_999, maxAidat: Infinity, bonusTier: 'DIAMOND_P1' },
];

const TIER_ORDER = [
  'BRONZE_P1', 'BRONZE_P2', 'SILVER_P1', 'SILVER_P2',
  'GOLD_P1',   'GOLD_P2',   'DIAMOND_P1', 'DIAMOND_P2',
];

/** Referans hakları: ay → hak sayısı */
export const REFERRAL_RIGHTS_PER_MONTH = (subscriptionMonth: number): number =>
  subscriptionMonth === 1 ? 3 : 1;

/**
 * §7 — Yukarı yuvarlama: en düşük tier'ı bul where totalAidat <= maxAidat.
 * 1.479₺ → GOLD_P1 (maxAidat=1.998) ✓
 * 1.999₺ → GOLD_P2 (maxAidat=2.998) ✓
 */
export function findTierByReferralTotal(totalAidat: number): typeof REFERRAL_TIER_MAP[number] {
  const matched = REFERRAL_TIER_MAP.find(t => totalAidat <= t.maxAidat);
  return matched ?? REFERRAL_TIER_MAP[REFERRAL_TIER_MAP.length - 1];
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
 * Düzeltme 2: matched.bonusTier kullanır — getBonusTier() ayrıca çağrılmaz.
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
  const total = paidAmounts.reduce((s, a) => s + a, 0);
  const matched = findTierByReferralTotal(total);
  const bonusTier = matched.bonusTier ?? getBonusTier(matched.tier);
  const bonusCategory = TIER_MIN_CATEGORY[bonusTier] ?? 6;

  return { total, matchedTier: matched.tier, bonusTier, bonusCategory };
}

/** §7 XP kazanımı */
export const REFERRAL_XP = {
  toReferrer: 20,  // her referansta
  toReferee:  10,  // karşılama bonusu
};

/** Bonus menü geçerlilik süresi (gün) */
export const REFERRAL_BONUS_TTL_DAYS = 45;
