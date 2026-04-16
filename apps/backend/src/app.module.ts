// apps/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { IdentityModule } from './modules/identity/identity.module';
import { SharedSecurityModule, JwtAuthGuard } from '@barterborsa/shared-security';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    SharedSecurityModule, // Global güvenlik altyapısı
    IdentityModule,
    CatalogModule,
    MarketingModule,
    FinancialGatewayModule,
    VendorModule,
    CommerceModule,
    BarterModule,
    AuctionModule,
    // SUPPORT MODULES
    // CommunicationModule, 
    ContentModule,
    AdvertisingModule,
    LoyaltyModule,
    AnalyticsModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Tüm uygulamayı varsayılan olarak kilitle
    },
  ],
})
export class AppModule {}
