// apps/backend/src/modules/vendor/domain/value-objects/vendor-tier.vo.ts

import { ValueObject } from '@barterborsa/shared-core';
import { VendorTier } from '../enums/vendor-tier.enum';

interface VendorTierProps {
  value: VendorTier;
}

export class VendorTierVO extends ValueObject<VendorTierProps> {
  get value(): VendorTier {
    return this.props.value;
  }

  private constructor(props: VendorTierProps) {
    super(props);
  }

  public static create(tier: VendorTier): VendorTierVO {
    return new VendorTierVO({ value: tier });
  }

  public getCommissionRate(): number {
    switch (this.props.value) {
      case VendorTier.CORE:
        return 10.0;
      case VendorTier.PLUS:
        return 8.0;
      case VendorTier.PREMIUM:
        return 6.0;
      case VendorTier.ELITE:
        return 4.0;
      default:
        return 10.0;
    }
  }
}
