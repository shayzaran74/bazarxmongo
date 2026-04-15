import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@barterborsa/shared-security';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) {}

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

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token geçersiz (Blacklist)');
      }

      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key-123'
      });
    } catch (e) {
      throw new UnauthorizedException('Geçersiz Refresh Token');
    }
  }

  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    await this.redisService.set(`blacklist:${token}`, '1', expiresInSeconds);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisService.get(`blacklist:${token}`);
    return result !== null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.blacklistToken(token, 7 * 24 * 60 * 60); // 7 days
  }
}
