// apps/backend/src/modules/identity/infrastructure/auth/token.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@barterborsa/shared-security';

/**
 * Token yönetimi ve rotasyonundan sorumlu servis.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) {}

  /**
   * 15 dakika ömürlü Access Token üretir.
   */
  async generateAccessToken(user: { id: string; email: string; role: string; platform: string }): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      platform: user.platform
    };
    
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-key-123',
      expiresIn: '15m'
    });
  }

  /**
   * 7 gün ömürlü Refresh Token üretir.
   */
  async generateRefreshToken(user: { id: string; email: string }): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email
    };
    
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key-123',
      expiresIn: '7d'
    });
  }

  /**
   * Token'ı Redis blacklist'e ekleyerek geçersiz kılar (Logout için).
   */
  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    await this.redisService.set(`blacklist:${token}`, '1', expiresInSeconds);
  }

  /**
   * Token'ın blacklist'te olup olmadığını kontrol eder.
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisService.get(`blacklist:${token}`);
    return result !== null;
  }
}
