// apps/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { IdentityModule } from './modules/identity/identity.module';
import { SharedSecurityModule, JwtAuthGuard } from '@barterborsa/shared-security';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    SharedSecurityModule, // Global güvenlik altyapısı
    IdentityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Tüm uygulamayı varsayılan olarak kilitle
    },
  ],
})
export class AppModule {}
