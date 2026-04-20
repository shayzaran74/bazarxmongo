// apps/backend/src/modules/financial-gateway/financial-gateway.module.ts

import { Module, Global } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { financialGrpcClientOptions } from './grpc/financial-grpc.client';
import { WalletGrpcService } from './grpc/wallet-grpc.service';
import { EscrowGrpcService } from './grpc/escrow-grpc.service';
import { FinancialGatewayService } from './financial-gateway.service';
import { WalletController } from './presentation/wallet.controller';
import { WalletAdminController } from './presentation/wallet-admin.controller';

@Global()
@Module({
  imports: [
    ClientsModule.register(financialGrpcClientOptions),
  ],
  controllers: [
    WalletController,
    WalletAdminController
  ],
  providers: [
    WalletGrpcService,
    EscrowGrpcService,
    FinancialGatewayService,
  ],
  exports: [FinancialGatewayService],
})
export class FinancialGatewayModule {}
