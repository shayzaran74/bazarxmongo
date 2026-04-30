// apps/financial-service/src/modules/commission/commission.module.ts

// apps/financial-service/src/modules/commission/commission.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommissionCalculatorService } from './domain/services/commission-calculator.service';
import { CalculateCommissionHandler } from './application/commands/calculate-commission.handler';

@Module({
  imports: [CqrsModule],
  providers: [
    CommissionCalculatorService,
    CalculateCommissionHandler,
  ],
  exports: [CommissionCalculatorService],
})
export class CommissionModule {}
