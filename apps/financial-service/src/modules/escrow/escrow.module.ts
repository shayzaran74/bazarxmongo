// apps/financial-service/src/modules/escrow/escrow.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaEscrowRepository } from './infrastructure/persistence/prisma-escrow.repository';
import { EscrowMapper } from './infrastructure/persistence/mappers/escrow.mapper';
import { CreateEscrowHandler } from './application/commands/create-escrow.handler';
import { EscrowConsumer } from './infrastructure/messaging/escrow.consumer';

import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';
import { EscrowGrpcController } from './presentation/escrow.grpc.controller';

@Module({
  imports: [CqrsModule, WalletModule, LedgerModule],
  controllers: [EscrowGrpcController],
  providers: [
    CreateEscrowHandler,
    EscrowConsumer,
    EscrowMapper,
    {
      provide: 'IEscrowRepository',
      useClass: PrismaEscrowRepository,
    },
  ],
  exports: ['IEscrowRepository'],
})
export class EscrowModule {}
