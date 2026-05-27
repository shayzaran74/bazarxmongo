// apps/backend/src/modules/vendor/domain/enums/vendor-score-type.enum.ts

export enum VendorScoreType {
  /**
   * Ticari Performans — %40 ağırlık
   * Tamamlanan takas hızı. 90 günde işlem yoksa −10 puan/ay.
   */
  COMMERCIAL_PERFORMANCE = 'COMMERCIAL_PERFORMANCE',

  /**
   * XP Sadakati — %30 ağırlık
   * Cüzdandaki XP miktarı. Bakiye sıfırlanırsa −5 puan/ay.
   */
  XP_LOYALTY = 'XP_LOYALTY',

  /**
   * Uyumluluk — %30 ağırlık
   * Price Floor ve kota uyumu.
   * 1. ihlal = uyarı, 2. ihlal = −15 puan, 3. ihlal = dondurma.
   */
  COMPLIANCE = 'COMPLIANCE',
}