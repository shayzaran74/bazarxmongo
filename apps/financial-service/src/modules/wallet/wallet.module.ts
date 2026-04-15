// apps/financial-service/src/modules/wallet/wallet.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaWalletRepository } from './infrastructure/persistence/prisma-wallet.repository';
import { WalletMapper } from './infrastructure/persistence/mappers/wallet.mapper';
import { TopUpWalletHandler } from './application/commands/topup-wallet.handler';
import { GetBalanceHandler } from './application/queries/get-balance.handler';
import { WalletGrpcController } from './presentation/wallet.grpc.controller';

const CommandHandlers = [TopUpWalletHandler];
const QueryHandlers = [GetBalanceHandler];
const Repositories = [
  {
    provide: 'IWalletRepository',
    useClass: PrismaWalletRepository,
  },
];

@Module({
  imports: [CqrsModule],
  controllers: [WalletGrpcController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    PrismaWalletRepository,
    WalletMapper,
    {
      provide: 'IWalletRepository',
      useClass: PrismaWalletRepository,
    }
  ],
  exports: ['IWalletRepository'],
})
export class WalletModule {}
