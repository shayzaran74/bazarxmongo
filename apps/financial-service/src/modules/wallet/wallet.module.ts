import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaWalletRepository } from './infrastructure/persistence/prisma-wallet.repository';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletMapper } from './infrastructure/persistence/mappers/wallet.mapper';
import { TopUpWalletHandler } from './application/commands/topup-wallet.handler';
import { ApproveTopUpHandler } from './application/commands/approve-topup.handler';
import { RejectTopUpHandler } from './application/commands/reject-topup.handler';
import { GetBalanceHandler } from './application/queries/get-balance.handler';
import { GetTransactionsHandler } from './application/queries/get-transactions.handler';
import { WalletGrpcController } from './presentation/wallet.grpc.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const CommandHandlers = [TopUpWalletHandler, ApproveTopUpHandler, RejectTopUpHandler];
const QueryHandlers = [GetBalanceHandler, GetTransactionsHandler];
const Repositories = [
  {
    provide: 'IWalletRepository',
    useClass: PrismaWalletRepository,
  },
];

@Module({
  imports: [CqrsModule, LedgerModule],
  controllers: [WalletGrpcController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    PrismaService,
    PrismaWalletRepository,
    WalletMapper,
  ],
  exports: ['IWalletRepository'],
})
export class WalletModule {}
