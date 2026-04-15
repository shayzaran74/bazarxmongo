// apps/financial-service/src/modules/commission/commission.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommissionCalculatorService } from './domain/services/commission-calculator.service';
import { PrismaCommissionRepository } from './infrastructure/persistence/prisma-commission.repository';
import { CommissionMapper } from './infrastructure/persistence/mappers/commission.mapper';
import { CalculateCommissionHandler } from './application/commands/calculate-commission.handler';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [CqrsModule, WalletModule],
  providers: [
    CommissionCalculatorService,
    CalculateCommissionHandler,
    CommissionMapper,
    {
      provide: 'ICommissionRepository',
      useClass: PrismaCommissionRepository,
    },
  ],
  exports: [CommissionCalculatorService],
})
export class CommissionModule {}
