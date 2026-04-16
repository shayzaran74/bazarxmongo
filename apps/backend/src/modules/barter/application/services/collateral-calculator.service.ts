// apps/backend/src/modules/barter/application/services/collateral-calculator.service.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollateralCalculatorService {
  private readonly DEFAULT_PERCENTAGE = 0.25;

  public calculateCollateral(totalTradeValue: Prisma.Decimal): Prisma.Decimal {
    // Default 25% of trade value
    return totalTradeValue.mul(this.DEFAULT_PERCENTAGE);
  }
}
