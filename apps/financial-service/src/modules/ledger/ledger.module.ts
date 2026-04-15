// apps/financial-service/src/modules/ledger/ledger.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaGeneralLedgerRepository } from './infrastructure/persistence/prisma-general-ledger.repository';
import { LedgerMapper } from './infrastructure/persistence/mappers/ledger.mapper';

const Repositories = [
  {
    provide: 'IGeneralLedgerRepository',
    useClass: PrismaGeneralLedgerRepository,
  },
];

@Module({
  imports: [CqrsModule],
  providers: [
    ...Repositories,
    PrismaGeneralLedgerRepository,
    LedgerMapper,
  ],
  exports: ['IGeneralLedgerRepository'],
})
export class LedgerModule {}
