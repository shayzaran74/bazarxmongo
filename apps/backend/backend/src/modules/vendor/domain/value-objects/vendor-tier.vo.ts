// apps/backend/src/modules/vendor/domain/value-objects/vendor-tier.vo.ts
// Master Plan v4.3 — TicariTakas komisyon ve havuz yapısı

import { ValueObject } from '@barterborsa/shared-core';
import { VendorTier } from '../enums/vendor-tier.enum';

interface VendorTierProps {
  value: VendorTier;
}

const ANNUAL_FEES: Record<VendorTier, number> = {
  [VendorTier.CORE]:  12_000,
  [VendorTier.PRIME]: 48_000,
  [VendorTier.ELITE]: 120_000,
  [VendorTier.APEX]:  300_000,
};

const POOL_LIMITS: Record<VendorTier, number> = {
  [VendorTier.CORE]:  150_000,
  [VendorTier.PRIME]: 500_000,
  [VendorTier.ELITE]: 1_500_000,
  [VendorTier.APEX]:  10_000_000,
};

const XP_EARN_RATES: Record<VendorTier, number> = {
  [VendorTier.CORE]:  50,
  [VendorTier.PRIME]: 70,
  [VendorTier.ELITE]: 85,
  [VendorTier.APEX]:  100,
};

export class VendorTierVO extends ValueObject<VendorTierProps> {
  get value(): VendorTier { return this.props.value; }

  private constructor(props: VendorTierProps) { super(props); }

  public static create(tier: VendorTier): VendorTierVO {
    return new VendorTierVO({ value: tier });
  }

  // Standart komisyon oranı (%)
  public getCommissionRate(): number {
    switch (this.props.value) {
      case VendorTier.CORE:  return 12.0;
      case VendorTier.PRIME: return 10.0;
      case VendorTier.ELITE: return 8.0;
      case VendorTier.APEX:  return 6.0;
      default:               return 12.0;
    }
  }

  // Grup içi takas oranı (BarterBorsa)
  public getGroupCommissionRate(): number {
    switch (this.props.value) {
      case VendorTier.CORE:  return 9.0;
      case VendorTier.PRIME: return 8.0;
      case VendorTier.ELITE: return 7.0;
      case VendorTier.APEX:  return 6.0;
      default:               return 9.0;
    }
  }

  // XP indirimi sonrası oran (standart × %50)
  public getXpDiscountedRate(): number {
    return this.getCommissionRate() * 0.5;
  }

  public getAnnualFee(): number    { return ANNUAL_FEES[this.props.value]; }
  public getPoolLimit(): number    { return POOL_LIMITS[this.props.value]; }
  public getXpEarnRate(): number   { return XP_EARN_RATES[this.props.value]; }
}
