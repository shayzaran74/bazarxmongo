// apps/backend/src/common/utils/regex.utils.ts

/**
 * Kullanıcı girdisindeki özel regex karakterlerini escape eder.
 * $regex filtresine doğrudan kullanıcı girdisi verildiğinde ReDoS saldırısını önler.
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Arama terimi için güvenli MongoDB $regex filtresi üretir.
 * Boş/çok uzun inputu reddeder.
 */
export function safeRegexFilter(input: string, maxLength = 100): { $regex: string; $options: string } | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return { $regex: escapeRegExp(trimmed), $options: 'i' };
}
