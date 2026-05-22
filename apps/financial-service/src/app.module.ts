// apps/financial-service/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { LoggerModule, HealthModule } from '@barterborsa/shared-observability';
import { WalletModule }     from './modules/wallet/wallet.module';
import { LedgerModule }     from './modules/ledger/ledger.module';
import { CommissionModule } from './modules/commission/commission.module';
import { EscrowModule }     from './modules/escrow/escrow.module';
import { Connection } from 'mongoose';
import { ConnectionRegistry } from '@barterborsa/shared-persistence';

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
        maxPoolSize: 50,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
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
export class AppModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    ConnectionRegistry.registerConnection('default', this.connection);
  }
}
