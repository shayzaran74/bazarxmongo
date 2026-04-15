// apps/financial-service/src/modules/escrow/escrow.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaEscrowRepository } from './infrastructure/persistence/prisma-escrow.repository';
import { EscrowMapper } from './infrastructure/persistence/mappers/escrow.mapper';
import { CreateEscrowHandler } from './application/commands/create-escrow.handler';

@Module({
  imports: [CqrsModule],
  providers: [
    CreateEscrowHandler,
    EscrowMapper,
    {
      provide: 'IEscrowRepository',
      useClass: PrismaEscrowRepository,
    },
  ],
  exports: ['IEscrowRepository'],
})
export class EscrowModule {}
