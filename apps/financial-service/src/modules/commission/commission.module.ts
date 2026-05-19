// apps/financial-service/src/modules/commission/commission.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FinancialCommissionRecordSchema,
  WalletSchema,
  FinancialGeneralLedgerSchema,
} from '@barterborsa/shared-persistence';

import { CommissionCalculatorService }  from './domain/services/commission-calculator.service';
import { CalculateCommissionHandler }   from './application/commands/calculate-commission.handler';
import { MongoCommissionRepository }    from './infrastructure/persistence/mongo-commission.repository';
import { CommissionMapper }             from './infrastructure/persistence/mappers/commission.mapper';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'CommissionRecord', schema: FinancialCommissionRecordSchema },
      { name: 'Wallet',           schema: WalletSchema },
      { name: 'GeneralLedger',    schema: FinancialGeneralLedgerSchema },
    ]),
  ],
  providers: [
    CommissionCalculatorService,
    CalculateCommissionHandler,
    CommissionMapper,
    MongoCommissionRepository,
    { provide: 'ICommissionRepository', useClass: MongoCommissionRepository },
  ],
  exports: [CommissionCalculatorService, 'ICommissionRepository'],
})
export class CommissionModule {}
