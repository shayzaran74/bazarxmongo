import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@barterborsa/shared-security';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) {
    this.accessSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;

    if (!this.accessSecret) {
      throw new Error('JWT_SECRET (or JWT_ACCESS_SECRET) is required but not defined in environment variables');
    }
    if (!this.refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is required but not defined in environment variables');
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

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.refreshSecret
      });

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
      const payload = this.jwtService.decode(token) as any;
      if (payload && payload.jti) {
        await this.blacklistToken(payload.jti, 7 * 24 * 60 * 60); // 7 days
      }
    } catch (e) {
      // Ignore decode errors
    }
  }
}
