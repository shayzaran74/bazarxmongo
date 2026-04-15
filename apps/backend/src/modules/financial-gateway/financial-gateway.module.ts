import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WalletController } from './presentation/wallet.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FINANCIAL_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'financial',
          protoPath: join(__dirname, './grpc/financial.proto'),
          url: '0.0.0.0:50051',
        },
      },
    ]),
  ],
  controllers: [WalletController],
})
export class FinancialGatewayModule {}
