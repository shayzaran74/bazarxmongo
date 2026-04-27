// packages/shared/shared-security/src/shared-security.module.ts

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HashingService } from './encryption/hashing.service';
import { EncryptionService } from './encryption/encryption.service';
import { RedisService } from './redis/redis.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { GoogleOAuthStrategy } from './auth/google-oauth.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
          throw new Error('JWT_ACCESS_SECRET is required but not defined in environment variables');
        }
        return {
          secret,
          signOptions: { 
            expiresIn: '15m'
          },
        };
      },
    }),
  ],
  providers: [
    HashingService,
    EncryptionService,
    RedisService,
    JwtStrategy,
    GoogleOAuthStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    HashingService,
    EncryptionService,
    RedisService,
    JwtStrategy,
    GoogleOAuthStrategy,
    JwtModule,
    PassportModule,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class SharedSecurityModule {}
