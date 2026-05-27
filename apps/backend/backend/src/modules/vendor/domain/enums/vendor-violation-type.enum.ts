// apps/backend/src/modules/vendor/domain/enums/vendor-violation-type.enum.ts

export enum VendorViolationType {
  /** Price Floor ihlali */
  PRICE_FLOOR_VIOLATION = 'PRICE_FLOOR_VIOLATION',

  /** Kota (quota) ihlali */
  QUOTA_VIOLATION = 'QUOTA_VIOLATION',

  /** SwapSession timeout */
  SWAP_TIMEOUT = 'SWAP_TIMEOUT',

  /** İade (return) reddi */
  RETURN_REJECTED = 'RETURN_REJECTED',

  /** Gecikmiş teslimat */
  DELIVERY_DELAY = 'DELIVERY_DELAY',

  /** Uyumsuz davranış */
  NON_COMPLIANT_BEHAVIOR = 'NON_COMPLIANT_BEHAVIOR',
}