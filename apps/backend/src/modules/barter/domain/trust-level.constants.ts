// apps/backend/src/modules/barter/domain/trust-level.constants.ts
// Master Plan v4.3 §3.3 — TrustLevel belirleme kuralları

export type TrustLevelType = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'FROZEN';

/** score → TrustLevel eşleşmesi */
export function scoreToLevel(score: number): TrustLevelType {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'POOR';
}

/** Dondurma adayı mı? */
export function isFreezeCandidate(score: number): boolean {
  return score < 40;
}

/** Uyumluluk ihlal eşiği — 3 ihlalde dondurma */
export const FREEZE_VIOLATION_THRESHOLD = 3;

/** İnactivity cezası başlangıç eşiği (gün) */
export const INACTIVITY_THRESHOLD_DAYS = 90;

/** İnactivity cezası (puan/ay) */
export const INACTIVITY_PENALTY_PER_MONTH = 10;

/** XP sıfır cezası (puan/ay) */
export const LOW_XP_PENALTY_PER_MONTH = 5;
