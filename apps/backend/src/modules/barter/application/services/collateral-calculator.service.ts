// apps/backend/src/modules/barter/application/services/collateral-calculator.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class CollateralCalculatorService {
  private readonly DEFAULT_PERCENTAGE = 0.25;

  public calculateCollateral(totalTradeValue: number): number {
    // Default 25% of trade value
    return totalTradeValue * this.DEFAULT_PERCENTAGE;
  }
}
