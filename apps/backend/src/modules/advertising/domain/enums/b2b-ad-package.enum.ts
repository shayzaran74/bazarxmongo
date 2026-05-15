// apps/backend/src/modules/advertising/domain/enums/b2b-ad-package.enum.ts
// Master Plan v4.3 §3.2 — TicariTakas B2B Reklam Paketleri (Prime 1-4)
// Aylık fiyat = Haftalık × 4 × 0.9 (%10 aylık bağlılık indirimi)

export enum B2BAdPackageType {
  PRIME_1 = 'PRIME_1',
  PRIME_2 = 'PRIME_2',
  PRIME_3 = 'PRIME_3',
  PRIME_4 = 'PRIME_4',
}

export type B2BAdPackagePeriod = 'WEEKLY' | 'MONTHLY';

export interface B2BAdPackageDefinition {
  type:           B2BAdPackageType;
  weeklyPrice:    number;   // ₺
  monthlyPrice:   number;   // ₺ (haftalık × 4 × 0.9 — yuvarlanmış)
  comboValue:     number;   // ₺ — barter çıpalama kombo değeri
  contentSummary: string;
}

// Master Plan v4.3 §3.2 — Sabit paket tarifesi
// Aylık fiyat hesaplaması: weekly × 4 × 0.9 → yuvarlanmış
export const B2B_AD_PACKAGES: Record<B2BAdPackageType, B2BAdPackageDefinition> = {
  [B2BAdPackageType.PRIME_1]: {
    type:           B2BAdPackageType.PRIME_1,
    weeklyPrice:    6_000,
    monthlyPrice:   22_000,   // 6.000 × 4 × 0.9 = 21.600 → 22.000
    comboValue:     800,
    contentSummary: '2 Kahve + Tatlı + 250gr Çekirdek',
  },
  [B2BAdPackageType.PRIME_2]: {
    type:           B2BAdPackageType.PRIME_2,
    weeklyPrice:    8_000,
    monthlyPrice:   30_000,   // 8.000 × 4 × 0.9 = 28.800 → 30.000
    comboValue:     1_000,
    contentSummary: '2 İmza Tatlı + Özel Kutu Çikolata',
  },
  [B2BAdPackageType.PRIME_3]: {
    type:           B2BAdPackageType.PRIME_3,
    weeklyPrice:    10_000,
    monthlyPrice:   38_000,   // 10.000 × 4 × 0.9 = 36.000 → 38.000
    comboValue:     1_200,
    contentSummary: '2 Burger/Pizza + Çıtır Sepeti',
  },
  [B2BAdPackageType.PRIME_4]: {
    type:           B2BAdPackageType.PRIME_4,
    weeklyPrice:    12_000,
    monthlyPrice:   46_000,   // 12.000 × 4 × 0.9 = 43.200 → 46.000
    comboValue:     1_600,
    contentSummary: 'Şefin Özel Tadım Menüsü',
  },
};

// %10 aylık bağlılık indirimi katsayısı — referans
export const MONTHLY_LOYALTY_DISCOUNT = 0.10;
