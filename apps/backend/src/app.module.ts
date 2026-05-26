import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { Connection } from 'mongoose';
import { ConnectionRegistry } from '@barterborsa/shared-persistence';

import { SharedSecurityModule, JwtAuthGuard } from '@barterborsa/shared-security';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { SharedQueueModule } from '@barterborsa/shared-queue';

import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { FinancialGatewayModule } from './modules/financial-gateway/financial-gateway.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { BarterModule } from './modules/barter/barter.module';
import { AuctionModule } from './modules/auction/auction.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { ContentModule } from './modules/content/content.module';
import { AdvertisingModule } from './modules/advertising/advertising.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MediaModule } from './modules/media/media.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AuditMongooseModule } from './modules/audit/audit-mongoose.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { MenuModule } from './modules/menu/menu.module';
import { BarterBorsaModule } from './modules/barterborsa/barterborsa.module';
import { GarageSaleModule } from './modules/garage-sale/garage-sale.module';
import { TaxModule } from './modules/tax/tax.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { HealthModule } from './modules/health/health.module';
import { OutboxProcessorService } from './infrastructure/outbox/outbox-processor.service';
import { TierRateLimitModule } from './infrastructure/rate-limit/tier-rate-limit.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env', '../../../.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        family: 4,
        maxPoolSize: 100,
        minPoolSize: 10,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
        connectionFactory: (connection) => {
          connection.on('connected', () => console.log('=== MONGOOSE CONNECTED TO MongoDB ==='));
          connection.on('error', (err) => console.error('=== MONGOOSE CONNECTION ERROR ===', err));
          connection.on('disconnected', () => console.log('=== MONGOOSE DISCONNECTED ==='));
          return connection;
        },
      }),
    }),
    ScheduleModule.forRoot(),

    // ─── Rate Limiting ─────────────────────────────────────────────
    // İki kural: 'auth' (sıkı) ve 'api' (gevşek)
    // Controller'da @Throttle({ auth: {} }) ile auth kuralı uygulanır
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60_000,
        limit: 5,
      },
      {
        name: 'api',
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // ─── Cache (Redis) ─────────────────────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        const redisUrl = config.get<string>('REDIS_URL');
        
        // Redis için (gerektiğinde yorumdan çıkarın):
        /*
        if (isProd && redisUrl) {
          const { redisStore } = require('cache-manager-ioredis-yet');
          return {
            store: await redisStore({
              url: redisUrl,
              password: config.get<string>('REDIS_PASSWORD'),
              ttl: 300,
            }),
          };
        }
        */

        // Dev ortamı veya Redis kapalıyken — in-memory
        return {
          ttl: isProd ? 300_000 : 30_000, // 5 dk prod, 30 sn dev
          max: 1000,
        };
      },
      inject: [ConfigService],
    }),

    RabbitMQModule,
    SharedQueueModule,
    SharedSecurityModule,

    // ─── Audit (Global) ────────────────────────────────────────────
    AuditMongooseModule,

    // ─── Feature Modules ───────────────────────────────────────────
    SubscriptionModule,
    MenuModule,
    BarterBorsaModule,
    GarageSaleModule,
    TaxModule,
    IdentityModule,
    CatalogModule,
    MarketingModule,
    FinancialGatewayModule,
    VendorModule,
    CommerceModule,
    BarterModule,
    AuctionModule,
    CommunicationModule,
    ContentModule,
    AdvertisingModule,
    LoyaltyModule,
    AnalyticsModule,
    MediaModule,
    InventoryModule,
    DeliveryModule,
    HealthModule,

    // ─── Infrastructure ────────────────────────────────────────────
    TierRateLimitModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    OutboxProcessorService,
  ],
})
export class AppModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    ConnectionRegistry.registerConnection('default', this.connection);
  }
}
