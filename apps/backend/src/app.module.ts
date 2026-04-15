// apps/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { IdentityModule } from './modules/identity/identity.module';
import { SharedSecurityModule, JwtAuthGuard } from '@barterborsa/shared-security';
import { CatalogModule } from './modules/catalog/catalog.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { FinancialGatewayModule } from './modules/financial-gateway/financial-gateway.module';

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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Tüm uygulamayı varsayılan olarak kilitle
    },
  ],
})
export class AppModule {}
