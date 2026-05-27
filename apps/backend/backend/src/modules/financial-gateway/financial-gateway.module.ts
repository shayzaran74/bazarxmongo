import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { financialGrpcClientOptions } from './grpc/financial-grpc.client';
import { WalletGrpcService } from './grpc/wallet-grpc.service';
import { EscrowGrpcService } from './grpc/escrow-grpc.service';
import { FinancialGatewayService } from './financial-gateway.service';
import { WalletController } from './presentation/wallet.controller';
import { WalletAdminController } from './presentation/wallet-admin.controller';
import { CircuitBreakerService } from '../../common/resilience/circuit-breaker.service';

import { GetWalletBalanceHandler } from './application/queries/get-wallet-balance.handler';
import { GetWalletTransactionsHandler } from './application/queries/get-wallet-transactions.handler';
import { GetWithdrawalsHandler } from './application/queries/get-withdrawals.handler';
import { GetWalletRequestsHandler } from './application/queries/get-wallet-requests.handler';

import { TopUpWalletHandler } from './application/commands/top-up-wallet.handler';
import { RequestWithdrawalHandler } from './application/commands/request-withdrawal.handler';
import { ProcessWalletRequestHandler } from './application/commands/process-wallet-request.handler';
import { ProcessWithdrawalHandler } from './application/commands/process-withdrawal.handler';

import { AuditMongooseModule } from '../audit/audit-mongoose.module';

const QueryHandlers = [
  GetWalletBalanceHandler,
  GetWalletTransactionsHandler,
  GetWithdrawalsHandler,
  GetWalletRequestsHandler,
];

const CommandHandlers = [
  TopUpWalletHandler,
  RequestWithdrawalHandler,
  ProcessWalletRequestHandler,
  ProcessWithdrawalHandler,
];

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register(financialGrpcClientOptions),
    AuditMongooseModule,
  ],
  controllers: [WalletController, WalletAdminController],
  providers: [
    WalletGrpcService,
    EscrowGrpcService,
    FinancialGatewayService,
    CircuitBreakerService,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [FinancialGatewayService],
})
export class FinancialGatewayModule {}
