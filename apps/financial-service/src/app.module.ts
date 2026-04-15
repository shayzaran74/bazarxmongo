// apps/financial-service/src/app.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { LoggerModule, HealthModule } from '@barterborsa/shared-observability';
import { WalletModule } from './modules/wallet/wallet.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { CommissionModule } from './modules/commission/commission.module';
import { EscrowModule } from './modules/escrow/escrow.module';

@Global()
@Module({
  imports: [
    // Core Infrastructure
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RabbitMQModule,
    LoggerModule,
    HealthModule,

    // Business Modules
    WalletModule,
    LedgerModule,
    CommissionModule,
    EscrowModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
