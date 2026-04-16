// apps/backend/src/modules/financial-gateway/financial-gateway.module.ts

import { Module, Global } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { financialGrpcClientOptions } from './grpc/financial-grpc.client';
import { WalletGrpcService } from './grpc/wallet-grpc.service';
import { EscrowGrpcService } from './grpc/escrow-grpc.service';
import { FinancialGatewayService } from './financial-gateway.service';

@Global()
@Module({
  imports: [
    ClientsModule.register(financialGrpcClientOptions),
  ],
  providers: [
    WalletGrpcService,
    EscrowGrpcService,
    FinancialGatewayService,
  ],
  exports: [FinancialGatewayService],
})
export class FinancialGatewayModule {}
