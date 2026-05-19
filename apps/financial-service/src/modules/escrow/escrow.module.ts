// apps/financial-service/src/modules/escrow/escrow.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FinancialEscrowSchema,
  WalletSchema,
  FinancialAccountSchema,
  FinancialAccountTransactionSchema,
  FinancialGeneralLedgerSchema,
} from '@barterborsa/shared-persistence';

import { MongoEscrowRepository }  from './infrastructure/persistence/mongo-escrow.repository';
import { EscrowMapper }           from './infrastructure/persistence/mappers/escrow.mapper';
import { CreateEscrowHandler }    from './application/commands/create-escrow.handler';
import { ReleaseEscrowHandler }   from './application/commands/release-escrow.handler';
import { RefundEscrowHandler }    from './application/commands/refund-escrow.handler';
import { EscrowConsumer }         from './infrastructure/messaging/escrow.consumer';
import { EscrowGrpcController }   from './presentation/escrow.grpc.controller';
import { CommissionModule }       from '../commission/commission.module';

@Module({
  imports: [
    CqrsModule,
    CommissionModule,
    MongooseModule.forFeature([
      { name: 'Escrow',              schema: FinancialEscrowSchema },
      { name: 'Wallet',              schema: WalletSchema },
      { name: 'Account',             schema: FinancialAccountSchema },
      { name: 'AccountTransaction',  schema: FinancialAccountTransactionSchema },
      { name: 'GeneralLedger',       schema: FinancialGeneralLedgerSchema },
    ]),
  ],
  controllers: [EscrowGrpcController],
  providers: [
    CreateEscrowHandler,
    ReleaseEscrowHandler,
    RefundEscrowHandler,
    EscrowConsumer,
    EscrowMapper,
    MongoEscrowRepository,
    { provide: 'IEscrowRepository', useClass: MongoEscrowRepository },
  ],
  exports: ['IEscrowRepository'],
})
export class EscrowModule {}
