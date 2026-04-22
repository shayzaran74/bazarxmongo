import { Module, Global } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { financialGrpcClientOptions } from './grpc/financial-grpc.client';
import { WalletGrpcService } from './grpc/wallet-grpc.service';
import { EscrowGrpcService } from './grpc/escrow-grpc.service';
import { FinancialGatewayService } from './financial-gateway.service';
import { WalletController } from './presentation/wallet.controller';
import { WalletAdminController } from './presentation/wallet-admin.controller';

// Query Handlers
import { GetWalletBalanceHandler } from './application/queries/get-wallet-balance.handler';
import { GetWalletTransactionsHandler } from './application/queries/get-wallet-transactions.handler';
import { GetWithdrawalsHandler } from './application/queries/get-withdrawals.handler';
import { GetWalletRequestsHandler } from './application/queries/get-wallet-requests.handler';

// Command Handlers
import { TopUpWalletHandler } from './application/commands/top-up-wallet.handler';
import { RequestWithdrawalHandler } from './application/commands/request-withdrawal.handler';

const QueryHandlers = [
  GetWalletBalanceHandler,
  GetWalletTransactionsHandler,
  GetWithdrawalsHandler,
  GetWalletRequestsHandler,
];

const CommandHandlers = [
  TopUpWalletHandler,
  RequestWithdrawalHandler,
];

@Global()
@Module({
  imports: [
    CqrsModule,
    ClientsModule.register(financialGrpcClientOptions),
  ],
  controllers: [WalletController, WalletAdminController],
  providers: [
    WalletGrpcService,
    EscrowGrpcService,
    FinancialGatewayService,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [FinancialGatewayService],
})
export class FinancialGatewayModule {}
