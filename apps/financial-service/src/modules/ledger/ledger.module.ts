// apps/financial-service/src/modules/ledger/ledger.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { FinancialGeneralLedgerSchema } from '@barterborsa/shared-persistence';

import { MongoGeneralLedgerRepository } from './infrastructure/persistence/mongo-general-ledger.repository';
import { LedgerMapper }                 from './infrastructure/persistence/mappers/ledger.mapper';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'GeneralLedger', schema: FinancialGeneralLedgerSchema },
    ]),
  ],
  providers: [
    LedgerMapper,
    MongoGeneralLedgerRepository,
    { provide: 'IGeneralLedgerRepository', useClass: MongoGeneralLedgerRepository },
  ],
  exports: ['IGeneralLedgerRepository'],
})
export class LedgerModule {}
