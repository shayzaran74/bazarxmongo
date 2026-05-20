// apps/backend/src/modules/barter/domain/trust-level.constants.ts
// Master Plan v4.3 §3.3 — TrustLevel belirleme kuralları

export type TrustLevelType = 'GOOD' | 'FAIR' | 'POOR' | 'SUSPENDED' | 'FROZEN';

/** score → TrustLevel eşleşmesi */
export function scoreToLevel(score: number, isFrozen = false): TrustLevelType {
  if (isFrozen) return 'FROZEN';
  if (score >= 80) return 'GOOD';
  if (score >= 60) return 'FAIR';
  if (score >= 40) return 'POOR';
  if (score >= 20) return 'SUSPENDED';
  return 'FROZEN';
}

/** Uyumluluk ihlal eşiği — 3 ihlalde dondurma */
export const FREEZE_VIOLATION_THRESHOLD = 3;

/** İnactivity cezası başlangıç eşiği (gün) */
export const INACTIVITY_THRESHOLD_DAYS = 90;

/** İnactivity cezası (puan/ay) */
export const INACTIVITY_PENALTY_PER_MONTH = 10;

/** XP sıfır cezası (puan/ay) */
export const LOW_XP_PENALTY_PER_MONTH = 5;
