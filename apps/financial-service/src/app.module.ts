// apps/financial-service/src/app.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { LoggerModule, HealthModule } from '@barterborsa/shared-observability';
import { WalletModule }     from './modules/wallet/wallet.module';
import { LedgerModule }     from './modules/ledger/ledger.module';
import { CommissionModule } from './modules/commission/commission.module';
import { EscrowModule }     from './modules/escrow/escrow.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env', '../../../.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017,localhost:27018,localhost:27019/bazarx_financial?replicaSet=rs0'),
        retryWrites: true,
        w: 'majority',
      }),
    }),
    RabbitMQModule,
    LoggerModule,
    HealthModule,
    WalletModule,
    LedgerModule,
    CommissionModule,
    EscrowModule,
  ],
})
export class AppModule {}
