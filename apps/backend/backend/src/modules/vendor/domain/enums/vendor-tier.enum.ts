// apps/backend/src/modules/vendor/domain/enums/vendor-tier.enum.ts
// Master Plan v4.3 — TicariTakas B2B tier yapısı

export enum VendorTier {
  CORE    = 'CORE',    // 12.000₺/yıl — %12 komisyon
  PRIME   = 'PRIME',   // 48.000₺/yıl — %10 komisyon (eski: PLUS)
  ELITE   = 'ELITE',   // 120.000₺/yıl — %8 komisyon (eski: PREMIUM)
  APEX    = 'APEX',    // 300.000₺/yıl — %6 komisyon (eski: ELITE)
}
