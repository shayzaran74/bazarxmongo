// apps/financial-service/src/modules/wallet/wallet.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WalletSchema,
  FinancialAccountSchema,
  FinancialAccountTransactionSchema,
  FinancialGeneralLedgerSchema,
  FinancialAccountTopUpRequestSchema,
  FinancialAccountWithdrawalRequestSchema,
  FinancialGiftCardSchema,
} from '@barterborsa/shared-persistence';

import { MongoWalletRepository }          from './infrastructure/persistence/mongo-wallet.repository';
import { WalletMapper }                   from './infrastructure/persistence/mappers/wallet.mapper';
import { TopUpWalletHandler }             from './application/commands/topup-wallet.handler';
import { ApproveTopUpHandler }            from './application/commands/approve-topup.handler';
import { RejectTopUpHandler }             from './application/commands/reject-topup.handler';
import { GetBalanceHandler }              from './application/queries/get-balance.handler';
import { GetTransactionsHandler }         from './application/queries/get-transactions.handler';
import { WalletReconciliationScheduler }  from './application/services/wallet-reconciliation.scheduler';
import { WalletGrpcController }           from './presentation/wallet.grpc.controller';

const CommandHandlers = [TopUpWalletHandler, ApproveTopUpHandler, RejectTopUpHandler];
const QueryHandlers   = [GetBalanceHandler, GetTransactionsHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Wallet',                   schema: WalletSchema },
      { name: 'Account',                  schema: FinancialAccountSchema },
      { name: 'AccountTransaction',       schema: FinancialAccountTransactionSchema },
      { name: 'GeneralLedger',            schema: FinancialGeneralLedgerSchema },
      { name: 'AccountTopUpRequest',      schema: FinancialAccountTopUpRequestSchema },
      { name: 'AccountWithdrawalRequest', schema: FinancialAccountWithdrawalRequestSchema },
      { name: 'GiftCard',                 schema: FinancialGiftCardSchema },
    ]),
  ],
  controllers: [WalletGrpcController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    WalletMapper,
    MongoWalletRepository,
    { provide: 'IWalletRepository', useClass: MongoWalletRepository },
    WalletReconciliationScheduler,
  ],
  exports: ['IWalletRepository'],
})
export class WalletModule {}
