// apps/backend/src/modules/menu/domain/menu-category.constants.ts
// BazarX-GO §6 — Tier ↔ Menü Kategorisi Erişim Haritası

/** Kategori numaraları (düşük = daha üst segment) */
export const MENU_CATEGORIES = {
  1: 'VIP & Fine Dining',
  2: 'Mid-Point & New Casual',
  3: 'Casual Dining & Yerel Lezzetler',
  4: 'Tatlı & Pastane',
  5: 'Kahve & İçecek',
  6: 'Dondurma & Ekler',
} as const;

/**
 * Her tier için erişilebilir kategori numaraları.
 * Tier yükseldikçe daha üst (düşük numaralı) kategorilere erişim açılır.
 * Değer = bu tier'ın erişebildiği en yüksek (düşük numaralı) kategori.
 * 1 = tüm kategoriler, 6 = yalnızca Dondurma & Ekler.
 */
export const TIER_MIN_CATEGORY: Record<string, number> = {
  BRONZE_P1:  6,
  BRONZE_P2:  5,
  SILVER_P1:  4,
  SILVER_P2:  3,
  GOLD_P1:    2,
  GOLD_P2:    2,
  DIAMOND_P1: 1,
  DIAMOND_P2: 1,
};

/**
 * Kullanıcının tier'ına göre bir menü kategorisine erişip erişemeyeceğini kontrol eder.
 * @param userTier  Kullanıcının abonelik tier'ı (ör: 'BRONZE_P1')
 * @param menuCategory Menünün kategori numarası (1-6)
 */
export function canAccessCategory(userTier: string, menuCategory: number): boolean {
  const minCategory = TIER_MIN_CATEGORY[userTier];
  if (minCategory === undefined) return false; // bilinmeyen tier → erişim yok
  return menuCategory >= minCategory; // kategori numarası >= min (daha düşük segment)
}
