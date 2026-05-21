import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@barterborsa/shared-security';
import { TOKEN_BLACKLIST_TTL_MS } from '@barterborsa/shared-core';

export interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
  platform?: string;
  jti: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) {
    this.accessSecret  = process.env.JWT_ACCESS_SECRET ?? '';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET ?? '';

    TokenService.validateSecret('JWT_ACCESS_SECRET', this.accessSecret);
    TokenService.validateSecret('JWT_REFRESH_SECRET', this.refreshSecret);
  }

  private static validateSecret(name: string, value: string): void {
    if (!value) {
      throw new Error(`${name} tanımlı değil. Uygulama başlatılamaz.`);
    }
    if (value.length < 32) {
      throw new Error(`${name} en az 32 karakter olmalıdır (mevcut: ${value.length}). Güçlü bir secret kullanın.`);
    }
    const commonWeak = ['secret', 'password', 'changeme', '123456', 'jwt_secret', 'your-secret'];
    if (commonWeak.some(w => value.toLowerCase().includes(w))) {
      throw new Error(`${name} zayıf veya varsayılan bir değer içeriyor. Lütfen güçlü, rastgele bir secret kullanın.`);
    }
  }

  generateAccessToken(user: { id: string; email: string; role: string; platform: string }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      platform: user.platform,
      jti: crypto.randomUUID()
    };

    return this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: '15m'
    });
  }

  generateRefreshToken(user: { id: string; email: string }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      jti: crypto.randomUUID()
    };

    return this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d'
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.refreshSecret
      }) as TokenPayload;

      if (payload.jti) {
        const isBlacklisted = await this.isTokenBlacklisted(payload.jti);
        if (isBlacklisted) {
          throw new UnauthorizedException('Token geçersiz (Blacklist)');
        }
      }

      return payload;
    } catch (e) {
      throw new UnauthorizedException('Geçersiz Refresh Token');
    }
  }

  async blacklistToken(jti: string, expiresInSeconds: number): Promise<void> {
    await this.redisService.set(`blacklist:${jti}`, '1', expiresInSeconds);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redisService.get(`blacklist:${jti}`);
    return result !== null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const payload = this.jwtService.decode(token) as TokenPayload | null;
      if (payload && payload.jti) {
        await this.blacklistToken(payload.jti, Math.floor(TOKEN_BLACKLIST_TTL_MS / 1000));
      }
    } catch (e) {
      // Ignore decode errors
    }
  }
}
